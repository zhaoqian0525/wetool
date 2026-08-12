import { NextResponse } from "next/server";
import { fetchToolById } from "@/lib/data";

export const dynamic = "force-dynamic";
// v1.15.2：iOS 会顽固缓存 manifest；早期工具页曾同时注入站点 manifest（start_url "/"），
// 导致 iOS 记住 start_url "/" 而把主屏快捷方式存成官网首页。
// 配合 layout 中 ?v=2 版本化 URL 强制 iOS 重新抓取，拿到正确的工具 start_url；
// 并禁止 HTTP 缓存，避免再次缓存旧 manifest。


/**
 * v1.8.8 每个工具的独立 PWA manifest：
 * 让用户可以把单个工具添加到主屏幕，打开即全屏使用该工具。
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // v1.14.0 容错：网络失败时返回 404（manifest 仅作增强能力，不影响页面使用）
  let tool: Awaited<ReturnType<typeof fetchToolById>>;
  try {
    tool = await fetchToolById(id);
  } catch {
    return new NextResponse("not found", { status: 404 });
  }
  if (!tool) {
    return new NextResponse("not found", { status: 404 });
  }

  // 封面图作为应用图标；blob: 或空封面回退默认图标
  let iconSrc = "/icon-512.png";
  if (tool.coverUrl && tool.coverUrl.startsWith("http")) {
    iconSrc = tool.coverUrl;
  } else if (tool.coverUrl && !tool.coverUrl.startsWith("blob:")) {
    iconSrc = tool.coverUrl;
  }

  const manifest = {
    name: tool.title || "WeWoo 小工具",
    short_name: (tool.title || "WeWoo").slice(0, 12),
    description: tool.description || "",
    start_url: `/tool/${id}?app=1`,
    scope: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#4f46e5",
    orientation: "portrait",
    icons: [
      { src: iconSrc, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}