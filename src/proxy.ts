import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CSP 中间件
 *
 * 仅在 production 环境生效（dev 模式下 Next.js 的 HMR 需要内联脚本）。
 * 为 /tool/* 和 /create 页面的父页面设置 Content-Security-Policy，
 * 防止点击劫持、限制资源来源。
 *
 * 注意：iframe 内部代码的实际安全限制由以下机制共同保证：
 * 1. sandbox="allow-scripts"（无网络/存储/弹窗权限）
 * 2. srcDoc 注入的 CSP meta 标签（浏览器级 API 封锁）
 * 3. 代码扫描告警（发布前提醒创作者）
 */

const CSP_HEADER_VALUE = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

export function proxy(request: NextRequest) {
  // 开发模式跳过，否则 Next.js HMR 无法工作
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // 仅对工具页面和创作页面设置 CSP
  if (
    pathname.startsWith("/tool/") ||
    pathname === "/create"
  ) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", CSP_HEADER_VALUE);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // 匹配需要安全头的路由
  matcher: ["/tool/:path*", "/create"],
};
