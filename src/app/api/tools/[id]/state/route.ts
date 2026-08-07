import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, unauthorizedResponse } from "@/lib/api-auth";
import { toDbToolId } from "@/lib/builtinIds";

/**
 * GET /api/tools/[id]/state
 * 获取当前登录用户在此工具下的保存状态（身份来自 Authorization header）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbId = toDbToolId(id);
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();

  const { data, error } = await ctx.supabase
    .from("tool_state")
    .select("state_data")
    .eq("tool_id", dbId)
    .eq("user_id", ctx.userId)
    .maybeSingle();

  if (error) {
    console.warn("[state] GET error:", error.message);
    return NextResponse.json({ state: null });
  }
  return NextResponse.json({ state: data?.state_data ?? null });
}

/**
 * POST /api/tools/[id]/state
 * Body: { state: object }
 * 保存当前登录用户在此工具下的状态数据
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbId = toDbToolId(id);
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();

  let body: { state?: Record<string, unknown> };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { state } = body;
  if (!state) {
    return NextResponse.json({ error: "state required" }, { status: 400 });
  }

  // Upsert: insert or update（RLS 通过用户 JWT 生效）
  const { error } = await ctx.supabase
    .from("tool_state")
    .upsert(
      {
        user_id: ctx.userId,
        tool_id: dbId,
        state_data: state,
        updated_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "user_id,tool_id" }
    );

  if (error) {
    console.warn("[state] POST error:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/tools/[id]/state
 * 清除当前登录用户在此工具下的状态数据
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbId = toDbToolId(id);
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();

  const { error } = await ctx.supabase
    .from("tool_state")
    .delete()
    .eq("tool_id", dbId)
    .eq("user_id", ctx.userId);

  if (error) {
    console.warn("[state] DELETE error:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
