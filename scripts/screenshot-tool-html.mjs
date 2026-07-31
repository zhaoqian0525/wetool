/**
 * 直接从 HTML 代码渲染工具封面截图
 * 
 * 用法: node scripts/screenshot-tool-html.mjs
 *   或: node scripts/screenshot-tool-html.mjs --id 17,18
 *
 * 比 puppeteer 访问网站截图更可靠，不依赖网站部署状态。
 */
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COVERS_DIR = path.join(__dirname, "..", "public", "covers");

// 手动维护需要截图的工具 ID → HTML 代码映射
// 添加新工具：从 data.ts 复制 code 字段到这里
const TOOLS = {};

async function screenshot(toolId, html) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });
  await new Promise(r => setTimeout(r, 2000));

  const filePath = path.join(COVERS_DIR, `${toolId}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  ✓ ${toolId} -> ${filePath} (${fs.statSync(filePath).size} bytes)`);

  await page.close();
  await browser.close();
}

(async () => {
  if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });

  const targetIds = process.argv.includes("--id")
    ? process.argv[process.argv.indexOf("--id") + 1]?.split(",") || []
    : Object.keys(TOOLS);

  if (targetIds.length === 0) {
    console.log("No tools to screenshot. Add them to TOOLS map in this file, or use --id 17,18");
    return;
  }

  console.log(`Screenshooting ${targetIds.length} tools...`);
  for (const id of targetIds) {
    const html = TOOLS[id];
    if (!html) {
      console.log(`  ✗ ${id}: no HTML code in TOOLS map`);
      continue;
    }
    await screenshot(id, html);
  }
  console.log("Done!");
})();
