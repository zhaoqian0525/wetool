import { MOCK_TOOLS } from "@/lib/data";

export async function generateStaticParams() {
  return MOCK_TOOLS.map((tool) => ({ id: tool.id }));
}

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
