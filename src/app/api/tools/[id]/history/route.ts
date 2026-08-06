import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthedSupabase, unauthorizedResponse } from "@/lib/api-auth";

/**
 * GET  /api/tools/[id]/history
 * 返回当前登录用户在该工具下的使用记录（身份来自 Authorization header）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();

  const { data, error } = await ctx.supabase
    .from("tool_usage_history")
    .select("*")
    .eq("tool_id", id)
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ history: [], error: error.message });
  }

  return NextResponse.json({ history: data || [] });
}

/**
 * POST /api/tools/[id]/history
 * Body: { action: string, detail: object }
 * 记录当前登录用户的使用历史
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();

  let body: { action?: string; detail?: Record<string, unknown> } = {};
  try { body = await request.json(); } catch { /* */ }

  const { error } = await ctx.supabase.from("tool_usage_history").insert({
    tool_id: id,
    user_id: ctx.userId,
    action: body.action || "opened",
    input_data: body.detail || {},
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/tools/[id]/history?historyId=xxx | &all=true
 * 删除当前登录用户的使用记录。
 * 注意：tool_usage_history 表没有 DELETE 的 RLS 策略，用户 JWT 删除会被静默过滤；
 * 因此这里先用 token 校验身份，再以 service role 按 userId 过滤删除（服务端保证只能删自己的）。
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvacrykzcppiflmvwwfe.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2YWNyeWt6Y3BwaWZsbXZ3d2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAxMzQ1NCwiZXhwIjoyMTAwNTg5NDU0fQ.2_Z78V-JYZyLHDHgrFXkGSh5y4YGwuradhYNlij1KtI";
  const supabase = createClient(url, key);

  const q = request.nextUrl;
  const historyId = q.searchParams.get("historyId");
  const all = q.searchParams.get("all");

  if (all === "true") {
    const { error } = await supabase
      .from("tool_usage_history")
      .delete()
      .eq("tool_id", id)
      .eq("user_id", ctx.userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, deleted: "all" });
  }

  if (!historyId) {
    return NextResponse.json({ error: "historyId or all required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("tool_usage_history")
    .delete()
    .eq("id", historyId)
    .eq("user_id", ctx.userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, deleted: historyId });
}
