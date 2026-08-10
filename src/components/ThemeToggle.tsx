"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "wewoo-theme";

/** 读取当前生效主题（跟随 html[data-theme]） */
export function getCurrentTheme(): "dark" | "light" {
  if (typeof document !== "undefined") {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }
  return "light";
}

/** 设置主题并持久化（首次访问跟随系统偏好） */
export function setTheme(theme: "dark" | "light") {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#0b1220" : "#4f46e5");
}

/**
 * v1.12.1 深色/浅色切换按钮
 * 首次渲染前由 layout 内联脚本设置 data-theme（防闪烁），这里只负责切换与图标状态。
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(getCurrentTheme() === "dark");
  }, []);

  const toggle = () => {
    const next: "dark" | "light" = getCurrentTheme() === "dark" ? "light" : "dark";
    setTheme(next);
    setDark(next === "dark");
  };

  return (
    <button
      data-testid="theme-toggle"
      onClick={toggle}
      aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}
      title={dark ? "切换到浅色模式" : "切换到深色模式"}
      className={`min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
    >
      {dark === null ? (
        <span className="w-4 h-4 rounded-full bg-gray-300 animate-pulse" />
      ) : dark ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36l-1.42 1.42M7.06 16.94l-1.42 1.42M18.36 18.36l-1.42-1.42M7.06 7.06L5.64 5.64M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}