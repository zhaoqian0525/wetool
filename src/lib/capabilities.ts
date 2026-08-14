/**
 * 工具能力清单（v2.0.0 权限透明反馈）
 *
 * 通过静态扫描工具代码，生成「这个工具能做什么 / 不能做什么」的能力清单：
 * - 展示给作者（发布前明确工具边界）
 * - 展示给用户（详情页/预览页一眼看懂）
 * - 附加到 AI 生成结果说明（生成完就知道边界）
 *
 * 说明：这是提示性扫描（与 scanDangerousCode 同思路），不拦截、不修改代码；
 * 实际限制由沙盒（sandbox="allow-scripts" + CSP meta）强制执行。
 */

export interface CapabilityDef {
  key: string;
  icon: string;
  label: string;
  /** 沙盒内是否可用 */
  available: boolean;
  /** 检测用正则（在 script 内容上匹配） */
  regex: RegExp;
}

export const CAPABILITY_DEFS: CapabilityDef[] = [
  {
    key: "memory",
    icon: "🧠",
    label: "本地记忆/状态保存",
    available: true,
    regex: /localStorage|sessionStorage|__wewoo|WEWOO_/i,
  },
  {
    key: "audio",
    icon: "🔊",
    label: "音效/语音",
    available: true,
    regex: /AudioContext|webkitAudioContext|new Audio\(|SpeechSynthesisUtterance|speechSynthesis|\.play\(\)/i,
  },
  {
    key: "canvas",
    icon: "🎨",
    label: "绘图/图表",
    available: true,
    regex: /canvas|getContext\(|createElement\("canvas"\)|toDataURL/i,
  },
  {
    key: "timer",
    icon: "⏱️",
    label: "定时任务",
    available: true,
    regex: /setTimeout|setInterval|requestAnimationFrame/i,
  },
  {
    key: "network",
    icon: "🌐",
    label: "联网（白名单）",
    available: true,
    regex: /__wewoo\.fetch/i,
  },
  {
    key: "blockedNetwork",
    icon: "🚫",
    label: "受限联网（已拦截）",
    available: false,
    regex: /(?<![\w.])fetch\s*\(|XMLHttpRequest|new WebSocket|EventSource|sendBeacon|axios/i,
  },
  {
    key: "ai",
    icon: "🤖",
    label: "内置 AI 问答",
    available: true,
    regex: /__wewoo\.ai/i,
  },
  {
    key: "notify",
    icon: "🔔",
    label: "系统通知",
    available: false,
    regex: /Notification\b|navigator\.serviceWorker|showNotification/i,
  },
  {
    key: "popup",
    icon: "↗️",
    label: "外部跳转/弹窗",
    available: false,
    regex: /window\.open|location\.(href|assign|replace)\s*=|target="_blank"/i,
  },
  {
    key: "copy",
    icon: "📋",
    label: "剪贴板复制",
    available: true,
    regex: /__wewoo\.copyText|navigator\.clipboard/i,
  },
  {
    key: "export",
    icon: "📥",
    label: "文件导出",
    available: true,
    regex: /__wewoo\.download/i,
  },
  {
    key: "share",
    icon: "📤",
    label: "分享",
    available: true,
    regex: /__wewoo\.share|navigator\.share/i,
  },
  {
    key: "userinfo",
    icon: "👤",
    label: "使用者信息/头像",
    available: true,
    regex: /__wewoo\.getUser/i,
  },
  {
    key: "worker",
    icon: "⚙️",
    label: "多线程计算（Worker）",
    available: true,
    regex: /new Worker\(/i,
  },
];

export interface CapabilityInfo extends CapabilityDef {
  detected: boolean;
}

/** 提取 script 内容（与 sandbox.ts 保持一致的扫描范围） */
function extractScriptContent(html: string): string[] {
  const results: string[] = [];
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html)) !== null) results.push(match[1]);
  const inlineRegex = /\bon\w+\s*=\s*"([^"]*)"|\bon\w+\s*=\s*'([^']*)'/gi;
  while ((match = inlineRegex.exec(html)) !== null) {
    const content = match[1] || match[2];
    if (content) results.push(content);
  }
  return results;
}

/** 扫描代码，返回检测到的能力清单（未检测到的不返回） */
export function scanCapabilities(code: string): CapabilityInfo[] {
  if (!code || typeof code !== "string") return [];
  const scriptContent = extractScriptContent(code).join("\n");
  const result: CapabilityInfo[] = [];
  for (const def of CAPABILITY_DEFS) {
    const re = new RegExp(def.regex.source, def.regex.flags.includes("g") ? def.regex.flags : def.regex.flags + "g");
    re.lastIndex = 0;
    if (re.test(scriptContent)) {
      result.push({ ...def, detected: true });
    }
  }
  return result;
}

/** 生成人类可读的能力摘要（用于 AI 生成后的自动说明） */
export function formatCapabilitySummary(caps: CapabilityInfo[]): string {
  if (caps.length === 0) {
    return "本工具没有使用特殊能力，运行在安全沙盒内";
  }
  const can = caps.filter((c) => c.available).map((c) => c.label).join("、");
  const cannot = caps.filter((c) => !c.available).map((c) => c.label).join("、");
  const parts: string[] = [];
  if (can) parts.push("可以使用：" + can);
  if (cannot) parts.push("不能使用：" + cannot);
  return "本工具能力说明——" + parts.join("；");
}