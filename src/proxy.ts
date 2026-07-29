import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 全局安全中间件
 *
 * 为所有路由设置安全响应头，防止点击劫持、MIME 嗅探、信息泄露等攻击。
 *
 * 注意：iframe 内部代码的实际安全限制由以下机制共同保证：
 * 1. sandbox="allow-scripts"（无 same-origin / forms / popups / top-navigation 权限）
 * 2. wrapSecureSrcDoc 注入的 CSP meta 标签（浏览器级 API 封锁）
 * 3. wrapSecureSrcDoc 注入的安全 shim（Storage / cookie 静默降级）
 * 4. 代码扫描告警（发布前提醒创作者）
 */

// ---- 安全响应头 ----

/**
 * 父页面 CSP：
 * - default-src 'self' — 只允许同源资源
 * - script-src — 允许自身 + inline（Next.js 需要）+ eval（dev 模式 HMR）
 * - style-src — 允许 inline（Tailwind / styled-jsx 需要）
 * - img-src — 允许 data: URI 和 https 图片
 * - connect-src — 允许同源 + Supabase + Vercel
 * - frame-src 'none' — 父页面不允许被嵌入 iframe
 * - frame-ancestors 'none' — 防止点击劫持
 * - base-uri 'self' — 防止 base 标签劫持
 * - form-action 'self' — 防止表单提交到外部
 */
function buildCspHeader(isDev: boolean): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

  // Supabase 域名硬编码（Vercel 环境变量不可靠）
  const SUPABASE_ORIGIN = "https://cvacrykzcppiflmvwwfe.supabase.co";

  const connectSrc = [
    "connect-src 'self'",
    SUPABASE_ORIGIN,
    "wss://cvacrykzcppiflmvwwfe.supabase.co",
  ];
  connectSrc.push("https://vercel.live");

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    connectSrc.join(" "),
    "frame-src blob:",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self' blob:",
  ].join("; ");
}

/** 其他安全头 */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
    "interest-cohort=()",
  ].join(", "),
  "X-DNS-Prefetch-Control": "on",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

/** HSTS — 仅生产环境，强制 HTTPS */
const HSTS_HEADER = {
  "Strict-Transport-Security":
    "max-age=63072000; includeSubDomains; preload",
};

export function proxy(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  const response = NextResponse.next();

  // CSP
  response.headers.set("Content-Security-Policy", buildCspHeader(isDev));

  // 其他安全头
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // HSTS — 仅生产环境
  if (!isDev) {
    for (const [key, value] of Object.entries(HSTS_HEADER)) {
      response.headers.set(key, value);
    }
  }

  return response;
}

export const config = {
  // 匹配所有路由，排除静态资源和 Next.js 内部路径
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2)).*)",
  ],
};
