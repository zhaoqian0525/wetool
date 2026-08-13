/**
 * 服务端封面渲染共享模块（v1.15.6）
 *
 * 供 /api/cover/screenshot 与 /api/cover/gradient 共用：
 * - 懒加载无头浏览器（Vercel 生产：puppeteer-core + @sparticuz/chromium；
 *   本地开发：完整 puppeteer 使用本机 Chrome）
 * - 生产环境注入 CJK / emoji 字体（fontconfig），解决无头环境中文与 emoji
 *   渲染成豆腐块的问题
 */

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Browser } from "puppeteer-core";

export const COVER_WIDTH = 375;
export const COVER_HEIGHT = 667;

/** 页面 load 事件超时 */
export const LOAD_TIMEOUT_MS = 20000;
/** load 后等待渲染稳定的时间 */
export const RENDER_DELAY_MS = 1200;

let browserPromise: Promise<Browser> | null = null;
let fontsPromise: Promise<void> | null = null;

/**
 * Vercel 无头环境只有 Open Sans，中文与 emoji 需要额外字体。
 * 字体文件（fonts/NotoSansSC.ttf、fonts/NotoColorEmoji.ttf）由
 * next.config.ts 的 outputFileTracingIncludes 打进函数包。
 *
 * 做法：把字体复制到 @sparticuz/chromium 解压出的 /tmp/fonts 目录，
 * 并设置 FONTCONFIG_PATH 指向该目录的 fonts.conf，让 Chromium 的
 * fontconfig 能匹配到中文字体与彩色 emoji。
 */
function ensureServerFonts(): Promise<void> {
  if (!fontsPromise) {
    fontsPromise = (async () => {
      try {
        const fontsDir = join(tmpdir(), "fonts");
        mkdirSync(fontsDir, { recursive: true });
        mkdirSync(join(tmpdir(), "fonts-cache"), { recursive: true });

        const srcDir = join(process.cwd(), "fonts");
        for (const name of ["NotoSansSC.ttf", "NotoColorEmoji.ttf"]) {
          const from = join(srcDir, name);
          if (existsSync(from)) {
            copyFileSync(from, join(fontsDir, name));
          }
        }

        // 自写一份 fonts.conf（解压出的可能被覆盖，内容等价），
        // 确保 fontconfig 只扫描 /tmp/fonts，缓存写入 /tmp/fonts-cache。
        const conf = [
          '<?xml version="1.0"?>',
          '<!DOCTYPE fontconfig SYSTEM "fonts.dtd">',
          "<fontconfig>",
          "  <dir>/tmp/fonts</dir>",
          "  <cachedir>/tmp/fonts-cache</cachedir>",
          "  <config></config>",
          "</fontconfig>",
        ].join("\n");
        writeFileSync(join(fontsDir, "fonts.conf"), conf, "utf8");
        process.env.FONTCONFIG_PATH = join(fontsDir, "fonts.conf");
      } catch (err) {
        console.warn("[cover-server] font setup failed:", err);
      }
    })();
  }
  return fontsPromise;
}

/** 懒启动无头浏览器；启动失败时清空缓存允许下次重试 */
export async function getCoverBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      if (process.env.VERCEL === "1") {
        // 必须等字体就绪再启动，环境变量才会被 Chromium 子进程继承
        await ensureServerFonts();
        const chromium = (await import("@sparticuz/chromium")).default;
        const { default: puppeteerCore } = await import("puppeteer-core");
        return puppeteerCore.launch({
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: "shell",
        });
      }
      const { default: puppeteer } = await import("puppeteer");
      return puppeteer.launch({ headless: true });
    })();
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

/** 将 HTML 渲染到 375x667 视口并截图为 PNG */
export async function renderCoverPng(html: string): Promise<Uint8Array> {
  const browser = await getCoverBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      deviceScaleFactor: 1,
    });
    // 工具代码里的 alert/confirm 在无头环境会阻塞渲染，一律忽略
    page.on("dialog", (dialog: { dismiss: () => Promise<void> }) => {
      dialog.dismiss().catch(() => {});
    });
    page.on("pageerror", (err: unknown) => {
      console.warn("[cover-server] pageerror:", String(err));
    });
    await page.setContent(html, {
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
