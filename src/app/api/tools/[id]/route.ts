import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * DELETE /api/tools/[id]?userId=xxx
 *
 * 删除工具及关联数据。
 * 验证 author_id === userId 后执行级联删除。
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

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvacrykzcppiflmvwwfe.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_HedSPsepnDWtvd3IuQhlWw_JPeVevVu";
  const supabase = createClient(url, key);

  // 1. 验证所有权
  const { data: tool } = await supabase
    .from("tools")
    .select("author_id")
    .eq("id", id)
    .single();

  if (!tool || tool.author_id !== userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  // 2. 删除工具（外键级联自动清理 favorites, reviews, etc.）
  const { error } = await supabase
    .from("tools")
    .delete()
    .eq("id", id)
    .eq("author_id", userId);

  if (error) {
    return NextResponse.json({ error: "删除失败", detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deleted: id });
}
