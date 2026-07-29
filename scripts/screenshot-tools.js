/**
 * 批量截图所有工具的封面
 *
 * 用法: node scripts/screenshot-tools.js
 *
 * 需求: npm install puppeteer
 * 输出: public/covers/{toolId}.png
 */

const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "https://we-woo.net";
const COVERS_DIR = path.join(__dirname, "..", "public", "covers");

// 从 data.ts 提取工具 ID 列表
const TOOL_IDS = Array.from({ length: 16 }, (_, i) => String(i + 1));

async function screenshotTool(browser, toolId) {
  const page = await browser.newPage();
  try {
    // iPhone 尺寸模拟移动端
    await page.setViewport({ width: 430, height: 932, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/tool/${toolId}`, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    // 等待 iframe 加载
    await page.waitForSelector("iframe", { timeout: 15000 });
    // 给 iframe 内容加载时间
    await new Promise((r) => setTimeout(r, 3000));

    // 截图 iframe 元素
    const iframe = await page.$("iframe");
    if (!iframe) {
      console.log(`[${toolId}] No iframe found, taking full page screenshot`);
      await page.screenshot({
        path: path.join(COVERS_DIR, `${toolId}.png`),
        fullPage: false,
      });
    } else {
      const box = await iframe.boundingBox();
      if (box && box.width > 0) {
        // 截取 iframe + 周围手机壳区域
        await page.screenshot({
          path: path.join(COVERS_DIR, `${toolId}.png`),
          clip: {
            x: Math.max(0, box.x - 16),
            y: Math.max(0, box.y - 60),
            width: Math.min(430, box.width + 32),
            height: Math.min(800, box.height + 100),
          },
        });
      } else {
        await page.screenshot({
          path: path.join(COVERS_DIR, `${toolId}.png`),
          fullPage: false,
        });
      }
    }
    console.log(`[${toolId}] Screenshot saved`);
  } catch (err) {
    console.error(`[${toolId}] Error: ${err.message}`);
  } finally {
    await page.close();
  }
}

(async () => {
  console.log("Launching Edge browser...");
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // 确保目录存在
  if (!fs.existsSync(COVERS_DIR)) {
    fs.mkdirSync(COVERS_DIR, { recursive: true });
  }

  // 逐个截图（避免并发过多）
  for (const id of TOOL_IDS) {
    await screenshotTool(browser, id);
  }

  await browser.close();
  console.log("All done! Screenshots saved to public/covers/");
})();
