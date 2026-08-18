"use client";

import { useEffect } from "react";

/**
 * v2.1.9：工具页 manifest 强制刷新。
 * iOS Safari 对 manifest 缓存非常顽固：从首页客户端导航进入工具页时，
 * 常常不重新抓取工具 manifest，继续用缓存的站点 manifest，导致「添加到主屏幕」
 * 存成主站首页。这里在工具页挂载后主动把 manifest link 指到带版本的工具 manifest，
 * 并预热请求一次，强制 iOS 拿到正确的 start_url（/tool/:id?app=1）。
 */
export default function ToolManifestLink({ id }: { id: string }) {
  useEffect(() => {
    const href = `/tool/${encodeURIComponent(id)}/manifest.webmanifest?v=3`;

    // 预热：主动请求一次工具 manifest，确保 iOS 缓存的是正确内容
    fetch(href, { cache: "no-store" }).catch(() => {});

    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [id]);

  return null;
}
