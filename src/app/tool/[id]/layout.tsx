import type { Metadata } from "next";
import { MOCK_TOOLS } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cvacrykzcppiflmvwwfe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu";

export async function generateStaticParams() {
  return MOCK_TOOLS.map((tool) => ({ id: tool.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mockTool = MOCK_TOOLS.find((t) => t.id === id);

  let title = mockTool?.title ?? "";
  let description = mockTool?.description ?? "";
  let author = mockTool?.author ?? "";
  let coverUrl: string | null = mockTool ? `/covers/${id}.webp` : null;

  // MOCK_TOOLS 中没找到 → 查 Supabase（v1.13.1：同时取封面，分享卡片显示工具封面）
  if (!mockTool && id.length > 5) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data } = await supabase
        .from("tools")
        .select("title,description,author,cover_url")
        .eq("id", id)
        .single();
      if (data) {
        title = data.title;
        description = data.description ?? "";
        author = data.author ?? "";
        coverUrl = data.cover_url ? String(data.cover_url) : null;
      }
    } catch {
      // 查询失败时保持为空
    }
  }

  if (!title) {
    return {
      title: "工具未找到",
      description: "抱歉，您访问的工具不存在。",
    };
  }

  const baseUrl = "https://we-woo.net";
  const url = `${baseUrl}/tool/${id}`;
  // OG 图：优先工具封面（绝对 URL），兜底品牌 OG 图
  const ogImage = coverUrl
    ? { url: coverUrl, alt: `${title} | 微坞 WeWoo` }
    : { url: "/og.png", width: 1200, height: 630, alt: `${title} | 微坞 WeWoo` };
  const shareDescription = description
    ? `${description}${author ? ` · 作者 ${author}` : ""}`
    : `${title}${author ? ` - ${author}` : ""} - 在线小工具，点开即用`;

  return {
    title,
    description: shareDescription,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${title} | 微坞 WeWoo`,
      description: shareDescription,
      siteName: "微坞 WeWoo",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: shareDescription,
      images: [coverUrl ?? "/og.png"],
    },
  };
}

export default async function ToolLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      {/* v1.8.8 每个工具注入独立 PWA manifest，支持添加到主屏幕后打开即全屏 */}
      <link rel="manifest" href={`/tool/${id}/manifest.webmanifest?v=2`} />
      {children}
    </>
  );
}
