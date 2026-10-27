import { NextResponse } from "next/server";
import { getAdminServiceClient } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ALLOWED_EVENTS = new Set([
  "first_visit",
  "return_visit",
  "tool_open",
  "tool_completed",
  "share_click",
  "remix_click",
  "create_started",
  "publish_completed",
]);

/**
 * 兼容 v2.27.0 已发出的旧事件名。
 * 新客户端统一使用通用事件；旧缓存页面仍可正常归因。
 */
const LEGACY_EVENT_MAP: Record<string, { event: string; toolId?: string }> = {
  hourly_wage_landing_view: { event: "tool_open", toolId: "hourly-wage-landing" },
  hourly_wage_calculated: { event: "tool_completed", toolId: "hourly-wage-landing" },
  hourly_wage_shared: { event: "share_click", toolId: "hourly-wage-landing" },
  hourly_wage_full_tool_click: {
    event: "tool_open",
    toolId: "c800bd9b-09bb-4dd0-a1f0-ac67f6e3a7a8",
  },
};

const MAX_BODY_CHARS = 4096;
const ALLOWED_ORIGINS = new Set([
  "https://we-woo.net",
  "https://www.we-woo.net",
]);
let warnedMissingTable = false;

function clean(value: unknown, maxLength = 160) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function originAllowed(origin: string | null): boolean {
  if (!origin) return true;
  if (origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
    return true;
  }
  return ALLOWED_ORIGINS.has(origin);
}

function deviceFromUserAgent(userAgent: string): string {
  if (/iPad|Tablet|PlayBook|Silk/i.test(userAgent)) return "tablet";
  if (/Mobi|Android|iPhone|iPod/i.test(userAgent)) return "mobile";
  return "desktop";
}

function isMissingTableError(message: string): boolean {
  return (
    message.includes("Could not find the table") ||
    message.includes("PGRST205") ||
    message.includes("schema cache")
  );
}

export async function POST(request: Request) {
  if (!originAllowed(request.headers.get("origin"))) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  if (raw.length > MAX_BODY_CHARS) {
    return NextResponse.json({ error: "body_too_large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const rawEvent = clean(body.event, 64);
  const legacy = LEGACY_EVENT_MAP[rawEvent];
  const event = legacy ? legacy.event : rawEvent;
  if (!ALLOWED_EVENTS.has(event)) {
    return NextResponse.json({ error: "unsupported_event" }, { status: 400 });
  }

  const visitorId = clean(body.visitorId, 64);
  if (!visitorId) {
    return NextResponse.json({ error: "visitor_required" }, { status: 400 });
  }

  const toolId = clean(body.toolId, 80) || legacy?.toolId || "";
  const record = {
    event,
    visitor_id: visitorId,
    session_id: clean(body.sessionId, 64) || null,
    tool_id: toolId || null,
    source: clean(body.source, 64) || null,
    medium: clean(body.medium, 64) || null,
    campaign: clean(body.campaign, 64) || null,
    landing_page: clean(body.landingPage, 160) || null,
    path: clean(body.path, 160) || null,
    device_type: deviceFromUserAgent(request.headers.get("user-agent") || ""),
    country:
      clean(request.headers.get("x-vercel-ip-country"), 8) ||
      clean(request.headers.get("cf-ipcountry"), 8) ||
      null,
  };

  const admin = getAdminServiceClient();
  if (!admin) {
    console.warn("[growth] service_role_not_configured");
    return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }

  const { error } = await admin.from("growth_events").insert(record);
  if (error) {
    if (isMissingTableError(error.message)) {
      if (!warnedMissingTable) {
        warnedMissingTable = true;
        console.warn(
          "[growth] growth_events table missing; run supabase_v227_growth_events.sql",
        );
      }
      // 表未创建时不写 Storage，避免继续产生无法聚合的散落文件。
      console.info("[growth]", JSON.stringify(record));
    } else {
      console.warn("[growth] insert_failed", error.message);
    }
  }

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}
