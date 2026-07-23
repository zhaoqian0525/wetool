import { MOCK_TOOLS } from "@/lib/data";

export async function generateStaticParams() {
  const userIds = [...new Set(MOCK_TOOLS.map((t) => t.authorId).filter(Boolean))];
  return userIds.map((id) => ({ id: id! }));
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
