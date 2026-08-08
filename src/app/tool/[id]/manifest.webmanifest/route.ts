import { NextResponse } from "next/server";
import { fetchToolById } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * v1.8.8 每个工具的独立 PWA manifest：
 * 让用户可以把单个工具添加到主屏幕，打开即全屏使用该工具。
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tool = await fetchToolById(id);
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
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
}