"use client";

import { useEffect } from "react";
import { initGrowthTracking } from "@/lib/growth";

/** 全站匿名增长追踪：首次访问、回访、UTM 归因 */
export default function GrowthTracker() {
  useEffect(() => {
    initGrowthTracking();
  }, []);

  return null;
}
