/**
 * 封面截图共享 HTML 包装
 *
 * 客户端（html2canvas 快照回退）与服务端（Puppeteer 截图）共用同一套
 * CSP / 视口 / 重置样式，保证两条路径渲染出的封面一致。
 */

export const COVER_WIDTH = 375;
export const COVER_HEIGHT = 667;

/** 与沙盒一致的封面 CSP：默认全禁，仅允许内联脚本/样式 + https/data 图片 */
export const COVER_CSP_META =
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

const COVER_VIEWPORT_META =
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">';

const COVER_RESET_CSS =
  "<style>*,*::before,*::after{box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:16px}</style>";

/**
 * 将用户工具 HTML 包装为封面渲染文档。
 *
 * @param code      用户工具 HTML（可能是完整文档或裸代码片段）
 * @param bodyExtra 追加到 </body> 前的额外内容（客户端快照回传脚本；服务端截图传空）
 */
export function buildCoverDocument(code: string, bodyExtra = ""): string {
  const headBlock = `<head>
  <meta charset="UTF-8">
  ${COVER_VIEWPORT_META}
  ${COVER_CSP_META}
  ${COVER_RESET_CSS}
</head>`;

  if (/<html[\s>]/i.test(code)) {
    let result = code;
    if (/<head[\s>]/i.test(result)) {
      result = result.replace(
        /<head\b[^>]*>/i,
        (m) => `${m}\n  ${COVER_VIEWPORT_META}\n  ${COVER_CSP_META}\n  ${COVER_RESET_CSS}`
      );
    } else {
      result = result.replace(/<html\b[^>]*>/i, (m) => `${m}\n${headBlock}`);
    }
    const suffix = bodyExtra ? `\n${bodyExtra}` : "";
    if (/<\/body>/i.test(result)) {
      result = result.replace(/<\/body>/i, `${suffix}\n</body>`);
    } else {
      result = result + suffix;
    }
    return result;
  }

  // 裸代码片段：包装为完整文档
  return `<!DOCTYPE html>
<html lang="zh-CN">
${headBlock}
<body>
${bodyExtra}
${code}
</body>
</html>`;
}
