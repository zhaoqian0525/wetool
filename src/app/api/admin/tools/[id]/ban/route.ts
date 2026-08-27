import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, getAdminServiceClient, unauthorizedResponse } from "@/lib/api-auth";
import { toDbToolId } from "@/lib/builtinIds";

/**
 * POST /api/admin/tools/[id]/ban
 * Body: { banned: boolean }
 * 管理员下架 / 恢复工具（v2.0.1 审核底线）。
 * 权限：ADMIN_EMAILS 环境变量中的邮箱（默认站长邮箱）。
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

  let body: { banned?: boolean };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (typeof body.banned !== "boolean") {
    return NextResponse.json({ error: "banned 必须为布尔值" }, { status: 400 });
  }

  const dbId = toDbToolId(id);
  // RLS 只允许作者更新自己的工具，管理员下架必须走 service_role（代码层已校验 isAdmin）
  const admin = getAdminServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "服务器未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }
  const { error } = await admin
    .from("tools")
    .update({ is_banned: body.banned })
    .eq("id", dbId);

  if (error) {
    console.warn("[admin/ban] error:", error.message);
    return NextResponse.json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }

  // v2.12.0：下架/恢复时通知作者（服务端 service_role，不受 RLS 限制；失败不阻塞主流程）
  try {
    const { data: toolRow } = await admin
      .from("tools")
      .select("author_id, title")
      .eq("id", dbId)
      .single();
    if (toolRow && toolRow.author_id) {
      await admin.from("notifications").insert({
        user_id: toolRow.author_id,
        type: "system",
        actor_name: "平台管理员",
        tool_id: dbId,
        tool_title: String(toolRow.title ?? ""),
        content: body.banned
          ? "你的工具因收到举报/违规已被平台下架，如有疑问可联系管理员申诉。"
          : "你的工具已恢复公开。",
        read: false,
      });
    }
  } catch (e) {
    console.warn("[admin/ban] notify error:", e instanceof Error ? e.message : e);
  }

  return NextResponse.json({ ok: true, banned: body.banned });
}
