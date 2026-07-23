/**
 * 工具封面生成与上传
 *
 * 发布流程中的截图步骤：
 * 1. 将用户代码渲染到隐藏 DOM 容器
 * 2. 用 html2canvas 截图 → Blob
 * 3. 上传到 Supabase Storage (tool-covers bucket)
 * 4. 失败时生成默认渐变封面兜底
 */

import { getSupabase } from "./supabase";

const COVER_WIDTH = 375;
const COVER_HEIGHT = 667;
const COVER_BUCKET = "tool-covers";

// ---- Screenshot ----

/** 将 HTML 代码渲染为隐藏 DOM 并截图，返回 Blob */
export async function captureCover(htmlCode: string): Promise<Blob | null> {
  let container: HTMLDivElement | null = null;

  try {
    const html2canvas = (await import("html2canvas")).default;

    // 创建离屏容器
    container = document.createElement("div");
    container.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:375px;height:667px;overflow:hidden;background:#fff;";
    document.body.appendChild(container);

    // 渲染用户代码为完整 HTML 文档的 iframe（更好的隔离）
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "width:375px;height:667px;border:0;";
    iframe.sandbox.add("allow-scripts");
    // 关键：截图用 iframe 需要 allow-same-origin 才能让 html2canvas 访问
    iframe.sandbox.add("allow-same-origin");
    container.appendChild(iframe);

    // 写入 srcdoc
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) throw new Error("Cannot access iframe document");

    doc.open();
    doc.write(ensureCompleteHtml(htmlCode));
    doc.close();

    // 等待渲染
    await sleep(800);

    // 截图
    const canvas = await html2canvas(doc.body, {
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    // 转换为 Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b && b.size > 0) resolve(b);
          else reject(new Error("Canvas produced empty blob"));
        },
        "image/png"
      );
    });
  } catch (err) {
    console.warn("Cover screenshot failed:", err);
    return null;
  } finally {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

// ---- Fallback ---

const GRADIENT_PAIRS: [string, string][] = [
  ["#667eea", "#764ba2"],
  ["#f093fb", "#f5576c"],
  ["#4facfe", "#00f2fe"],
  ["#fa8231", "#f7b731"],
  ["#43e97b", "#38f9d7"],
  ["#a18cd1", "#fbc2eb"],
];

/** 生成默认渐变封面 Blob（Canvas 绘制，无需外部依赖） */
export async function generateDefaultCoverBlob(
  title: string,
  seed: number
): Promise<Blob> {
  const [c1, c2] = GRADIENT_PAIRS[seed % GRADIENT_PAIRS.length];

  const canvas = document.createElement("canvas");
  canvas.width = COVER_WIDTH;
  canvas.height = COVER_HEIGHT;
  const ctx = canvas.getContext("2d")!;

  // 渐变背景
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 模拟手机内容装饰
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.beginPath();
  ctx.roundRect(40, 60, 295, 40, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(40, 115, 200, 14, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(40, 145, 295, 200, 12);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.beginPath();
  ctx.roundRect(110, 400, 155, 48, 24);
  ctx.fill();

  // 标题
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  const lines = wrapText(ctx, title, 280);
  const startY = 570 - lines.length * 14;
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, startY + i * 28);
  });

  // 品牌角标
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("微坞 WeWoo", canvas.width / 2, canvas.height - 30);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to create fallback cover"));
      },
      "image/png"
    );
  });
}

// ---- Upload ----

/** 上传封面到 Supabase Storage，返回公开 URL。失败返回 null */
export async function uploadCoverToStorage(
  blob: Blob,
  toolId: string
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    // 确保 bucket 存在（失败则跳过，可能无权限）
    await ensureBucket(supabase);

    const filePath = `public/${toolId}.png`;

    const { error } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(filePath, blob, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.warn("Cover upload error:", error.message);
      return null;
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(COVER_BUCKET)
      .getPublicUrl(filePath);

    return urlData?.publicUrl ?? null;
  } catch (err) {
    console.warn("Cover upload failed:", err);
    return null;
  }
}

// ---- Helpers ----

async function ensureBucket(supabase: ReturnType<typeof getSupabase>) {
  if (!supabase) return;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets?.some((b) => b.name === COVER_BUCKET)) return;

    await supabase.storage.createBucket(COVER_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });
  } catch {
    // Bucket 可能已存在或无权创建，静默忽略
  }
}

/** 确保用户代码是完整 HTML 文档 */
function ensureCompleteHtml(code: string): string {
  if (/<html[\s>]/i.test(code) && /<body[\s>]/i.test(code)) {
    // 已完整，只注入 viewport
    if (!/<meta\s+name="viewport"/i.test(code)) {
      return code.replace(
        /(<head[\s>][^]*?>)/i,
        `$1\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">`
      );
    }
    return code;
  }

  // 包裹为完整文档
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body>
${code}
</body>
</html>`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (ctx.measureText(text).width <= maxWidth) return [text];
  // 简单截断
  let result = text;
  while (ctx.measureText(result + "…").width > maxWidth && result.length > 1) {
    result = result.slice(0, -1);
  }
  return [result + "…"];
}
