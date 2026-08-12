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
// v1.15.0：沙盒运行阶段等待 DOM 快照回传的超时
const SNAP_TIMEOUT_MS = 6000;
// v1.15.3：html2canvas 截图阶段加超时（iOS Safari 下可能永不返回导致卡住「正在生成封面」），超时走渐变封面兜底
const HTML2CANVAS_TIMEOUT_MS = 15000;
// v1.15.4：canvas.toBlob 阶段加超时（iOS Safari 可能永不回调，导致永久卡在「正在生成封面」）
const TO_BLOB_TIMEOUT_MS = 8000;
// v1.15.4：封面上传阶段加超时，避免网络挂起导致界面无限等待
const UPLOAD_TIMEOUT_MS = 25000;

// ---- Screenshot ----

/** 将 HTML 代码渲染为隐藏 DOM 并截图，返回 Blob */
export async function captureCover(htmlCode: string): Promise<Blob | null> {
  let runIframe: HTMLIFrameElement | null = null;
  let snapIframe: HTMLIFrameElement | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  try {
    const html2canvas = (await import("html2canvas")).default;

    // 第一阶段：沙盒运行 iframe（仅 allow-scripts，无 allow-same-origin）。
    // 用户代码处于 opaque origin，无法访问父页面 localStorage/token；
    // 渲染约 1 秒后回传 DOM 快照（canvas 已序列化为 dataURL 图片）。
    runIframe = document.createElement("iframe");
    runIframe.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:375px;height:667px;border:0;background:#fff;";
    runIframe.sandbox.add("allow-scripts");
    document.body.appendChild(runIframe);

    const snapshot = await new Promise<{ html: string }>((resolve, reject) => {
      const onMessage = (event: MessageEvent) => {
        if (event.source !== runIframe?.contentWindow) return;
        if (typeof event.data !== "string") return;
        let parsed: { __wewooSnap?: boolean; html?: string; error?: string } | null = null;
        try {
          parsed = JSON.parse(event.data);
        } catch {
          return;
        }
        if (!parsed || parsed.__wewooSnap !== true) return;
        cleanup();
        if (parsed.html) resolve({ html: parsed.html });
        else reject(new Error(parsed.error || "cover snapshot failed"));
      };
      const cleanup = () => {
        window.removeEventListener("message", onMessage);
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };
      timer = setTimeout(() => {
        cleanup();
        reject(new Error("cover snapshot timeout"));
      }, SNAP_TIMEOUT_MS);
      window.addEventListener("message", onMessage);
      runIframe!.srcdoc = buildCoverHtml(htmlCode);
    });

    // 第二阶段：快照渲染进无脚本 iframe（sandbox allow-same-origin，无 allow-scripts），
    // 父页面用 html2canvas 截图。快照已剥离脚本/事件/嵌入内容，不会执行用户代码。
    const dom = sanitizeSnapshotHtml(snapshot.html);
    snapIframe = document.createElement("iframe");
    snapIframe.style.cssText =
      "position:fixed;left:-9999px;top:-9999px;width:375px;height:667px;border:0;background:#fff;";
    snapIframe.sandbox.add("allow-same-origin");
    document.body.appendChild(snapIframe);
    snapIframe.srcdoc = dom;
    await waitSnapLoaded(snapIframe);

    const doc = snapIframe.contentDocument;
    if (!doc) throw new Error("snapshot iframe inaccessible");

    const canvas = await withTimeout(
      html2canvas(doc.body, {
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: COVER_WIDTH,
        windowHeight: COVER_HEIGHT,
      }),
      HTML2CANVAS_TIMEOUT_MS,
      "cover html2canvas timeout"
    );

    return canvasToBlobWithTimeout(canvas, TO_BLOB_TIMEOUT_MS, "cover canvas toBlob timeout");
  } catch (err) {
    console.warn("Cover screenshot failed:", err);
    return null;
  } finally {
    if (timer) clearTimeout(timer);
    if (runIframe && runIframe.parentNode) {
      runIframe.parentNode.removeChild(runIframe);
    }
    if (snapIframe && snapIframe.parentNode) {
      snapIframe.parentNode.removeChild(snapIframe);
    }
  }
}

/**
 * 构建沙盒运行阶段的 HTML：注入与预览一致的 CSP + 快照回传脚本。
 * 用户代码在 opaque origin 中执行，无法触达父页面。
 */
