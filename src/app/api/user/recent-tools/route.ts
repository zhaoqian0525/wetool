import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, unauthorizedResponse } from "@/lib/api-auth";
import { MOCK_TOOLS } from "@/lib/data";
import { fromDbToolId } from "@/lib/builtinIds";

export interface RecentTool {
  id: string;
  title: string;
  thumbnailGradient: string;
  coverUrl?: string;
  author: string;
  category: string;
  lastUsedAt: string;
}

/**
 * GET /api/user/recent-tools
 * 返回当前登录用户最近使用过的工具列表（最多 6 个），身份来自 Authorization header。
 *
 * 说明：内置工具在前端 id 为 "1".."18"，云端 tool_state.tool_id 存的是稳定映射 UUID
 * （见 lib/builtinIds.ts）。查询到后通过 fromDbToolId 还原前端 id，并从 MOCK_TOOLS
 * 补充详情（数据库 tools 表没有内置工具行）。
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();

  // 1. 查询 tool_state，按 last_used_at 倒序取前 6
  const { data: states, error: stateError } = await ctx.supabase
    .from("tool_state")
    .select("tool_id, last_used_at")
    .eq("user_id", ctx.userId)
    .order("last_used_at", { ascending: false })
    .limit(6);

  if (stateError || !states || states.length === 0) {
    return NextResponse.json({ tools: [] });
  }

  // 2. 批量获取工具详情：数据库 tools + 内置工具 MOCK_TOOLS 兜底
  const dbIds = states.map((s: { tool_id: string }) => s.tool_id);
  const { data: tools, error: toolsError } = await ctx.supabase
    .from("tools")
    .select("id, title, thumbnail_gradient, cover_url, author, category")
    .in("id", dbIds);

  if (toolsError) {
    return NextResponse.json({ tools: [] });
  }

  const dbMap = new Map((tools ?? []).map((t: Record<string, unknown>) => [String(t.id), t]));
  const mockMap = new Map(MOCK_TOOLS.map((t) => [t.id, t]));

  // 3. 按 last_used_at 排序并组装
  const stateMap = new Map(states.map((s: { tool_id: string; last_used_at: string }) => [s.tool_id, s.last_used_at]));
  const result: RecentTool[] = [];

  for (const state of states) {
    const dbId = state.tool_id;
    const lastUsedAt = stateMap.get(dbId) || "";
    const row = dbMap.get(dbId);
    if (row) {
      result.push({
        id: String(row.id),
        title: String(row.title || ""),
        thumbnailGradient: String(row.thumbnail_gradient || ""),
        coverUrl: row.cover_url ? String(row.cover_url) : undefined,
        author: String(row.author || ""),
        category: String(row.category || "生活"),
        lastUsedAt,
      });
      continue;
    }
    // 内置工具：还原前端 id 并从 MOCK_TOOLS 取详情
    const frontId = fromDbToolId(dbId);
    const mock = frontId ? mockMap.get(frontId) : undefined;
    if (mock) {
      result.push({
        id: mock.id,
        title: mock.title,
        thumbnailGradient: mock.thumbnailGradient,
        coverUrl: mock.coverUrl || `/covers/${mock.id}.png`,
        author: mock.author,
        category: mock.category,
        lastUsedAt,
      });
    }
  }

  return NextResponse.json({ tools: result.slice(0, 6) });
}