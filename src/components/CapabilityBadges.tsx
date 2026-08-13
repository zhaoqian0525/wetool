"use client";

import { useMemo } from "react";
import { scanCapabilities, type CapabilityInfo } from "@/lib/capabilities";

/**
 * 工具能力徽章（v2.0.0 权限透明反馈）
 * 展示该工具能做什么（✅）/ 不能做什么（❌），由代码静态扫描结果生成。
 */
export default function CapabilityBadges({
  code,
  className = "",
  showEmpty = false,
}: {
  code: string;
  className?: string;
  /** 没有检测到任何能力时是否显示"无特殊能力"占位 */
  showEmpty?: boolean;
}) {
  const caps = useMemo<CapabilityInfo[]>(() => scanCapabilities(code ?? ""), [code]);

  if (caps.length === 0) {
    if (!showEmpty) return null;
    return (
      <div className={"flex flex-wrap gap-1.5 " + className}>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-500 px-2.5 py-1 text-xs">
          🛡️ 纯本地运行，无特殊权限
        </span>
      </div>
    );
  }

  return (
    <div className={"flex flex-wrap gap-1.5 " + className}>
      {caps.map((c) => (
        <span
          key={c.key}
          title={c.available ? "沙盒内可用" : "沙盒内会被拦截"}
          className={
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium " +
            (c.available
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-600 border border-rose-200")
          }
        >
          <span>{c.available ? "✅" : "⛔"}</span>
          <span>{c.icon}</span>
          <span>{c.label}</span>
        </span>
      ))}
    </div>
  );
}