function buildCoverHtml(code: string): string {
  const cspMeta =
    '<meta http-equiv="Content-Security-Policy" content="' +
    "default-src 'none'; " +
    "style-src 'unsafe-inline'; " +
    "script-src 'unsafe-inline'; " +
    "img-src data: https:; " +
    "font-src 'none'; " +
    "connect-src 'none'; " +
    "frame-src 'none'; " +
    "media-src 'none'; " +
    "object-src 'none'; " +
    "base-uri 'none'; " +
    "form-action 'none'" +
    '">';
  const viewportMeta =
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">';
  const resetCSS =
    "<style>*,*::before,*::after{box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:16px}</style>";
  const snapScript = `<script>
(function () {
  var SENT = false;
  function send(payload) {
    if (SENT) return;
    SENT = true;
    try { parent.postMessage(JSON.stringify(Object.assign({ __wewooSnap: true }, payload)), "*"); } catch (e) {}
  }
  function snap() {
    try {
      var clone = document.documentElement.cloneNode(true);
      var srcCanvases = document.querySelectorAll("canvas");
      var dstCanvases = clone.querySelectorAll("canvas");
      for (var i = 0; i < srcCanvases.length && i < dstCanvases.length; i++) {
        try {
          var img = document.createElement("img");
          img.src = srcCanvases[i].toDataURL("image/png");
          img.width = srcCanvases[i].width;
          img.height = srcCanvases[i].height;
          img.style.cssText = srcCanvases[i].getAttribute("style") || "";
          dstCanvases[i].parentNode.replaceChild(img, dstCanvases[i]);
        } catch (e) {}
      }
      send({ html: "<!DOCTYPE html>" + clone.outerHTML });
    } catch (e) { send({ error: String((e && e.message) || e) }); }
  }
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", function () { setTimeout(snap, 1000); });
  } else {
    setTimeout(snap, 1000);
  }
})();
<\/script>`;

  const headBlock = `<head>
  <meta charset="UTF-8">
  ${viewportMeta}
  ${cspMeta}
  ${resetCSS}
</head>`;

  if (/<html[\s>]/i.test(code)) {
    let result = code;
    if (/<head[\s>]/i.test(result)) {
      result = result.replace(
        /<head\b[^>]*>/i,
        (m) => `${m}\n  ${viewportMeta}\n  ${cspMeta}\n  ${resetCSS}`
      );
    } else {
      result = result.replace(/<html\b[^>]*>/i, (m) => `${m}\n${headBlock}`);
    }
    if (/<\/body>/i.test(result)) {
      result = result.replace(/<\/body>/i, `${snapScript}\n</body>`);
    } else {
      result = result + `\n${snapScript}`;
    }
    return result;
  }

  // 裸代码片段：包裹为完整文档
  return `<!DOCTYPE html>
<html lang="zh-CN">
${headBlock}
<body>
${snapScript}
${code}
</body>
</html>`;
}

/** 等待快照 iframe 完成渲染（load 事件 + 150ms 布局稳定，最长 2s 兜底） */
/** Promise 超时包装：超时抛错由调用方走兑底；挂 catch 避免原 Promise 晚到失败产生 unhandled rejection */
async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  promise.catch(() => {});
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** v1.15.4：canvas.toBlob 带超时包装（iOS Safari 可能永不回调） */
function canvasToBlobWithTimeout(
  canvas: HTMLCanvasElement,
  ms: number,
  message: string
): Promise<Blob> {
  return withTimeout(
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b && b.size > 0) resolve(b);
          else reject(new Error("Canvas produced empty blob"));
        },
        "image/png"
      );
    }),
    ms,
    message
  );
}

/** v1.15.4：将 dataURL 转为 Blob（带超时，iOS Safari 大图可能长时间无回调） */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob | null> {
  try {
    return await withTimeout(
      fetch(dataUrl).then((res) => res.blob()),
      TO_BLOB_TIMEOUT_MS,
      "cover dataURL to blob timeout"
    );
  } catch (err) {
    console.warn("Cover dataURL conversion failed:", err);
    return null;
  }
}

function waitSnapLoaded(iframe: HTMLIFrameElement): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 2000);
    iframe.addEventListener(
      "load",
      () => {
        clearTimeout(timer);
        setTimeout(resolve, 150);
      },
      { once: true }
    );
  });
}

