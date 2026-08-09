"use client";

import { useEffect, useState } from "react";

/**
 * v1.9.1 工具页「添加到主屏幕」按钮
 * - 桌面/Android Chrome：beforeinstallprompt -> 点击弹系统安装框
 * - iPhone/iPad Safari：点击显示「分享 → 添加到主屏幕」引导
 * - 全站 PWA 已安装（standalone）时仍显示：引导复制链接后在浏览器里把单个工具添加到主屏幕
 */
export default function ToolInstallButton({ compact = false }: { compact?: boolean }) {
  const [deferred, setDeferred] = useState<{ prompt?: () => Promise<void> } | null>(null);
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [supported, setSupported] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const st =
        window.matchMedia("(display-mode: standalone)").matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigator as any).standalone === true;
      setStandalone(st);
      const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isIos) {
        setIos(true);
        // iOS：非 standalone 引导 Safari 分享；standalone（全站 PWA 已装）引导复制链接再添加单工具
        setSupported(true);
        return;
      }
      const onBip = (e: Event) => {
        e.preventDefault();
        setDeferred(e as unknown as { prompt?: () => Promise<void> });
        setSupported(true);
      };
      window.addEventListener("beforeinstallprompt", onBip);
      // Android 全站 PWA 已安装：不再触发 beforeinstallprompt，但仍显示引导
      if (st) setSupported(true);
      return () => window.removeEventListener("beforeinstallprompt", onBip);
    } catch {
      /* ignore */
    }
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = window.location.href;
        document.body.appendChild(ta);
        ta.select();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (document as any).execCommand("copy");
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* ignore */
      }
    }
  };

  if (!supported) return null;

  const guideIosBrowser = ios && !standalone;
  const guideStandalone = standalone;

  return (
    <>
      <button
        onClick={() => {
          if (deferred) {
            deferred.prompt?.().catch(() => {});
            setDeferred(null);
          } else if (ios || standalone) {
            setGuideOpen(true);
          }
        }}
        style={{ touchAction: "manipulation" }}
        className={`${compact ? "h-11 px-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50" : "min-h-[44px] px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"} flex items-center gap-1.5 text-xs font-medium text-gray-600 transition-colors`}
        title="把这个工具添加到手机主屏幕，像 App 一样打开即全屏使用"
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
            <h3 className="text-base font-bold text-gray-900 mb-2">📲 把这个工具加到主屏幕</h3>

            {guideIosBrowser && (
              <>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  在 Safari 浏览器里按下面步骤操作，这个工具会像 App 一样出现在主屏幕上，点开直接全屏使用：
                </p>
                <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
                  <li>点底部分享按钮 <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded">⬆️</span></li>
                  <li>往下滑，点 <b>「添加到主屏幕」</b></li>
                  <li>点右上角「添加」完成</li>
                </ol>
              </>
            )}

            {guideStandalone && (
              <>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  你现在是从主屏幕打开的微坞。想把这个工具也加到主屏幕，先<b>复制它的链接</b>，再到浏览器里添加：
                </p>
                <ol className="text-sm text-gray-700 space-y-2 mb-4 list-decimal list-inside">
                  <li>点下方「复制链接」</li>
                  <li>粘贴到 {ios ? "Safari" : "Chrome"} 浏览器打开</li>
                  <li>
                    {ios ? (
                      <>点分享 <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded">⬆️</span> → <b>「添加到主屏幕」</b> → 「添加」</>
                    ) : (
                      <>点菜单 <b>「添加到主屏幕」</b> → 确认添加</>
                    )}
                  </li>
                </ol>
                <button
                  onClick={copyLink}
                  className="w-full min-h-[44px] mb-2 brand-gradient text-white text-sm font-medium rounded-xl transition-opacity hover:opacity-90"
                  style={{ touchAction: "manipulation" }}
                >
                  {copied ? "✓ 已复制链接" : "复制链接"}
                </button>
              </>
            )}

            <button
              onClick={() => setGuideOpen(false)}
              className="w-full min-h-[44px] bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
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
