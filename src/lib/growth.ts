"use client";

export type GrowthEventName =
  | "first_visit"
  | "return_visit"
  | "tool_open"
  | "tool_completed"
  | "share_click"
  | "remix_click"
  | "create_started"
  | "publish_completed";

type TrackOptions = {
  toolId?: string;
  path?: string;
  onceKey?: string;
};

type Attribution = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  landingPage: string;
};

const VISITOR_KEY = "wewoo-growth-visitor";
const SESSION_KEY = "wewoo-growth-session";
const FIRST_SEEN_KEY = "wewoo-growth-first-seen";
const LAST_SEEN_KEY = "wewoo-growth-last-seen";
const ATTRIBUTION_KEY = "wewoo-growth-attribution";
const ONCE_PREFIX = "wewoo-growth-once-";

const ALLOWED_EVENTS = new Set<GrowthEventName>([
  "first_visit",
  "return_visit",
  "tool_open",
  "tool_completed",
  "share_click",
  "remix_click",
  "create_started",
  "publish_completed",
]);

type AnalyticsWindow = Window & {
  va?: (event: "event", properties: { name: string; data?: Record<string, string | number> }) => void;
};

const sessionOnceKeys = new Set<string>();

function readStorage(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or quota errors must never block the product.
  }
}

function readSessionStorage(key: string): string {
  try {
    return sessionStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeSessionStorage(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Ignore unavailable storage.
  }
}

function makeId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function ensureVisitor(): { visitorId: string; isNew: boolean } {
  const existing = readStorage(VISITOR_KEY);
  if (existing) return { visitorId: existing, isNew: false };

  const visitorId = makeId();
  writeStorage(VISITOR_KEY, visitorId);
  writeStorage(FIRST_SEEN_KEY, String(Date.now()));
  return { visitorId, isNew: true };
}

function ensureSessionId(): string {
  const existing = readSessionStorage(SESSION_KEY);
  if (existing) return existing;
  const sessionId = makeId();
  writeSessionStorage(SESSION_KEY, sessionId);
  return sessionId;
}

function currentAttribution(): Attribution | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source") || "";
    const medium = params.get("utm_medium") || "";
    const campaign = params.get("utm_campaign") || "";
    const content = params.get("utm_content") || "";
    if (!source && !medium && !campaign && !content) return null;
    return {
      source,
      medium,
      campaign,
      content,
      landingPage: window.location.pathname,
    };
  } catch {
    return null;
  }
}

function readAttribution(): Attribution | null {
  try {
    const raw = readStorage(ATTRIBUTION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Attribution>;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      source: String(parsed.source || ""),
      medium: String(parsed.medium || ""),
      campaign: String(parsed.campaign || ""),
      content: String(parsed.content || ""),
      landingPage: String(parsed.landingPage || ""),
    };
  } catch {
    return null;
  }
}

function ensureAttribution(): Attribution {
  const stored = readAttribution();
  if (stored) return stored;
  const current = currentAttribution();
  if (current) {
    writeStorage(ATTRIBUTION_KEY, JSON.stringify(current));
    return current;
  }
  return { source: "", medium: "", campaign: "", content: "", landingPage: "" };
}

function sendEvent(
  event: GrowthEventName,
  visitorId: string,
  sessionId: string,
  options: TrackOptions,
) {
  const attribution = ensureAttribution();
  const path = options.path || (typeof window !== "undefined" ? window.location.pathname : "");
  const toolId = options.toolId ? options.toolId.slice(0, 80) : "";

  try {
    (window as AnalyticsWindow).va?.("event", {
      name: event,
      data: {
        source: attribution.source,
        medium: attribution.medium,
        campaign: attribution.campaign,
        content: attribution.content,
        ...(toolId ? { tool_id: toolId } : {}),
      },
    });
  } catch {
    // Vercel Analytics is optional.
  }

  const payload = JSON.stringify({
    event,
    visitorId,
    sessionId,
    toolId,
    path,
    source: attribution.source,
    medium: attribution.medium,
    campaign: attribution.campaign,
    content: attribution.content,
    landingPage: attribution.landingPage,
  });

  try {
    if (navigator.sendBeacon?.("/api/growth/event", new Blob([payload], { type: "application/json" }))) {
      return;
    }
    fetch("/api/growth/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Tracking failures must never block the product.
  }
}

/** 首次访问 / 次日回访：每次页面加载最多各一次 */
export function initGrowthTracking() {
  if (typeof window === "undefined") return;

  const { visitorId, isNew } = ensureVisitor();
  if (!visitorId) return;

  const now = Date.now();
  const lastSeen = Number(readStorage(LAST_SEEN_KEY) || 0);
  const today = new Date(now).toDateString();
  const lastDay = lastSeen ? new Date(lastSeen).toDateString() : "";

  ensureAttribution();

  if (isNew) {
    sendEvent("first_visit", visitorId, ensureSessionId(), { path: window.location.pathname });
  } else if (lastDay !== today) {
    sendEvent("return_visit", visitorId, ensureSessionId(), { path: window.location.pathname });
  }

  writeStorage(LAST_SEEN_KEY, String(now));
}

/**
 * 记录一个匿名增长事件。
 * 不接收、不发送工具内的输入内容；toolId 只用于区分工具。
 */
export function trackGrowthEvent(event: GrowthEventName, options: TrackOptions = {}) {
  if (typeof window === "undefined" || !ALLOWED_EVENTS.has(event)) return;
  if (options.onceKey) {
    const key = ONCE_PREFIX + options.onceKey;
    if (sessionOnceKeys.has(key) || readSessionStorage(key)) return;
    sessionOnceKeys.add(key);
    writeSessionStorage(key, "1");
  }

  const { visitorId } = ensureVisitor();
  if (!visitorId) return;
  sendEvent(event, visitorId, ensureSessionId(), options);
}
