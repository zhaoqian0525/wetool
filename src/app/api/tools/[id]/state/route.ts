import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * GET /api/tools/[id]/state?userId=xxx
 * 获取用户在此工具下的保存状态
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
  if (supabase) {
    const { data, error } = await supabase
      .from("tool_state")
      .select("state_data")
      .eq("tool_id", id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.warn("[state] GET error:", error.message);
      return NextResponse.json({ state: null });
    }
    return NextResponse.json({ state: data?.state_data ?? null });
  }

  return NextResponse.json({ state: null });
}

/**
 * POST /api/tools/[id]/state
 * Body: { userId: string, state: object }
 * 保存用户在此工具下的状态数据
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: { userId?: string; state?: Record<string, unknown> };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const { userId, state } = body;
  if (!userId || !state) {
    return NextResponse.json({ error: "userId and state required" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (supabase) {
    // Upsert: insert or update
    const { error } = await supabase
      .from("tool_state")
      .upsert(
        {
          user_id: userId,
          tool_id: id,
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

  return NextResponse.json({ ok: true, note: "supabase not configured" });
}

/**
 * DELETE /api/tools/[id]/state?userId=xxx
 * 清除用户在此工具下的状态数据
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase
      .from("tool_state")
      .delete()
      .eq("tool_id", id)
      .eq("user_id", userId);

    if (error) {
      console.warn("[state] DELETE error:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true, note: "supabase not configured" });
}
