import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, getAdminServiceClient, unauthorizedResponse } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/usage
 * v2.1.0 M3 用量看板：AI 调用记录 + 今日汇总 + 代理请求记录（需管理员）
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();
  if (!ctx.isAdmin) {
    return NextResponse.json({ error: "无管理员权限" }, { status: 403 });
  }

  const admin = getAdminServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "服务器未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const out: Record<string, unknown> = { initialized: true, today };

  // ---- AI 用量 ----
  try {
    const [recent, summary, byTool] = await Promise.all([
      admin
        .from("ai_usage")
        .select("id, tool_id, user_id, ip, model, prompt_tokens, completion_tokens, total_tokens, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("ai_usage")
        .select("id, total_tokens", { count: "exact", head: false })
        .gte("created_at", today + "T00:00:00.000Z")
        .lte("created_at", today + "T23:59:59.999Z"),
      admin
        .from("ai_usage")
        .select("tool_id, total_tokens")
        .gte("created_at", today + "T00:00:00.000Z")
        .lte("created_at", today + "T23:59:59.999Z"),
    ]);

    const rows = (recent.data ?? []) as Record<string, unknown>[];
    const todayRows = (summary.data ?? []) as Record<string, unknown>[];
    const toolRows = (byTool.data ?? []) as Record<string, unknown>[];

    // 按工具聚合今日 tokens
    const byToolMap = new Map<string, { calls: number; tokens: number }>();
    for (const r of toolRows) {
      const key = String(r.tool_id || "未知工具");
      const cur = byToolMap.get(key) ?? { calls: 0, tokens: 0 };
      cur.calls++;
      cur.tokens += Number(r.total_tokens ?? 0);
      byToolMap.set(key, cur);
    }

    out.aiUsage = {
      recent: rows.map((r) => ({
        id: String(r.id),
        toolId: String(r.tool_id ?? ""),
        userId: r.user_id ? String(r.user_id) : null,
        ip: String(r.ip ?? ""),
        model: String(r.model ?? ""),
        promptTokens: Number(r.prompt_tokens ?? 0),
        completionTokens: Number(r.completion_tokens ?? 0),
        totalTokens: Number(r.total_tokens ?? 0),
        createdAt: String(r.created_at ?? ""),
      })),
      todayCalls: todayRows.length,
      todayTokens: todayRows.reduce((s, r) => s + Number(r.total_tokens ?? 0), 0),
      byTool: Array.from(byToolMap.entries()).map(([tool, v]) => ({ tool, ...v })).sort((a, b) => b.tokens - a.tokens),
    };
  } catch (e) {
    out.aiUsage = null;
    out.aiError = e instanceof Error ? e.message : "查询失败";
  }

  // ---- 代理请求 ----
  try {
    const [recent, todayProxy] = await Promise.all([
      admin
        .from("proxy_log")
        .select("id, tool_id, user_id, ip, url, status, size, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      admin
        .from("proxy_log")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today + "T00:00:00.000Z")
        .lte("created_at", today + "T23:59:59.999Z"),
    ]);
    out.proxyLog = {
      recent: ((recent.data ?? []) as Record<string, unknown>[]).map((r) => ({
        id: String(r.id),
        toolId: String(r.tool_id ?? ""),
        userId: r.user_id ? String(r.user_id) : null,
        ip: String(r.ip ?? ""),
        url: String(r.url ?? ""),
        status: Number(r.status ?? 0),
        size: Number(r.size ?? 0),
        createdAt: String(r.created_at ?? ""),
      })),
      todayCalls: todayProxy.count ?? 0,
    };
  } catch (e) {
    out.proxyLog = null;
    out.proxyError = e instanceof Error ? e.message : "查询失败";
  }

  // 表未初始化（常见于尚未执行 SQL 迁移）
  if (!out.aiUsage && !out.proxyLog && (out.aiError || out.proxyError)) {
    out.initialized = false;
  }

  return NextResponse.json(out);
}
