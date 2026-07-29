"use client";

import { useRef, useEffect, useState } from "react";
import { wrapSecureSrcDoc } from "@/lib/sandbox";

/**
 * 将 HTML 代码包装后返回 iframe 可用的 srcDoc 和 blob URL。
 *
 * 两种加载策略：
 * - srcDoc（默认）：标准浏览器使用，包括 Safari / Chrome / Firefox。
 * - blobUrl（备用）：微信/QQ/X5 等部分内核浏览器不支持 srcdoc，
 *   需要用 blob: URL 加载。但 blob URL 有 origin 锁定问题——
 *   在 Safari 中 sandbox iframe 的 null origin 无法加载父页面创建的 blob URL。
 *   因此只在检测到微信/QQ/X5 时才启用 blob 模式。
 *
 * 返回 { srcDoc, blobUrl, sandbox }。
 * - 非微信环境：iframe 用 srcDoc，blobUrl 为空
 * - 微信环境：iframe 用 blobUrl（src），srcDoc 包含但不设置
 */
export function useBlobSrcDoc(rawCode: string): {
  srcDoc: string;
  blobUrl: string;
  sandbox: string;
} {
  const blobUrlRef = useRef<string | null>(null);
  const [srcDoc, setSrcDoc] = useState("");
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    if (!rawCode) {
      blobUrlRef.current = null;
      setSrcDoc("");
      setBlobUrl("");
      return;
    }

    const html = wrapSecureSrcDoc(rawCode);

    // srcDoc — 所有标准浏览器使用（包括 Safari）
    setSrcDoc(html);

    // blobUrl — 备用（微信/QQ/X5 内核需要）
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

  return { srcDoc, blobUrl, sandbox: "allow-scripts" };
}
