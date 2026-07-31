-- ============================================
-- 修复封面存储桶
-- ============================================

-- 创建 tool-covers bucket（如果不存在）
-- 需要在 Supabase Dashboard → Storage 手动创建：
--   名称: tool-covers
--   设为 Public bucket
-- 或者运行下面的 SQL 通过 storage API

-- 允许已认证用户上传封面（storage RLS）
-- 首先确保 bucket 是公开的
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('tool-covers', 'tool-covers', true, 5242880)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 允许所有人读取封面
DROP POLICY IF EXISTS "cover_public_read" ON storage.objects;
CREATE POLICY "cover_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'tool-covers');

-- 允许已认证用户上传封面
DROP POLICY IF EXISTS "cover_auth_upload" ON storage.objects;
CREATE POLICY "cover_auth_upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'tool-covers' AND auth.role() = 'authenticated');

-- 允许已认证用户更新/删除自己的封面
DROP POLICY IF EXISTS "cover_auth_update" ON storage.objects;
CREATE POLICY "cover_auth_update" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'tool-covers' AND auth.role() = 'authenticated');
