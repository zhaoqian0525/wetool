import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, unauthorizedResponse } from "@/lib/api-auth";
import { toDbToolId } from "@/lib/builtinIds";

const REASONS = ["垃圾广告", "侵权内容", "违法信息", "色情低俗", "其他"];

/**
 * POST /api/tools/[id]/report
 * Body: { reason: string }
 * 举报工具（v2.0.0 审核底线）。需要登录；同一用户对同一工具 5 分钟防重复。
 * 依赖 supabase_v2_audit.sql 创建的 reports 表；表未建时返回可读错误。
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const dbId = toDbToolId(id);
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();

  let body: { reason?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const reason = String(body.reason ?? "").trim().slice(0, 50);
  if (!reason || !REASONS.includes(reason)) {
    return NextResponse.json({ error: "请选择举报原因" }, { status: 400 });
  }

  // 防重复：5 分钟内同一用户对同一工具只能举报一次
  const { data: existing, error: dupError } = await ctx.supabase
    .from("reports")
    .select("id, created_at")
    .eq("tool_id", dbId)
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (!dupError && existing && existing.length > 0) {
    const last = new Date(existing[0].created_at).getTime();
    if (Date.now() - last < 5 * 60 * 1000) {
      return NextResponse.json({ error: "已举报过该工具，我们会尽快处理" }, { status: 429 });
    }
  }

  const { error } = await ctx.supabase.from("reports").insert({
    tool_id: dbId,
    user_id: ctx.userId,
    reason,
    status: "pending",
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.warn("[report] insert error:", error.message);
    if (error.message.includes("does not exist") || error.message.includes("relation")) {
      return NextResponse.json(
        { error: "举报功能正在维护中，请稍后再试" },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "举报提交失败，请稍后重试" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}