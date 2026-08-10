"use client";

import Image from "next/image";

/**
 * 通用头像组件（v1.13.1）
 * 有 avatarUrl 显示图片（next/image），否则显示名字首字母渐变圆。
 */
export default function Avatar({
  url,
  name,
  size = 32,
  className = "",
}: {
  url?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const initial = (name?.trim()?.[0] ?? "U").toUpperCase();

  if (url) {
    return (
      <Image
        src={url}
        alt={name || "头像"}
        width={size}
        height={size}
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-[#5046E5] to-[#8B5CF6] text-white font-bold flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(12, size * 0.42) }}
      aria-label={name || "用户头像"}
    >
      {initial}
    </div>
  );
}
