import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, getAdminServiceClient, unauthorizedResponse } from "@/lib/api-auth";

/**
 * POST /api/admin/reports/[id]/resolve
 * Body: { status: "resolved" | "rejected", note?: string }
 * 管理员处理举报（v2.0.1）。
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();
  if (!ctx.isAdmin) {
    return NextResponse.json({ error: "无管理员权限" }, { status: 403 });
  }

  let body: { status?: string; note?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const status = body.status;
  if (status !== "resolved" && status !== "rejected" && status !== "processing") {
    return NextResponse.json({ error: "status 必须为 resolved/rejected/processing" }, { status: 400 });
  }

  // reports 表无 UPDATE 策略，管理员处理必须走 service_role（代码层已校验 isAdmin）
  const admin = getAdminServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "服务器未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }
  const { error } = await admin
    .from("reports")
    .update({
      status,
      note: body.note ? String(body.note).slice(0, 200) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.warn("[admin/reports/resolve] error:", error.message);
    return NextResponse.json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }

  // v2.12.0：处理结果通知举报人（服务端 service_role；失败不阻塞主流程）
  try {
    const { data: reportRow } = await admin
      .from("reports")
      .select("user_id, tool_id")
      .eq("id", id)
      .single();
    if (reportRow && reportRow.user_id) {
      let toolTitle = "";
      if (reportRow.tool_id) {
        const { data: toolRow } = await admin
          .from("tools")
          .select("title")
          .eq("id", String(reportRow.tool_id))
          .single();
        toolTitle = String(toolRow?.title ?? "");
      }
      await admin.from("notifications").insert({
        user_id: reportRow.user_id,
        type: "system",
        actor_name: "平台管理员",
        tool_id: String(reportRow.tool_id ?? ""),
        tool_title: toolTitle,
        content: status === "resolved" ? "你举报的工具已处理，感谢你的反馈。" : "你举报的内容经核实未违规，已驳回。",
        read: false,
      });
    }
  } catch (e) {
    console.warn("[admin/reports/resolve] notify error:", e instanceof Error ? e.message : e);
  }

  return NextResponse.json({ ok: true });
}
