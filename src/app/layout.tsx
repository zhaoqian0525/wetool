import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";
import SiteManifestLink from "@/components/SiteManifestLink";
import Footer from "@/components/Footer";
import "./globals.css";

const baseUrl = "https://we-woo.net";

export const metadata: Metadata = {
  title: {
    default: "微坞 WeWoo - AI小工具分享社区",
    template: "%s | 微坞 WeWoo",
  },
  description:
    "像发朋友圈一样分享你做的 AI 小工具，别人点开链接就能直接使用。密码生成器、单位换算、旅行分账、古诗词抽查…丰富的在线小工具等你探索。",
  keywords: [
    "微坞", "WeWoo", "AI小工具", "在线工具", "单位换算",
    "密码生成器", "工具分享", "小程序", "在线计算器",
  ],
  authors: [{ name: "WeWoo Team" }],
  creator: "WeWoo",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: baseUrl,
    siteName: "微坞 WeWoo",
    title: "微坞 WeWoo - AI小工具分享社区",
    description: "像发朋友圈一样分享你做的 AI 小工具，别人点开链接就能直接使用。",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "微坞 WeWoo - AI小工具分享社区" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "微坞 WeWoo - AI小工具分享社区",
    description: "像发朋友圈一样分享你做的 AI 小工具，别人点开链接就能直接使用。",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "微坞 WeWoo",
  url: baseUrl,
  description: "AI小工具分享社区 - 像发朋友圈一样分享你做的 AI 小工具",
  potentialAction: {
    "@type": "SearchAction",
    target: `${baseUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://cvacrykzcppiflmvwwfe.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cvacrykzcppiflmvwwfe.supabase.co" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* v1.12.1 暗色模式：首帧前设置 data-theme，避免刷新闪烁（跟随系统 + localStorage 记忆） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("wewoo-theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=d?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`,
          }}
        />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900 min-h-screen">
        <SiteManifestLink />
        <ToastProvider>
          <AuthProvider>
            {children}
            <Footer />
          </AuthProvider>
        </ToastProvider>
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
