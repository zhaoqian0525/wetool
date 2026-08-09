"use client";

import type { ReactNode } from "react";

/**
 * 统一居中弹窗外壳：遮罩 + 白色卡片 + 进出场动画。
 * 传 onClose 才允许点遮罩关闭（无关闭按钮/遮罩关闭的弹窗不传即可，行为与旧版一致）。
 */
export function Modal({
  open,
  onClose,
  maxWidth = "max-w-sm",
  z = "z-50",
  cardClassName = "",
  children,
}: {
  open: boolean;
  onClose?: () => void;
  maxWidth?: string;
  z?: string;
  cardClassName?: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 ${z} flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden animate-in zoom-in-95 duration-300 ${cardClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/** 语义徽章：浅色底 + 深色字的小标签（分类/状态/下载型等） */
export function Badge({
  children,
  tone = "brand",
  className = "",
}: {
  children: ReactNode;
  tone?: "brand" | "green" | "amber" | "red" | "gray";
  className?: string;
}) {
  const tones: Record<string, string> = {
    brand: "text-indigo-600 bg-indigo-50",
    green: "text-green-700 bg-green-100",
    amber: "text-amber-600 bg-amber-50",
    red: "text-red-600 bg-red-50",
    gray: "text-gray-600 bg-gray-100",
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}