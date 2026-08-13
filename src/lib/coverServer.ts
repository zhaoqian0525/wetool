/**
 * ????????????v1.15.6?
 *
 * ? /api/cover/screenshot ? /api/cover/gradient ???
 * - ?????????Vercel ???puppeteer-core + @sparticuz/chromium?
 *   ??????? puppeteer ???? Chrome?
 * - ?????? CJK / emoji ???fontconfig??????????? emoji
 *   ?????????
 */

import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Browser } from "puppeteer-core";

export const COVER_WIDTH = 375;
export const COVER_HEIGHT = 667;

/** ?? load ???? */
export const LOAD_TIMEOUT_MS = 20000;
/** load ?????????? */
export const RENDER_DELAY_MS = 1200;

let browserPromise: Promise<Browser> | null = null;
let fontsPromise: Promise<void> | null = null;

/**
 * Vercel ?????? Open Sans???? emoji ???????
 * ?????fonts/NotoSansSC.ttf?fonts/NotoColorEmoji.ttf??
 * next.config.ts ? outputFileTracingIncludes ??????
 *
 * ????????? @sparticuz/chromium ???? /tmp/fonts ???
 * ??? FONTCONFIG_PATH ?????? fonts.conf?? Chromium ?
 * fontconfig ??????????? emoji?
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

        // ???? fonts.conf?????????????????
        // ?? fontconfig ??? /tmp/fonts????? /tmp/fonts-cache?
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

/** ???????????????????????? */
async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      if (process.env.VERCEL === "1") {
        // ?????????????????? Chromium ?????
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

/** ? HTML ??? 375x667 ?????? PNG */
export async function renderCoverPng(html: string): Promise<Uint8Array> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      deviceScaleFactor: 1,
    });
    // ?????? alert/confirm ???????????????
    page.on("dialog", (dialog) => {
      dialog.dismiss().catch(() => {});
    });
    page.on("pageerror", (err) => {
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
