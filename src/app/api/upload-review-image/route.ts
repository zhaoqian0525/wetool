import { NextRequest, NextResponse } from "next/server";
import { getAuthedSupabase, getAdminServiceClient, unauthorizedResponse } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/upload-review-image —— 评论配图上传（服务端 service_role，规避客户端 RLS 差异）
 * body: multipart/form-data，字段名 file
 */
export async function POST(request: NextRequest) {
  const ctx = await getAuthedSupabase(request);
  if (!ctx) return unauthorizedResponse();

  const admin = getAdminServiceClient();
  if (!admin) {
    return NextResponse.json({ error: "上传服务不可用" }, { status: 500 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (value && typeof value === "object" && "arrayBuffer" in value) {
      file = value as File;
    }
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  if (!file) {
    return NextResponse.json({ error: "缺少图片文件" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "图片不能超过 5MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${ctx.userId}/${Date.now()}.${ext}`;

  try {
    const { error } = await admin.storage
      .from("review-images")
      .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data } = admin.storage.from("review-images").getPublicUrl(path);
    return NextResponse.json({ url: data?.publicUrl ?? null });
  } catch {
    return NextResponse.json({ error: "图片上传失败" }, { status: 500 });
  }
}
