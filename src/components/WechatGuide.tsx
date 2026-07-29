"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * 检测是否在微信内置浏览器中
 *
 * 微信内置浏览器基于 X5 内核（QQ浏览器内核），对 iframe sandbox
 * 和 blob: URL 支持不完善，导致工具无法正常加载。
 *
 * 此 hook 通过 navigator.userAgent 检测 MicroMessenger 标识。
 */
export function useIsWechat(): boolean {
  const [isWechat, setIsWechat] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsWechat(/MicroMessenger/i.test(navigator.userAgent));
    }
  }, []);

  return isWechat;
}

/**
 * 微信内置浏览器引导组件
 *
 * 在微信中打开工具详情页时：
 * 1. iframe 仍然渲染（部分微信版本可能支持）
 * 2. 叠加半透明蒙层阻止交互
 * 3. 显示引导卡片：提示用户用系统浏览器打开
 * 4. 提供"复制链接"按钮
 */
export function WechatGuide({
  children,
  toolUrl,
  className,
}: {
  children: React.ReactNode;
  toolUrl?: string;
  className?: string;
}) {
  const isWechat = useIsWechat();
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUrl =
    toolUrl ||
    (typeof window !== "undefined" ? window.location.href : "");

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 失败时降级为选中文本
      const textarea = document.createElement("textarea");
      textarea.value = currentUrl;
      textarea.style.cssText =
        "position:fixed;left:-9999px;top:-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // 完全失败，不做处理
      }
      document.body.removeChild(textarea);
    }
  }, [currentUrl]);

  // 非微信环境或已关闭提示 → 正常渲染
  if (!isWechat || dismissed) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      {/* iframe 仍然渲染（部分微信版本可用） */}
      {children}

      {/* 半透明蒙层 + 引导卡片 */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center p-4"
        style={{ background: "rgba(255,255,255,0.85)" }}
        role="dialog"
        aria-label="微信环境提示"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-5 max-w-xs w-full text-center">
          {/* 图标 */}
          <div className="w-14 h-14 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-7 h-7 text-orange-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* 标题 */}
          <h2 className="text-base font-semibold text-gray-900 mb-1.5">
            微信内无法使用此工具
          </h2>

          {/* 说明 */}
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            请点击右上角{" "}
            <span className="font-bold text-gray-700 text-base">···</span>{" "}
            选择「在浏览器打开」，即可正常使用。
          </p>

          {/* 提示小字 */}
          <p className="text-xs text-gray-400 mb-4">
            也可以复制链接后在手机浏览器中粘贴打开
          </p>

          {/* 按钮组 */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCopyLink}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-[0.97] transition-all"
              style={{ touchAction: "manipulation" }}
            >
              {copied ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  已复制
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  复制链接
                </>
              )}
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="w-full min-h-[44px] px-4 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors active:scale-[0.97]"
              style={{ touchAction: "manipulation" }}
            >
              忽略，继续使用
            </button>
          </div>

          {/* 底部提示 */}
          <p className="text-[11px] text-gray-300 mt-3">
            部分微信版本可能仍可正常使用
          </p>
        </div>
      </div>
    </div>
  );
}
