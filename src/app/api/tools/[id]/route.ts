import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUserId, unauthorizedResponse } from "@/lib/api-auth";

/**
 * DELETE /api/tools/[id]
 *
 * 删除工具及关联数据（身份来自 Authorization header，服务端校验所有权）。
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = await getAuthUserId(request);
  if (!userId) return unauthorizedResponse();

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cvacrykzcppiflmvwwfe.supabase.co";
  // 用 service_role key 操作数据库，因为我们已在代码层验证了所有权
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2YWNyeWt6Y3BwaWZsbXZ3d2ZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTAxMzQ1NCwiZXhwIjoyMTAwNTg5NDU0fQ.2_Z78V-JYZyLHDHgrFXkGSh5y4YGwuradhYNlij1KtI";
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