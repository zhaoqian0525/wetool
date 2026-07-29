import type { Metadata } from "next";
import { MOCK_TOOLS } from "@/lib/data";

export async function generateStaticParams() {
  return MOCK_TOOLS.map((tool) => ({ id: tool.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tool = MOCK_TOOLS.find((t) => t.id === id);

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
