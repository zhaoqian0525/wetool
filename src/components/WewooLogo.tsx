"use client";

import { useId } from "react";

/**
 * 微坞 WeWoo 品牌标志（渐变版）
 * 几何来自品牌规范（viewBox 0 0 160 160）：靛蓝→紫渐变圆角方块 + 白色 W + 顶部节点青圆点
 */
export function WewooMark({ className = "w-6 h-6" }: { className?: string }) {
  const gid = useId();
  return (
    <svg className={className} viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5046E5" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="35" fill={`url(#${gid})`} />
      <path
        d="M30 34 L62 130 L80 78 L98 130 L130 34"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="80" cy="43" r="11" fill="#22D3EE" />
    </svg>
  );
}

/**
 * 微坞品牌标志单色版（墨黑底 + 白色 W，无圆点）
 * 用于小尺寸（favicon/PWA 图标）与深色场景，避免渐变发糊
 */
export function WewooMonoMark({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      <rect width="120" height="120" rx="26" fill="#0A1628" />
      <path
        d="M23 25 L47 97 L60 59 L73 97 L97 25"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}