import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "创作工具",
  description: "用 HTML/CSS/JavaScript 创建你的在线小工具，一键发布分享给所有人。",
  alternates: { canonical: "https://we-woo.net/create" },
  openGraph: {
    title: "创作工具 | 微坞 WeWoo",
    description: "用 HTML/CSS/JavaScript 创建你的在线小工具，一键发布分享给所有人。",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
