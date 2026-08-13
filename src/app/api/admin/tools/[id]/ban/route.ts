import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, unauthorizedResponse } from "@/lib/api-auth";
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
  const { error } = await ctx.supabase
    .from("tools")
    .update({ is_banned: body.banned })
    .eq("id", dbId);

  if (error) {
    console.warn("[admin/ban] error:", error.message);
    return NextResponse.json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, banned: body.banned });
}