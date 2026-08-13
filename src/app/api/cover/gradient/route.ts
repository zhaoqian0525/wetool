import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, unauthorizedResponse } from "@/lib/api-auth";
import { renderCoverPng } from "@/lib/coverServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// v1.15.6??????? Chromium + ?????????? 90s
export const maxDuration = 90;

/** ?? / emoji ???? */
const MAX_TITLE_LEN = 60;
const MAX_EMOJI_LEN = 8;
/** ????????? GRADIENT_PAIRS[0] ??? */
const DEFAULT_COLORS: [string, string] = ["#4F46E5", "#22D3EE"];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** ?????????????? + emoji + ?? + ????? */
function buildGradientDocument(title: string, emoji: string, colors: [string, string]): string {
  const safeTitle = escapeHtml(title.slice(0, MAX_TITLE_LEN));
  const safeEmoji = escapeHtml((emoji || "??").slice(0, MAX_EMOJI_LEN));
  const [c1, c2] = colors;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 375px; height: 667px; overflow: hidden; }
  body {
    font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
    background: linear-gradient(135deg, ${c1} 0%, ${c2} 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .emoji {
    font-family: "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif;
    font-size: 88px; line-height: 1.2; text-align: center;
  }
  .title {
    font-size: 22px; font-weight: 700; color: rgba(255, 255, 255, 0.95);
    text-align: center; max-width: 300px; margin-top: 28px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .brand {
    position: absolute; bottom: 30px; left: 0; right: 0; text-align: center;
    font-size: 12px; color: rgba(255, 255, 255, 0.6);
  }
</style>
</head>
<body>
  <div class="emoji">${safeEmoji}</div>
  <div class="title">${safeTitle}</div>
  <div class="brand">?? WeWoo</div>
</body>
</html>`;
}


/**
 * POST /api/cover/gradient
 * Body: { title: string, emoji?: string, colors?: [string, string] }
 * ??????????????????? 375x667 PNG?
 * ?? iOS Safari canvas ?? emoji ?? / ????????????????
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthedSupabase(request);
  if (!auth) return unauthorizedResponse();

  let body: { title?: unknown; emoji?: unknown; colors?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "empty title" }, { status: 400 });
  }
  const emoji = typeof body?.emoji === "string" ? body.emoji : "";

  let colors: [string, string] = DEFAULT_COLORS;
  if (
    Array.isArray(body?.colors) &&
    body.colors.length >= 2 &&
    typeof body.colors[0] === "string" &&
    typeof body.colors[1] === "string" &&
    HEX_RE.test(body.colors[0]) &&
    HEX_RE.test(body.colors[1])
  ) {
    colors = [body.colors[0].toLowerCase(), body.colors[1].toLowerCase()];
  }


  try {
    const png = await renderCoverPng(buildGradientDocument(title, emoji, colors));
    const buffer = new Uint8Array(png).buffer as ArrayBuffer;
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[cover-gradient] render failed:", err);
    return NextResponse.json(
      { error: "gradient failed", detail },
      { status: 500 }
    );
  }
}
