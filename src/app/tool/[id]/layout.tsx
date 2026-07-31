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
  let tool = MOCK_TOOLS.find((t) => t.id === id);

  // MOCK_TOOLS 中没找到 → 查 Supabase
  if (!tool && id.length > 5) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data } = await supabase.from("tools").select("title,description,author").eq("id", id).single();
      if (data) {
        tool = { id, title: data.title, description: data.description ?? "", author: data.author ?? "" };
      }
    } catch {
      // 查询失败时保持 tool 为空
    }
  }

  if (!tool) {
    return {
      title: "工具未找到",
      description: "抱歉，您访问的工具不存在。",
    };
  }

  const baseUrl = "https://we-woo.net";
  const url = `${baseUrl}/tool/${tool.id}`;

  return {
    title: tool.title,
    description: tool.description || `${tool.title} - 由 ${tool.author} 创建的在线小工具`,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${tool.title} | 微坞 WeWoo`,
      description: tool.description || `${tool.title} - 由 ${tool.author} 创建`,
      siteName: "微坞 WeWoo",
    },
    twitter: {
      card: "summary",
      title: tool.title,
      description: tool.description || "",
    },
  };
}

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
