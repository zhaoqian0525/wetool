import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, getAdminServiceClient } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * v2.1.0 M3：白名单网络代理（__wewoo.fetch）
 *
 * 安全模型：
 * - 仅 https + 域名白名单（代码内常量，可用 PROXY_ALLOWED_HOSTS 环境变量覆盖）
 * - 仅 GET（初期）；响应大小上限 256KB；Content-Type 白名单（拒绝 text/html 防 XSS 注入工具 DOM）
 * - 超时 10s；限流（登录按用户、游客按 IP）；每次调用写审计日志 proxy_log（表未建则降级 console）
 * - 不代持 Cookie、不转发请求头、不开放任意 URL
 */

const DEFAULT_ALLOWED_HOSTS = [
  "open.er-api.com",
  "api.exchangerate-api.com",
  "api.open-meteo.com",
  "wttr.in",
  "dictionaryapi.dev",
  "api.mymemory.translated.net",
  "api.qrserver.com",
  "api.aladhan.com",
  "restcountries.com",
  "jsonplaceholder.typicode.com",
  "api.coindesk.com",
  "api.ipify.org",
  "ip-api.com",
  "api.quotable.io",
  "official-joke-api.appspot.com",
  "api.adviceslip.com",
  "api.coinbase.com",
  "api.mathjs.org",
].map((h) => h.toLowerCase());

function getAllowedHosts(): string[] {
  const env = process.env.PROXY_ALLOWED_HOSTS;
  if (!env) return DEFAULT_ALLOWED_HOSTS;
  return env.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
}

const MAX_RESPONSE_BYTES = 256 * 1024; // 256KB
const RATE_MIN = 20; // 每分钟
const RATE_DAY = 300; // 每天

/** 内存限流（第一道防线；Vercel 多实例可绕过，审计表落地后升级） */
const rateMap = new Map<string, number[]>();
function checkRate(key: string): boolean {
  const now = Date.now();
  const hits = (rateMap.get(key) ?? []).filter((t) => now - t < 86_400_000);
  const minHits = hits.filter((t) => now - t < 60_000);
  if (minHits.length >= RATE_MIN || hits.length >= RATE_DAY) return false;
  hits.push(now);
  rateMap.set(key, hits);
  if (rateMap.size > 20000) {
    for (const [k, v] of rateMap) {
      if (v.length === 0 || now - v[v.length - 1] > 86_400_000) rateMap.delete(k);
    }
  }
  return true;
}

const ALLOWED_CONTENT_TYPES = ["application/json", "text/plain", "text/csv", "application/xml", "text/xml"];

export async function POST(request: NextRequest) {
  const fwd = request.headers.get("x-forwarded-for");
  const ip = fwd ? (fwd.split(",").pop()?.trim() || "unknown") : "unknown";

  let body: { toolId?: unknown; url?: unknown; method?: unknown; body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const urlRaw = typeof body.url === "string" ? body.url.trim() : "";
  const method = typeof body.method === "string" ? body.method.toUpperCase() : "GET";
  const bodyRaw = typeof body.body === "string" ? body.body : "";
  const toolId = typeof body.toolId === "string" ? body.toolId.slice(0, 100) : "";

  if (!urlRaw) {
    return NextResponse.json({ error: "url 不能为空" }, { status: 400 });
  }
  if (method !== "GET") {
    return NextResponse.json({ error: "当前仅支持 GET 请求" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(urlRaw);
  } catch {
    return NextResponse.json({ error: "URL 格式错误" }, { status: 400 });
  }
  if (parsed.protocol !== "https:") {
    return NextResponse.json({ error: "仅允许 https 链接" }, { status: 400 });
  }

  const host = parsed.hostname.toLowerCase();
  const allowed = getAllowedHosts();
  const ok = allowed.some((h) => host === h || host.endsWith("." + h));
  if (!ok) {
    return NextResponse.json({ error: "该域名不在白名单内，无法联网访问" }, { status: 403 });
  }

  // 鉴权（登录可选；登录用户按 userId 限流，游客按 IP）
  const ctx = await getAuthedSupabase(request);
  const rateKey = ctx ? ctx.userId : ip;
  if (!checkRate(rateKey)) {
    return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(urlRaw, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, text/csv, application/xml",
        "User-Agent": "WeWoo-Proxy/2.1 (+https://we-woo.net)",
      },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "目标服务连接失败或超时" }, { status: 502 });
  }

  const contentType = (upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "目标返回的内容类型不受支持（仅允许 JSON/文本/CSV）", contentType },
      { status: 502 }
    );
  }

  const text = await upstream.text().catch(() => "");
  if (text.length > MAX_RESPONSE_BYTES) {
    return NextResponse.json({ error: "响应内容超过大小限制（256KB）" }, { status: 502 });
  }

  // 审计日志（表未初始化时降级 console，不阻断）
  try {
    const svc = getAdminServiceClient();
    if (svc) {
      await svc.from("proxy_log").insert({
        tool_id: toolId || null,
        user_id: ctx?.userId ?? null,
        ip,
        url: urlRaw.slice(0, 500),
        status: upstream.status,
        size: text.length,
      });
    } else {
      console.log("[proxy-log]", JSON.stringify({ toolId, userId: ctx?.userId ?? null, ip, url: urlRaw.slice(0, 200), status: upstream.status, size: text.length }));
    }
  } catch {
    // 审计失败不阻断
  }

  return NextResponse.json({
    ok: true,
    status: upstream.status,
    data: text,
    contentType,
  });
}
