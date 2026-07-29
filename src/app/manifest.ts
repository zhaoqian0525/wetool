import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "微坞 WeWoo - AI小工具分享社区",
    short_name: "WeWoo",
    description: "像发朋友圈一样分享你做的 AI 小工具，别人点开链接就能直接使用。",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#4f46e5",
    orientation: "portrait",
    categories: ["productivity", "utilities", "social"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "工具广场",
        url: "/",
        description: "浏览所有小工具",
      },
      {
        name: "开始创作",
        url: "/create",
        description: "创建新的小工具",
      },
    ],
  };
}
