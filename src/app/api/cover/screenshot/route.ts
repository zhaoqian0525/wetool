import { NextRequest, NextResponse } from "next/server";
import type { Browser } from "puppeteer-core";
import { getAuthedSupabase, unauthorizedResponse } from "@/lib/api-auth";
import { buildCoverDocument, COVER_WIDTH, COVER_HEIGHT } from "@/lib/coverHtml";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/** HTML 文本上限（约 2.5MB），防滥用 */
const MAX_HTML_CHARS = 2_500_000;
/** 页面加载后等待渲染稳定的时间 */
const RENDER_DELAY_MS = 1300;
/** 页面 load 事件超时 */
const LOAD_TIMEOUT_MS = 15000;

let browserPromise: Promise<Browser> | null = null;

/**
 * 懒启动无头浏览器：
 * - Vercel 生产：puppeteer-core + @sparticuz/chromium（内置于函数包，无需下载）
 * - 本地开发：完整 puppeteer（使用本机已下载的 Chrome）
 */
async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      if (process.env.VERCEL === "1") {
        const chromium = (await import("@sparticuz/chromium")).default;
        const { default: puppeteerCore } = await import("puppeteer-core");
        return puppeteerCore.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      }
      const { default: puppeteer } = await import("puppeteer");
      return puppeteer.launch({ headless: true });
    })();
    // 启动失败时清空缓存，允许下次请求重试
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

/** 将用户 HTML 渲染到 375x667 视口并截图为 PNG */
async function renderCoverPng(html: string): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      deviceScaleFactor: 1,
    });
    // 工具代码里的 alert/confirm 在无头环境会阻塞渲染，一律忽略
    page.on("dialog", (dialog) => {
      dialog.dismiss().catch(() => {});
    });
    page.on("pageerror", (err) => {
      console.warn("[cover-screenshot] pageerror:", String(err));
    });
    await page.setContent(buildCoverDocument(html), {
      waitUntil: "load",
      timeout: LOAD_TIMEOUT_MS,
    });
    await new Promise((resolve) => setTimeout(resolve, RENDER_DELAY_MS));
    return await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: COVER_WIDTH, height: COVER_HEIGHT },
    });
  } finally {
    await page.close().catch(() => {});
  }
}

/**
 * POST /api/cover/screenshot
 * Body: { html: string }
 * 登录用户专用：将工具 HTML 在服务端无头浏览器中渲染并截图（浏览器原生渲染，
 * 解决 iPhone Safari 上 html2canvas 永久卡死、桌面与手机截图不一致的问题）。
 * 返回 PNG 二进制。
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
    const png = await renderCoverPng(html);
    const body = new Uint8Array(png).buffer as ArrayBuffer;
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[cover-screenshot] render failed:", err);
    return NextResponse.json({ error: "screenshot failed" }, { status: 500 });
  }
}