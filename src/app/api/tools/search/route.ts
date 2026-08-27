import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/tools/search?q=关键词
 * 服务端搜索公开工具（title / description / author 模糊匹配），最多 50 条。
 * 内置工具（1-18）不在数据库，由前端与本地内置工具结果合并展示。
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // v1.15.0：过滤 PostgREST .or() 特殊字符，防止把用户输入拼进过滤串造成注入
  const rawQ = (request.nextUrl.searchParams.get("q") || "").trim().slice(0, 100);
  if (!rawQ) return NextResponse.json({ tools: [] });
  const q = rawQ.replace(/[,()'"\\*]/g, " ").replace(/\s+/g, " ").trim();
  if (!q) return NextResponse.json({ tools: [] });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvacrykzcppiflmvwwfe.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu";
  if (!url || !key || url.includes("your-project")) {
    return NextResponse.json({ tools: [] });
  }

  const supabase = createClient(url, key);
  const pattern = `%${q}%`;

  const { data, error } = await supabase
    .from("tools")
    .select("id, title, description, author, author_id, category, cover_url, thumbnail_gradient, is_downloadable, created_at, visibility, source_tool_id, view_count, layout_target")
    .eq("visibility", "public")
    .eq("is_banned", false)
    .or(`title.ilike.${pattern},description.ilike.${pattern},author.ilike.${pattern}`)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ tools: [] });
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
    layoutTarget: String(row.layout_target ?? "") === "desktop" ? "desktop" : "mobile",
  }));

  return NextResponse.json({ tools });
}
