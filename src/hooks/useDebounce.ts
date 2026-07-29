"use client";

import { useState, useEffect, useRef } from "react";

/**
 * 防抖 hook：value 变化后延迟 delay 毫秒才更新返回值。
 * 用于将高频变化（如编辑器输入）降低为低频更新，避免昂贵的重渲染（如 iframe srcdoc 重建）。
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track first render to immediately sync
  const firstRenderRef = useRef(true);

  useEffect(() => {
    // First render: immediately sync to avoid flash of empty content
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      setDebouncedValue(value);
      return;
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
