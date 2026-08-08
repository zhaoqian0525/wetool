"use client";

import { useEffect, useState } from "react";

/**
 * v1.8.8 工具页「添加到主屏幕」按钮
 * - 桌面/Android Chrome：beforeinstallprompt -> 点击弹系统安装框
 * - iPhone/iPad Safari：点击显示「分享 → 添加到主屏幕」引导
 * - 已安装（standalone）或不支持的浏览器不显示
 */
export default function ToolInstallButton({ compact = false }: { compact?: boolean }) {
  const [deferred, setDeferred] = useState<{ prompt?: () => Promise<void> } | null>(null);
  const [ios, setIos] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    try {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).standalone === true;
      if (standalone) return;
      if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
        setIos(true);
        setSupported(true);
        return;
      }
      const onBip = (e: Event) => {
        e.preventDefault();
        setDeferred(e as unknown as { prompt?: () => Promise<void> });
        setSupported(true);
      };
      window.addEventListener("beforeinstallprompt", onBip);
      return () => window.removeEventListener("beforeinstallprompt", onBip);
    } catch {
      /* ignore */
    }
  }, []);

  if (!supported) return null;

  return (
    <>
      <button
        onClick={() => {
          if (deferred) {
            deferred.prompt?.().catch(() => {});
            setDeferred(null);
          } else if (ios) {
            setGuideOpen(true);
          }
        }}
        style={{ touchAction: "manipulation" }}
        className={`${compact ? "h-8 px-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50" : "min-h-[44px] px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"} flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors`}
        title="添加到手机主屏幕，像 App 一样打开"
      >
        <span className="text-base leading-none">📲</span>
        <span className="hidden sm:inline">添加到主屏幕</span>
        <span className="sm:hidden">安装</span>
      </button>

      {guideOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setGuideOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 mb-2">📲 添加到主屏幕</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              在 Safari 浏览器里按下面步骤操作，这个工具就会像 App 一样出现在主屏幕上，点开直接全屏使用：
            </p>
            <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
              <li>点底部分享按钮 <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded">⬆️</span></li>
              <li>往下滑，点 <b>「添加到主屏幕」</b></li>
              <li>点右上角「添加」完成</li>
            </ol>
            <button
              onClick={() => setGuideOpen(false)}
              className="w-full min-h-[44px] bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
              style={{ touchAction: "manipulation" }}
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
}