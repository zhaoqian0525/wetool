import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, getAdminServiceClient, unauthorizedResponse } from "@/lib/api-auth";

/**
 * GET /api/admin/reports?status=pending
 * 管理员查看举报列表（v2.0.1 审核底线），默认 pending 优先，最多 100 条。
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();
  if (!ctx.isAdmin) {
    return NextResponse.json({ error: "无管理员权限" }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status") || "pending";
  const allowed = ["pending", "processing", "resolved", "rejected", "all"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "status 参数不合法" }, { status: 400 });
  }

  const admin = getAdminServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "服务器未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }
  let query = admin
    .from("reports")
    .select("id, tool_id, user_id, reason, status, note, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    console.warn("[admin/reports] error:", error.message);
    return NextResponse.json({ reports: [] });
  }

  // 附带工具标题（批量查一次）
  const toolIds = Array.from(new Set((data ?? []).map((r: Record<string, unknown>) => String(r.tool_id))));
  let titleMap: Record<string, { title?: string; is_banned?: boolean }> = {};
  if (toolIds.length > 0) {
    const { data: tools } = await admin
      .from("tools")
      .select("id, title, is_banned")
      .in("id", toolIds);
    titleMap = Object.fromEntries((tools ?? []).map((t: Record<string, unknown>) => [String(t.id), t]));
  }

  const reports = (data ?? []).map((r: Record<string, unknown>) => {
    const tool = titleMap[String(r.tool_id)] as { title?: string; is_banned?: boolean } | undefined;
    return {
      id: String(r.id),
      toolId: String(r.tool_id),
      toolTitle: tool?.title ?? "（已删除）",
      isBanned: tool?.is_banned === true,
      reason: String(r.reason ?? ""),
      status: String(r.status ?? "pending"),
      note: r.note ? String(r.note) : undefined,
      createdAt: String(r.created_at ?? ""),
    };
  });

  return NextResponse.json({ reports });
}