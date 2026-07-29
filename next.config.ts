import type { NextConfig } from "next";

// 完全硬编码 Supabase 域名（Vercel 环境变量不可靠，直接写死）
const SUPABASE_HOSTNAME = "cvacrykzcppiflmvwwfe.supabase.co";

const CSP_VALUE = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  `connect-src 'self' https://${SUPABASE_HOSTNAME} wss://${SUPABASE_HOSTNAME} https://vercel.live`,
  "frame-src blob:",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "media-src 'self'",
  "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  // 隐藏 X-Powered-By: Next.js 头，减少信息泄露
  poweredByHeader: false,
  // 生产环境强制压缩
  compress: true,
  // 图片优化安全：只允许已知域名
  images: {
    remotePatterns: [
      { protocol: "https" as const, hostname: SUPABASE_HOSTNAME },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
  // 全局安全响应头
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP_VALUE },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