/** 剥离快照中的可执行内容：脚本、事件属性、嵌入框架、base、meta refresh、javascript: URL */
function sanitizeSnapshotHtml(html: string): string {
  let h = html;
  // srcdoc 若以 <!DOCTYPE 开头，部分浏览器（尤其 iOS Safari）可能导致 iframe 空白/加载异常
  h = h.replace(/^<!DOCTYPE[^>]*>/i, "");
  h = h.replace(/<script[\s\S]*?<\/script>/gi, "");
  h = h.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  h = h.replace(/<iframe[\s\S]*?<\/iframe>/gi, "").replace(/<iframe[^>]*\/?>/gi, "");
  h = h.replace(/<object[\s\S]*?<\/object>/gi, "").replace(/<object[^>]*\/?>/gi, "");
  h = h.replace(/<embed[^>]*\/?>/gi, "");
  h = h.replace(/<base[^>]*\/?>/gi, "");
  h = h.replace(/<meta[^>]*http-equiv=["']refresh["'][^>]*\/?>/gi, "");
  h = h.replace(/\s(?:href|src|xlink:href)=["']javascript:[^"']*["']/gi, "");
  return h;
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
  // v1.9.7 品牌化：默认封面统一使用品牌渐变（#5046E5 → #8B5CF6）
  const [c1, c2] = ["#5046e5", "#8b5cf6"];

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

  // 品牌 W 元素（装饰卡内居中，参考 Logo 几何，v1.9.7）
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 22;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(122, 178);
  ctx.lineTo(166, 292);
  ctx.lineTo(188, 224);
  ctx.lineTo(210, 292);
  ctx.lineTo(254, 178);
  ctx.stroke();
  ctx.restore();

  // 品牌 W 元素（装饰卡内居中，参考 Logo 几何，v1.9.7）
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 22;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(122, 178);
  ctx.lineTo(166, 292);
  ctx.lineTo(188, 224);
  ctx.lineTo(210, 292);
  ctx.lineTo(254, 178);
  ctx.stroke();
  ctx.restore();

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

  return canvasToBlobWithTimeout(canvas, TO_BLOB_TIMEOUT_MS, "fallback cover canvas toBlob timeout");
}

/** 从渐变 CSS 中解析两个十六进制颜色，供 Canvas 绘制使用 */
function parseGradientCss(css: string): [string, string] {
  const m = css.match(/#[0-9a-fA-F]{6}/g);
  if (m && m.length >= 2) return [m[0], m[1]];
  return GRADIENT_PAIRS[0];
}

/** 生成自定义封面 Blob：渐变 + 大表情 + 标题（发布/更换封面共用） */
export async function generateCustomCoverBlob(
  title: string,
  seed: number,
  emoji: string,
  gradientCss?: string
): Promise<Blob> {
  const [c1, c2] = gradientCss
    ? parseGradientCss(gradientCss)
    : GRADIENT_PAIRS[seed % GRADIENT_PAIRS.length];

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

  // 大表情
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "76px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText(emoji || "🛠️", canvas.width / 2, 280);

  // 标题
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, sans-serif";
  const lines = wrapText(ctx, title, 280);
  const startY = 470 - lines.length * 14;
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, startY + i * 28);
  });

  // 品牌角标
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillText("微坞 WeWoo", canvas.width / 2, canvas.height - 30);

  return canvasToBlobWithTimeout(canvas, TO_BLOB_TIMEOUT_MS, "custom cover canvas toBlob timeout");
}

// ---- Upload ----

/** 上传封面到 Supabase Storage，返回公开 URL。失败返回 null */
export async function uploadCoverToStorage(
  blob: Blob,
  toolId: string,
  customClient?: ReturnType<typeof getSupabase>
): Promise<string | null> {
  const supabase = customClient || getSupabase();
  if (!supabase) return null;

  try {
    // v1.15.4：上传整体加超时（iOS Safari 网络挂起时避免永久等待）
    return await withTimeout(
      doUploadCover(supabase, blob, toolId),
      UPLOAD_TIMEOUT_MS,
      "cover upload timeout"
    );
  } catch (err) {
    console.warn("Cover upload failed:", err);
    return null;
  }
}

async function doUploadCover(
  supabase: NonNullable<ReturnType<typeof getSupabase>>,
  blob: Blob,
  toolId: string
): Promise<string | null> {
  // 确保 bucket 存在
  await ensureBucket(supabase);

  const filePath = "public/" + toolId + ".png";

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
