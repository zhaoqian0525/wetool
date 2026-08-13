import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, unauthorizedResponse } from "@/lib/api-auth";
import { buildCoverDocument } from "@/lib/coverHtml";
import { renderCoverPng } from "@/lib/coverServer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// v1.15.6??????? Chromium + ?????????? 90s?Vercel Hobby ?? 300s?
export const maxDuration = 90;

/** HTML ?????? 2.5MB????? */
const MAX_HTML_CHARS = 2_500_000;

/**
 * POST /api/cover/screenshot
 * Body: { html: string }
 * ?????????? HTML ????????????????????????
 * ?? iPhone Safari ? html2canvas ????????????????????
 * ?? PNG ????
 */
export async function POST(request: NextRequest) {
  const auth = await getAuthedSupabase(request);
  if (!auth) return unauthorizedResponse();

  let body: { html?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const html = typeof body?.html === "string" ? body.html : "";
  if (!html.trim()) {
    return NextResponse.json({ error: "empty html" }, { status: 400 });
  }
  if (html.length > MAX_HTML_CHARS) {
    return NextResponse.json({ error: "html too large" }, { status: 413 });
  }

  try {
    const png = await renderCoverPng(buildCoverDocument(html));
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
    console.error("[cover-screenshot] render failed:", err);
    return NextResponse.json(
      { error: "screenshot failed", detail },
      { status: 500 }
    );
  }
}
