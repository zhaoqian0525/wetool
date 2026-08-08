"use client";

import { useEffect, useState } from "react";

/**
 * v1.8.6 安装到主屏幕提示
 * - 桌面 Chrome/Edge/Android：监听 beforeinstallprompt，显示「安装微坞」按钮
 * - iPhone/iPad Safari：没有安装 API，显示「添加到主屏幕」操作引导
 * - 用户关闭后不再打扰（localStorage 记录）；已安装（standalone）不显示
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt?: () => Promise<void> } | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("wewoo-install-dismissed")) return;
    } catch {
      /* ignore */
    }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).standalone === true;
    if (standalone) return;

    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (iOS) {
      setIsIos(true);
      setShow(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as { prompt?: () => Promise<void> });
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("wewoo-install-dismissed", "1");
    } catch {
      /* ignore */
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100vw-32px)] max-w-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl leading-none mt-0.5">📲</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {isIos ? "添加到主屏幕" : "安装微坞"}
            </p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {isIos
                ? "在 Safari 里点「分享」按钮 → 「添加到主屏幕」，之后像 App 一样随时打开。"
                : "安装后可从主屏幕直接打开，像原生 App 一样使用。"}
            </p>
            {!isIos && deferredPrompt && (
              <button
                onClick={() => {
                  deferredPrompt.prompt?.().catch(() => {});
                  setShow(false);
                }}
                className="mt-2 w-full min-h-[40px] bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
                style={{ touchAction: "manipulation" }}
              >
                立即安装
              </button>
            )}
          </div>
          <button
            onClick={dismiss}
            aria-label="关闭"
            className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1 shrink-0"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}