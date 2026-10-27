import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const BASE_URL = "https://we-woo.net";
const BUILTIN_TOOL_IDS = [
  "1", "2", "3", "4", "6", "7", "8", "9", "10",
  "11", "12", "13", "14", "16", "17", "18",
];

function safeDate(value: unknown): Date {
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function fetchPublicToolEntries(): Promise<MetadataRoute.Sitemap> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://cvacrykzcppiflmvwwfe.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu";

  if (!url || !key || url.includes("your-project")) return [];

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("tools")
      .select("id, created_at")
      .eq("visibility", "public")
      .eq("is_banned", false)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error || !data) return [];
    return data.map((row) => ({
      url: `${BASE_URL}/tool/${String(row.id)}`,
      lastModified: safeDate(row.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /create 与 /auth 不参与搜索收录；/real-hourly-wage 是获客落地页。
  const staticPages = ["", "/real-hourly-wage", "/guide", "/terms", "/privacy"];
  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : 0.7,
  }));

  const builtinEntries: MetadataRoute.Sitemap = BUILTIN_TOOL_IDS.map((id) => ({
    url: `${BASE_URL}/tool/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const dbEntries = await fetchPublicToolEntries();
  return [...staticEntries, ...builtinEntries, ...dbEntries];
}
