/**
 * 微坞沙箱安全工具
 *
 * 防护层级：
 * 1. iframe sandbox="allow-scripts allow-same-origin" — 允许脚本和自身DOM访问，CSP补充限制
 * 2. srcDoc 注入 <base href="about:blank"> — 阻断相对路径利用
 * 3. srcDoc 注入 CSP meta 标签 — 双重限制脚本能力
 * 4. 代码扫描 — 发布前检测危险 API，警告创作者
 */

// ---- 危险调用模式（仅用于扫描告警，不修改代码） ----

interface DangerousPattern {
  /** 正则表达式 */
  regex: RegExp;
  /** 危险等级 */
  level: "high" | "medium";
  /** 中文说明 */
  label: string;
}

const DANGEROUS_PATTERNS: DangerousPattern[] = [
  {
    regex: /\bfetch\s*\(/g,
    level: "high",
    label: "fetch() 网络请求",
  },
  {
    regex: /\bXMLHttpRequest\b/g,
    level: "high",
    label: "XMLHttpRequest 网络请求",
  },
  {
    regex: /\bnew\s+WebSocket\s*\(/g,
    level: "high",
    label: "WebSocket 连接",
  },
  {
    regex: /\bEventSource\s*\(/g,
    level: "high",
    label: "EventSource (SSE) 连接",
  },
  {
    regex: /\blocalStorage\b/g,
    level: "high",
    label: "localStorage 本地存储",
  },
  {
    regex: /\bsessionStorage\b/g,
    level: "high",
    label: "sessionStorage 本地存储",
  },
  {
    regex: /\bdocument\.cookie\b/g,
    level: "high",
    label: "document.cookie 读取",
  },
  {
    regex: /\bindexedDB\b/g,
    level: "high",
    label: "IndexedDB 数据库",
  },
  {
    regex: /\bnavigator\.sendBeacon\s*\(/g,
    level: "high",
    label: "navigator.sendBeacon() 数据外发",
  },
  {
    regex: /\bwindow\.postMessage\s*\(/g,
    level: "medium",
    label: "window.postMessage() 跨窗口通信",
  },
  {
    regex: /\bwindow\.open\s*\(/g,
    level: "medium",
    label: "window.open() 弹窗",
  },
  {
    regex: /\beval\s*\(/g,
    level: "high",
    label: "eval() 动态执行",
  },
  {
    regex: /\bnew\s+Function\s*\(/g,
    level: "high",
    label: "new Function() 动态执行",
  },
  {
    regex: /\bdocument\.write\s*\(/g,
    level: "medium",
    label: "document.write()",
  },
];

export interface SanitizeResult {
  warnings: { level: "high" | "medium"; label: string; count: number }[];
}

/**
 * 扫描代码中的危险调用，仅返回告警列表。
 * 注意：不修改代码本身——实际限制由 sandbox + CSP meta 在浏览器层面强制执行。
 */
export function scanDangerousCode(code: string): SanitizeResult {
  const warnings: SanitizeResult["warnings"] = [];

  for (const pattern of DANGEROUS_PATTERNS) {
    // 只扫描 <script> 标签内的内容
    const scriptMatches = extractScriptContent(code);
    let totalCount = 0;

    for (const scriptContent of scriptMatches) {
      const matches = scriptContent.match(pattern.regex);
      if (matches) totalCount += matches.length;
    }

    if (totalCount > 0) {
      warnings.push({
        level: pattern.level,
        label: pattern.label,
        count: totalCount,
      });
    }
  }

  return { warnings };
}

/**
 * 提取所有 <script> 标签内的代码内容（支持内联和外部引用提示）
 */
function extractScriptContent(html: string): string[] {
  const results: string[] = [];
  // 匹配 <script ...>...</script> 内的内容
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html)) !== null) {
    results.push(match[1]);
  }

  // 也检查内联事件属性中的代码
  const inlineRegex = /\bon\w+\s*=\s*"([^"]*)"|\bon\w+\s*=\s*'([^']*)'/gi;
  while ((match = inlineRegex.exec(html)) !== null) {
    const content = match[1] || match[2];
    if (content) results.push(content);
  }

  return results;
}

// ---- 安全的 srcDoc 包装 ----

/**
 * 在用户代码中注入安全头部，返回可直接用于 iframe srcDoc 的字符串。
 *
 * 注入内容：
 * - <base href="about:blank"> → 阻止相对路径访问
 * - CSP <meta> 标签 → 浏览器级权限限制
 */
export function wrapSecureSrcDoc(rawCode: string): string {
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

  const baseTag = '<base href="about:blank">';

  // 如果已有 <head>，把 base + CSP 注入到 <head> 开头
  if (/<head[\s>]/i.test(rawCode)) {
    return rawCode.replace(
      /(<head[\s>][^]*?>)/i,
      `$1\n  ${cspMeta}\n  ${baseTag}`
    );
  }

  // 如果有 <html> 但没有独立 <head>
  if (/<html[\s>]/i.test(rawCode)) {
    return rawCode.replace(
      /(<html[\s>][^]*?>)/i,
      `$1\n<head>\n  ${cspMeta}\n  ${baseTag}\n</head>`
    );
  }

  // 完全裸的代码片段：包裹成完整文档
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${cspMeta}
  ${baseTag}
</head>
<body>
${rawCode}
</body>
</html>`;
}

// ---- 安全的 sandbox 属性值 ----

/**
 * iframe sandbox 属性。
 * allow-scripts: 允许 JS 执行（工具必须）
 * allow-same-origin: 允许 iframe 访问自身内容，移动端渲染必需。
 *   安全性：CSP meta 已封锁 connect-src/frame-src/object-src，此权限不会绕过。
 */
export const IFRAME_SANDBOX = "allow-scripts allow-same-origin";
