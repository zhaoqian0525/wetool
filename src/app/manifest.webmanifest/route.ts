import { NextResponse } from "next/server";

/**
 * v1.9.9 站点级 PWA manifest 路由。
 * 原 app/manifest.ts 会让 Next 自动给所有页面注入站点 manifest，与工具页的独立 manifest
 * 冲突：iOS「添加到主屏幕」时一半概率取到站点 start_url(/) 变成 we-woo.net。
 * 现改为手动路由，仅当页面通过 <SiteManifestLink /> 显式引用时才生效：
 * 非 /tool/ 页面注入站点 manifest，工具页只注入工具 manifest，互不冲突。
 */
export const dynamic = "force-static";

export function GET() {
  const manifest = {
    name: "微坞 WeWoo - AI小工具分享社区",
    short_name: "WeWoo",
    description:
      "像发朋友圈一样分享你做的 AI 小工具，别人点开链接就能直接使用。密码生成器、单位换算、旅行分账、古诗词抽签…丰富的在线小工具等你探索。",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#4f46e5",
    orientation: "portrait",
    categories: ["productivity", "utilities", "social"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "工具广场", url: "/", description: "浏览所有小工具" },
      { name: "开始创作", url: "/create", description: "创建新的小工具" },
    ],
  };
  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
}
