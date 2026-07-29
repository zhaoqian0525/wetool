import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "新手教程 | 微坞 WeWoo",
  description: "手把手教你用微坞创建和发布小工具，零基础也能轻松上手。",
  alternates: { canonical: "https://we-woo.net/guide" },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
