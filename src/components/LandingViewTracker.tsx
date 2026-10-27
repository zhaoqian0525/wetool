"use client";

import { useEffect } from "react";
import { trackGrowthEvent } from "@/lib/growth";

export default function LandingViewTracker({
  toolId,
  path,
  onceKey,
}: {
  toolId: string;
  path: string;
  onceKey: string;
}) {
  useEffect(() => {
    trackGrowthEvent("tool_open", { toolId, path, onceKey });
  }, [toolId, path, onceKey]);

  return null;
}
