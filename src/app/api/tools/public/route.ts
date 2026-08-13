import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/tools/public
 * 公开工具列表（服务端直查 + CDN 缓存，v2.0.0 容量地基）：
 * - 只取列表所需字段，不拉完整 HTML code（网络体积 -80%+）
 * - Cache-Control: s-maxage=60 + stale-while-revalidate=300 → CDN 层缓存，
 *   首页/搜索/广场并发访问不再每次都打 Supabase
 * - 与原有 fetchTools() 直查逻辑同构：内置工具（1-18）不在数据库，由前端合并展示
 */
export const dynamic = "force-dynamic";

const LEAN_SELECT = "id, title, description, author, author_id, category, cover_url, thumbnail_gradient, is_downloadable, created_at, visibility, source_tool_id, view_count, is_banned";
const MAX_TOOLS = 200;

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvacrykzcppiflmvwwfe.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu";
  if (!url || !key || url.includes("your-project")) {
    return NextResponse.json({ tools: [] }, { status: 200 });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("tools")
    .select(LEAN_SELECT)
    .eq("visibility", "public")
    .eq("is_banned", false)
    .order("created_at", { ascending: false })
    .limit(MAX_TOOLS);

  if (error) {
    // 数据源失败时让客户端走原有直查兜底，这里返回空列表 + 短缓存
    return NextResponse.json({ tools: [], error: error.message }, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  }

  const tools = (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    title: String(row.title ?? ""),
    description: row.description ? String(row.description) : undefined,
    author: String(row.author ?? ""),
    authorId: row.author_id ? String(row.author_id) : undefined,
    category: String(row.category ?? "生活"),
    coverUrl: row.cover_url ? String(row.cover_url) : undefined,
    thumbnailGradient: String(row.thumbnail_gradient ?? ""),
    isDownloadable: row.is_downloadable === true || row.is_downloadable === "true" || undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    visibility: String(row.visibility ?? "public"),
    sourceToolId: row.source_tool_id ? String(row.source_tool_id) : undefined,
    viewCount: row.view_count !== undefined && row.view_count !== null ? Number(row.view_count) : undefined,
  }));

  return NextResponse.json({ tools }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}