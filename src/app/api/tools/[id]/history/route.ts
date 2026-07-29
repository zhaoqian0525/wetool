import { NextRequest, NextResponse } from "next/server";

/**
 * GET  /api/tools/[id]/history?userId=xxx
 * DELETE /api/tools/[id]/history?userId=xxx&historyId=xxx | &all=true
 *
 * 当前使用 localStorage 作为存储（客户端状态），
 * Supabase 就绪后替换为数据库操作。
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

  // Supabase 就绪后：supabase.from("tool_usage_history").select("*").eq("tool_id", id).eq("user_id", userId)
  // 暂时返回提示让客户端自行从 localStorage 读取
  return NextResponse.json({ history: [], note: "use client localStorage" });
}

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

  // Supabase 就绪后：
  // if (all === "true") supabase.from("tool_usage_history").delete().eq("tool_id", id).eq("user_id", userId)
  // else supabase.from("tool_usage_history").delete().eq("id", historyId).eq("user_id", userId)

  return NextResponse.json({
    ok: true,
    deleted: all === "true" ? "all" : historyId,
    note: "deleted from localStorage client-side",
  });
}
