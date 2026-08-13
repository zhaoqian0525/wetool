import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, getAdminServiceClient, unauthorizedResponse } from "@/lib/api-auth";

/**
 * POST /api/admin/reports/[id]/resolve
 * Body: { status: "resolved" | "rejected", note?: string }
 * 管理员处理举报（v2.0.1）。
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

  let body: { status?: string; note?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const status = body.status;
  if (status !== "resolved" && status !== "rejected" && status !== "processing") {
    return NextResponse.json({ error: "status 必须为 resolved/rejected/processing" }, { status: 400 });
  }

  // reports 表无 UPDATE 策略，管理员处理必须走 service_role（代码层已校验 isAdmin）
  const admin = getAdminServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "服务器未配置 SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }
  const { error } = await admin
    .from("reports")
    .update({
      status,
      note: body.note ? String(body.note).slice(0, 200) : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.warn("[admin/reports/resolve] error:", error.message);
    return NextResponse.json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}