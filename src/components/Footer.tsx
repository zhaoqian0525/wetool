"use client";

import Link from "next/link";
import versionInfo from "../../version.json";
import { WewooMark } from "@/components/WewooLogo";

export default function Footer() {
  return (
    <footer className="hidden lg:block border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <WewooMark className="w-6 h-6" />
            <span className="text-lg font-bold text-indigo-600">微坞</span>
            <span className="text-sm text-gray-400">WeWoo · AI小工具分享社区</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-indigo-600 transition-colors">首页</Link>
            <Link href="/create" className="hover:text-indigo-600 transition-colors">创作</Link>
            <Link href="/guide" className="hover:text-indigo-600 transition-colors">新手教程</Link>
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">服务条款</Link>
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">隐私政策</Link>
            <Link href="/changelog" className="hover:text-indigo-600 transition-colors">变更日志</Link>
          </nav>
        </div>
        <div className="mt-4 text-center text-xs text-gray-400">
          © 2026 微坞 WeWoo · we-woo.net · 保留所有权利
        </div>
        <div className="mt-1 text-center text-[10px] text-gray-400">
          v{versionInfo.version} · 更新于 {versionInfo.buildTimestamp ? new Date(versionInfo.buildTimestamp).toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : versionInfo.buildDate}
        </div>
      </div>
    </footer>
  );
}
