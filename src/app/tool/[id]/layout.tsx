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

  // MOCK_TOOLS 中没找到 → 查 Supabase
  if (!mockTool && id.length > 5) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data } = await supabase.from("tools").select("title,description").eq("id", id).single();
      if (data) {
        title = data.title;
        description = data.description ?? "";
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

  return {
    title,
    description: description || `${title} - 在线小工具`,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${title} | 微坞 WeWoo`,
      description: description || `${title} - 在线小工具`,
      siteName: "微坞 WeWoo",
      images: [
        { url: "/og.png", width: 1200, height: 630, alt: `${title} | 微坞 WeWoo` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || "",
      images: ["/og.png"],
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
      <link rel="manifest" href={`/tool/${id}/manifest.webmanifest`} />
      {children}
    </>
  );
}
