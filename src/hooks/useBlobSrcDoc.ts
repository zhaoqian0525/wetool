"use client";

import { useRef, useEffect, useState } from "react";
import { wrapSecureSrcDoc } from "@/lib/sandbox";

/**
 * 将 HTML 代码包装并转为 Blob URL。
 *
 * 为什么用 Blob URL 替代 srcdoc：
 * - 部分内嵌浏览器（微信、QQ、某些 Android WebView）不支持 iframe srcdoc
 * - srcdoc 的 iframe onLoad 在这些环境永远不触发，导致骨架屏卡死
 * - Blob URL 兼容性远好于 srcdoc，所有现代浏览器都支持
 *
 * 返回 { blobUrl, sandbox } 直接用于 <iframe src={blobUrl} sandbox={sandbox} />
 * blobUrl 在 rawCode 变化时自动更新，组件卸载时自动 revoke。
 */
export function useBlobSrcDoc(rawCode: string): { blobUrl: string; sandbox: string } {
  const blobUrlRef = useRef<string | null>(null);
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    // revoke previous URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    if (!rawCode) {
      blobUrlRef.current = null;
      setBlobUrl("");
      return;
    }

    const html = wrapSecureSrcDoc(rawCode);
    const blob = new Blob([html], { type: "text/html; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    setBlobUrl(url);

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [rawCode]);

  return { blobUrl, sandbox: "allow-scripts allow-same-origin" };
}
