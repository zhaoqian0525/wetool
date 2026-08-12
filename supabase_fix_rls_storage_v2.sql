-- =============================================
-- WeWoo v1.15.2：修复 tool-covers Storage 上传策略
-- 问题：v1.15.0 的 cover_auth_upload/update/delete 用 (storage.foldername(name))[2]
--       取文件 ID，但 foldername() 只返回目录部分、不含文件名：
--       public/<toolId>.png  -> foldername = {public}，[2] 恒为 NULL
--       avatars/<userId>.webp -> foldername = {avatars}，[2] 恒为 NULL
--       导致策略内 EXISTS/等值比较恒为假，所有新封面、新头像上传都被 403 拒绝
--       （表现：发布/编辑工具后没有封面，更换头像失败）。
-- 修复：用 storage.filename() 取文件名再解析。
-- 幂等，可重复执行。在 Supabase Dashboard → SQL Editor 粘贴运行。
-- =============================================

DROP POLICY IF EXISTS "cover_auth_upload" ON storage.objects;
CREATE POLICY "cover_auth_upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'tool-covers'
    AND auth.role() = 'authenticated'
    AND (
      -- 头像：avatars/<userId>.webp
      (
        (storage.foldername(name))[1] = 'avatars'
        AND storage.filename(name) = auth.uid()::text || '.webp'
      )
      OR
      -- 工具封面：public/<toolId>.png（作者可传）
      (
        (storage.foldername(name))[1] = 'public'
        AND EXISTS (
          SELECT 1 FROM public.tools t
          WHERE t.id::text = split_part(storage.filename(name), '.', 1)
            AND t.author_id = auth.uid()::text
        )
      )
    )
  );

DROP POLICY IF EXISTS "cover_auth_update" ON storage.objects;
CREATE POLICY "cover_auth_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'tool-covers'
    AND auth.role() = 'authenticated'
    AND (
      (
        (storage.foldername(name))[1] = 'avatars'
        AND storage.filename(name) = auth.uid()::text || '.webp'
      )
      OR
      (
        (storage.foldername(name))[1] = 'public'
        AND EXISTS (
          SELECT 1 FROM public.tools t
          WHERE t.id::text = split_part(storage.filename(name), '.', 1)
            AND t.author_id = auth.uid()::text
        )
      )
    )
  );

DROP POLICY IF EXISTS "cover_auth_delete" ON storage.objects;
CREATE POLICY "cover_auth_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'tool-covers'
    AND auth.role() = 'authenticated'
    AND (
      (
        (storage.foldername(name))[1] = 'avatars'
        AND storage.filename(name) = auth.uid()::text || '.webp'
      )
      OR
      (
        (storage.foldername(name))[1] = 'public'
        AND EXISTS (
          SELECT 1 FROM public.tools t
          WHERE t.id::text = split_part(storage.filename(name), '.', 1)
            AND t.author_id = auth.uid()::text
        )
      )
    )
  );
