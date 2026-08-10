/**
 * 个人头像（v1.13.1）
 *
 * 流程：本地压缩到 512×512 内 → 上传 Supabase Storage（tool-covers/avatars/ 路径，
 * 复用工具封面 bucket，无需新 bucket 权限）→ 写入 auth.users user_metadata.avatar_url。
 * AuthProvider 监听 USER_UPDATED 事件自动刷新 user，全站头像即时更新。
 */

import { getSupabase } from "./supabase";

const AVATAR_BUCKET = "tool-covers";
const AVATAR_MAX_SIZE = 512;

/** 压缩图片到正方形头像（canvas），输出 WebP Blob；失败返回原文件 */
export async function compressAvatar(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const size = Math.min(AVATAR_MAX_SIZE, Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // 居中裁剪为正方形
    const srcSize = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - srcSize) / 2;
    const sy = (bitmap.height - srcSize) / 2;
    ctx.drawImage(bitmap, sx, sy, srcSize, srcSize, 0, 0, size, size);
    bitmap.close();

    return await new Promise((resolve) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : resolve(file)),
        "image/webp",
        0.85
      );
    });
  } catch {
    return file;
  }
}

/** 上传头像到 Storage 并更新用户资料，返回公开 URL；失败返回 null */
export async function uploadAvatar(file: File, userId: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const blob = await compressAvatar(file);
    const filePath = `avatars/${userId}.webp`;

    // 确保 bucket 存在（与工具封面共用）
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some((b) => b.name === AVATAR_BUCKET)) {
      await supabase.storage.createBucket(AVATAR_BUCKET, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
      });
    }

    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, blob, { contentType: "image/webp", upsert: true });
    if (error) {
      console.warn("Avatar upload error:", error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);
    const avatarUrl = urlData?.publicUrl ?? null;
    if (!avatarUrl) return null;

    // 写入 user_metadata，AuthProvider 监听 USER_UPDATED 自动刷新
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    });
    if (updateError) {
      console.warn("Avatar metadata update error:", updateError.message);
      return null;
    }
    return avatarUrl;
  } catch (err) {
    console.warn("Avatar upload failed:", err);
    return null;
  }
}
