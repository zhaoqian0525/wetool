import type { Metadata } from "next";
import { MOCK_TOOLS } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cvacrykzcppiflmvwwfe.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu";

export async function generateStaticParams() {
  const userIds = [...new Set(MOCK_TOOLS.map((t) => t.authorId).filter(Boolean))];
  return userIds.map((id) => ({ id: id! }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = "https://we-woo.net";
  const url = `${baseUrl}/user/${id}`;
  const mock = MOCK_TOOLS.find((t) => t.authorId === id);
  let name = mock?.author ?? "";
  let toolCount = MOCK_TOOLS.filter((t) => t.authorId === id).length;

  // 真实用户：以最新工具的作者名 + 发布数量作为主页分享信息
  if (!mock && id.length > 5) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data } = await supabase
        .from("tools")
        .select("author")
        .eq("author_id", id)
        .limit(1);
      if (data && data.length > 0) {
        name = String(data[0].author ?? "");
        const { count } = await supabase
          .from("tools")
          .select("*", { count: "exact", head: true })
          .eq("author_id", id);
        toolCount = count ?? 0;
      }
    } catch {
      // 查询失败时保持默认
    }
  }

  const displayName = name || "微坞用户";
  return {
    title: `${displayName} 的主页`,
    description: `${displayName} 在微坞 WeWoo 发布了 ${toolCount} 个 AI 小工具，点开即用。`,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      url,
      title: `${displayName} 的主页 | 微坞 WeWoo`,
      description: `${displayName} 在微坞 WeWoo 发布了 ${toolCount} 个 AI 小工具，点开即用。`,
      siteName: "微坞 WeWoo",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${displayName} 的主页` }],
    },
  };
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
