import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, getAdminServiceClient, unauthorizedResponse } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** 通知类型：评论 / 回复 / 点赞 / 收藏 / 系统（后续可扩展关注） */
const NOTIFY_TYPES = new Set(["comment", "reply", "like", "save", "system"]);

/**
 * GET /api/notifications —— 当前登录用户的通知列表（含未读数）
 */
export async function GET(request: NextRequest) {
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();

  try {
    const { data, error } = await ctx.supabase
      .from("notifications")
      .select("id, type, actor_id, actor_name, tool_id, tool_title, content, read, created_at")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const unread = (data ?? []).filter((n) => !n.read).length;
    return NextResponse.json({ notifications: data ?? [], unread });
  } catch {
    return NextResponse.json({ error: "通知加载失败" }, { status: 500 });
  }
}

/**
 * POST /api/notifications —— 创建通知（服务端 service_role，供收藏/评论等触发）
 * body: { userId, type, actorName?, toolId?, toolTitle?, content }
 */
export async function POST(request: NextRequest) {
  const admin = getAdminServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "服务器未配置通知服务" }, { status: 500 });
  }
  let body: { userId?: unknown; type?: unknown; actorName?: unknown; toolId?: unknown; toolTitle?: unknown; content?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const userId = typeof body.userId === "string" ? body.userId : "";
  const type = typeof body.type === "string" ? body.type : "system";
  if (!userId) return NextResponse.json({ error: "userId 不能为空" }, { status: 400 });
  if (!NOTIFY_TYPES.has(type)) return NextResponse.json({ error: "通知类型不支持" }, { status: 400 });

  try {
    const { error } = await admin.from("notifications").insert({
      user_id: userId,
      type,
      actor_name: typeof body.actorName === "string" ? body.actorName.slice(0, 80) : null,
      tool_id: typeof body.toolId === "string" ? body.toolId.slice(0, 100) : null,
      tool_title: typeof body.toolTitle === "string" ? body.toolTitle.slice(0, 200) : null,
      content: typeof body.content === "string" ? body.content.slice(0, 500) : null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "通知创建失败" }, { status: 500 });
  }
}

/**
 * PATCH /api/notifications —— 全部标记已读
 */
export async function PATCH(request: NextRequest) {
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();
  try {
    const { error } = await ctx.supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", ctx.userId)
      .eq("read", false);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "标记已读失败" }, { status: 500 });
  }
}
