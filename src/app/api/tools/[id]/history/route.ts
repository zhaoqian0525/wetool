import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvacrykzcppiflmvwwfe.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu";
  return createClient(url, key);
}

/**
 * GET  /api/tools/[id]/history?userId=xxx
 * 返回用户在该工具下的使用记录
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ history: [] });
  }

  const { data, error } = await supabase
    .from("tool_usage_history")
    .select("*")
    .eq("tool_id", id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ history: [], error: error.message });
  }

  return NextResponse.json({ history: data || [] });
}

/**
 * POST /api/tools/[id]/history?userId=xxx
 * Body: { action: string, detail: object }
 * 记录使用历史
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  let body: { action?: string; detail?: Record<string, unknown> } = {};
  try { body = await request.json(); } catch { /* */ }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: "db unavailable" });
  }

  const { error } = await supabase.from("tool_usage_history").insert({
    tool_id: id,
    user_id: userId,
    action: body.action || "opened",
    detail: body.detail || {},
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/tools/[id]/history?userId=xxx&historyId=xxx | &all=true
 * 删除使用记录
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = request.nextUrl;
  const userId = url.searchParams.get("userId");
  const historyId = url.searchParams.get("historyId");
  const all = url.searchParams.get("all");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "database unavailable" }, { status: 500 });
  }

  if (all === "true") {
    const { error } = await supabase
      .from("tool_usage_history")
      .delete()
      .eq("tool_id", id)
      .eq("user_id", userId);
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
    .eq("user_id", userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, deleted: historyId });
}
