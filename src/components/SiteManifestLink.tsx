"use client";

import { usePathname } from "next/navigation";

/**
 * v1.9.9 站点级 PWA manifest 链接（仅非工具页注入）。
 * 背景：Next 的 app/manifest.ts 会自动给所有页面注入站点 manifest，工具页因此同时存在
 * 两个 manifest（站点 + 工具），iOS 添加到主屏幕时一半概率取到站点 start_url(/)，
 * 打开变成 we-woo.net 而不是工具。
 * 修复：站点 manifest 改为手动路由；此组件只在非 /tool/ 页面渲染站点 manifest，
 * 工具页只保留工具 layout 注入的工具 manifest，保证每页只有一个 manifest。
 */
export default function SiteManifestLink() {
  const pathname = usePathname();
  if (pathname?.startsWith("/tool/")) return null;
  return <link rel="manifest" href="/manifest.webmanifest" />;
}
