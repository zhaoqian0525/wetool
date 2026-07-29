import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface RecentTool {
  id: string;
  title: string;
  thumbnailGradient: string;
  author: string;
  category: string;
  lastUsedAt: string;
}

/**
 * GET /api/user/recent-tools?userId=xxx
 * 返回用户最近使用过的工具列表（最多 6 个），按 last_used_at 倒序
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ tools: [] });
  }

  // 1. 查询 tool_state，按 last_used_at 倒序取前 6
  const { data: states, error: stateError } = await supabase
    .from("tool_state")
    .select("tool_id, last_used_at")
    .eq("user_id", userId)
    .order("last_used_at", { ascending: false })
    .limit(6);

  if (stateError || !states || states.length === 0) {
    return NextResponse.json({ tools: [] });
  }

  // 2. 批量获取工具详情
  const toolIds = states.map((s: { tool_id: string }) => s.tool_id);
  const { data: tools, error: toolsError } = await supabase
    .from("tools")
    .select("id, title, thumbnail_gradient, author, category")
    .in("id", toolIds);

  if (toolsError || !tools) {
    return NextResponse.json({ tools: [] });
  }

  // 3. 按 last_used_at 排序并组装
  const stateMap = new Map(states.map((s: { tool_id: string; last_used_at: string }) => [s.tool_id, s.last_used_at]));
  const result: RecentTool[] = toolIds
    .map((tid): RecentTool | null => {
      const tool = tools.find((t: Record<string, unknown>) => String(t.id) === tid);
      if (!tool) return null;
      return {
        id: String(tool.id),
        title: String(tool.title || ""),
        thumbnailGradient: String(tool.thumbnail_gradient || ""),
        author: String(tool.author || ""),
        category: String(tool.category || "生活"),
        lastUsedAt: stateMap.get(tid) || "",
      };
    })
    .filter(Boolean) as RecentTool[];

  return NextResponse.json({ tools: result });
}
