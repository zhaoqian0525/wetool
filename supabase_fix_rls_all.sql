-- =============================================
-- WeWoo v1.15.0：全表 RLS 加固 + Storage 授权收敛 + AI 跨实例限流
-- 幂等，可重复执行。在 Supabase Dashboard → SQL Editor 粘贴运行。
-- 执行后请用匿名 key 复测（见 ROADMAP v1.15.0 验收）。
-- =============================================

-- 0. 确保所有表启用 RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pinned_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_recent ENABLE ROW LEVEL SECURITY;

-- 1. tools：公开可读 + 作者全权 + unlisted 可通过 ID 直读
DROP POLICY IF EXISTS "tools_select_public" ON tools;
CREATE POLICY "tools_select_public" ON tools FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "tools_select_own" ON tools;
CREATE POLICY "tools_select_own" ON tools FOR SELECT USING (auth.uid()::text = author_id);

DROP POLICY IF EXISTS "tools_direct_read" ON tools;
CREATE POLICY "tools_direct_read" ON tools FOR SELECT USING (visibility != 'private');

DROP POLICY IF EXISTS "tools_insert_auth" ON tools;
CREATE POLICY "tools_insert_auth" ON tools FOR INSERT WITH CHECK (auth.uid()::text = author_id);

DROP POLICY IF EXISTS "tools_update_own" ON tools;
CREATE POLICY "tools_update_own" ON tools FOR UPDATE USING (auth.uid()::text = author_id);

DROP POLICY IF EXISTS "tools_delete_own" ON tools;
CREATE POLICY "tools_delete_own" ON tools FOR DELETE USING (auth.uid()::text = author_id);

-- 2. favorites（历史兼容）：公开读 + 本人增删
DROP POLICY IF EXISTS "fav_public_read" ON favorites;
CREATE POLICY "fav_public_read" ON favorites FOR SELECT USING (true);

DROP POLICY IF EXISTS "fav_user_insert" ON favorites;
CREATE POLICY "fav_user_insert" ON favorites FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "fav_user_delete" ON favorites;
CREATE POLICY "fav_user_delete" ON favorites FOR DELETE USING (auth.uid()::text = user_id);

-- 3. reviews：公开读 + 本人增删
DROP POLICY IF EXISTS "rev_public_read" ON reviews;
CREATE POLICY "rev_public_read" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "rev_user_insert" ON reviews;
CREATE POLICY "rev_user_insert" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "rev_user_delete" ON reviews;
CREATE POLICY "rev_user_delete" ON reviews FOR DELETE USING (auth.uid()::text = user_id);

-- 4. likes（点赞/收藏）：公开读 + 本人增删
-- ⚠️ 有意的折中：点赞计数、他人主页"收藏的工具"、评论点赞数都依赖公开读，
--    属社区公开数据；写入严格限定本人。
DROP POLICY IF EXISTS "likes_public_read" ON likes;
CREATE POLICY "likes_public_read" ON likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "likes_user_insert" ON likes;
CREATE POLICY "likes_user_insert" ON likes FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "likes_user_delete" ON likes;
CREATE POLICY "likes_user_delete" ON likes FOR DELETE USING (auth.uid()::text = user_id);

-- 5. tool_drafts：本人读写删
DROP POLICY IF EXISTS "drafts_select_own" ON tool_drafts;
CREATE POLICY "drafts_select_own" ON tool_drafts FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "drafts_insert_own" ON tool_drafts;
CREATE POLICY "drafts_insert_own" ON tool_drafts FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "drafts_update_own" ON tool_drafts;
CREATE POLICY "drafts_update_own" ON tool_drafts FOR UPDATE USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "drafts_delete_own" ON tool_drafts;
CREATE POLICY "drafts_delete_own" ON tool_drafts FOR DELETE USING (auth.uid()::text = user_id);

-- 6. tool_usage_history：本人读写删（DELETE 补充：服务端已用 service role，策略兜底一致）
DROP POLICY IF EXISTS "history_select_own" ON tool_usage_history;
CREATE POLICY "history_select_own" ON tool_usage_history FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "history_insert_own" ON tool_usage_history;
CREATE POLICY "history_insert_own" ON tool_usage_history FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "history_update_own" ON tool_usage_history;
CREATE POLICY "history_update_own" ON tool_usage_history FOR UPDATE USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "history_delete_own" ON tool_usage_history;
CREATE POLICY "history_delete_own" ON tool_usage_history FOR DELETE USING (auth.uid()::text = user_id);

-- 7. user_pinned_tools：本人读写删（当前代码未使用，保留策略兜底）
DROP POLICY IF EXISTS "pinned_select_own" ON user_pinned_tools;
CREATE POLICY "pinned_select_own" ON user_pinned_tools FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "pinned_insert_own" ON user_pinned_tools;
CREATE POLICY "pinned_insert_own" ON user_pinned_tools FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "pinned_update_own" ON user_pinned_tools;
CREATE POLICY "pinned_update_own" ON user_pinned_tools FOR UPDATE USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "pinned_delete_own" ON user_pinned_tools;
CREATE POLICY "pinned_delete_own" ON user_pinned_tools FOR DELETE USING (auth.uid()::text = user_id);

-- 8. tool_state：本人读写删（upsert 需要 INSERT + UPDATE）
DROP POLICY IF EXISTS "state_select_own" ON tool_state;
CREATE POLICY "state_select_own" ON tool_state FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "state_insert_own" ON tool_state;
CREATE POLICY "state_insert_own" ON tool_state FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "state_update_own" ON tool_state;
CREATE POLICY "state_update_own" ON tool_state FOR UPDATE USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "state_delete_own" ON tool_state;
CREATE POLICY "state_delete_own" ON tool_state FOR DELETE USING (auth.uid()::text = user_id);

-- 9. tool_recent：本人读写删
DROP POLICY IF EXISTS "recent_select_own" ON tool_recent;
CREATE POLICY "recent_select_own" ON tool_recent FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "recent_insert_own" ON tool_recent;
CREATE POLICY "recent_insert_own" ON tool_recent FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "recent_update_own" ON tool_recent;
CREATE POLICY "recent_update_own" ON tool_recent FOR UPDATE USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "recent_delete_own" ON tool_recent;
CREATE POLICY "recent_delete_own" ON tool_recent FOR DELETE USING (auth.uid()::text = user_id);

-- =============================================
-- Storage：tool-covers 上传/更新/删除限定 owner 路径
-- 路径约定：封面 public/<toolId>.png；头像 avatars/<userId>.webp
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('tool-covers', 'tool-covers', true, 5242880)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "cover_public_read" ON storage.objects;
CREATE POLICY "cover_public_read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'tool-covers');

DROP POLICY IF EXISTS "cover_auth_upload" ON storage.objects;
CREATE POLICY "cover_auth_upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'tool-covers' AND auth.role() = 'authenticated' AND (
      (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text
      OR
      (storage.foldername(name))[1] = 'public' AND EXISTS (
        SELECT 1 FROM public.tools t
        WHERE t.id::text = (storage.foldername(name))[2]
          AND t.author_id = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "cover_auth_update" ON storage.objects;
CREATE POLICY "cover_auth_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'tool-covers' AND auth.role() = 'authenticated' AND (
      (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text
      OR
      (storage.foldername(name))[1] = 'public' AND EXISTS (
        SELECT 1 FROM public.tools t
        WHERE t.id::text = (storage.foldername(name))[2]
          AND t.author_id = auth.uid()::text
      )
    )
  );

DROP POLICY IF EXISTS "cover_auth_delete" ON storage.objects;
CREATE POLICY "cover_auth_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'tool-covers' AND auth.role() = 'authenticated' AND (
      (storage.foldername(name))[1] = 'avatars' AND (storage.foldername(name))[2] = auth.uid()::text
      OR
      (storage.foldername(name))[1] = 'public' AND EXISTS (
        SELECT 1 FROM public.tools t
        WHERE t.id::text = (storage.foldername(name))[2]
          AND t.author_id = auth.uid()::text
      )
    )
  );

-- =============================================
-- AI 跨实例限流：ai_rate_limit 表 + SECURITY DEFINER RPC
-- （服务端 aiCostGuard.checkRateLimitRemote 调用；未部署时自动回退内存限流）
-- =============================================
CREATE TABLE IF NOT EXISTS ai_rate_limit (
  ip TEXT PRIMARY KEY,
  minute_bucket TIMESTAMPTZ NOT NULL,
  day_bucket DATE NOT NULL,
  minute_count INTEGER NOT NULL DEFAULT 0,
  day_count INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE ai_rate_limit ENABLE ROW LEVEL SECURITY;
-- 不创建任何策略：该表只允许通过下方 SECURITY DEFINER RPC 访问

CREATE OR REPLACE FUNCTION ai_rate_bump(p_ip TEXT, p_min INTEGER, p_day INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  now_ts TIMESTAMPTZ := now();
  minute_ts TIMESTAMPTZ := date_trunc('minute', now_ts);
  day_d DATE := now_ts::date;
  rec ai_rate_limit%ROWTYPE;
BEGIN
  -- 顺带清理 10 天前的旧记录
  DELETE FROM ai_rate_limit WHERE day_bucket < (now() - interval '10 days')::date;

  INSERT INTO ai_rate_limit AS t (ip, minute_bucket, day_bucket, minute_count, day_count)
  VALUES (p_ip, minute_ts, day_d, 1, 1)
  ON CONFLICT (ip) DO UPDATE SET
    minute_bucket = CASE WHEN t.minute_bucket = EXCLUDED.minute_bucket THEN t.minute_bucket ELSE EXCLUDED.minute_bucket END,
    day_bucket = CASE WHEN t.day_bucket = EXCLUDED.day_bucket THEN t.day_bucket ELSE EXCLUDED.day_bucket END,
    minute_count = CASE WHEN t.minute_bucket = EXCLUDED.minute_bucket THEN t.minute_count + 1 ELSE 1 END,
    day_count = CASE WHEN t.day_bucket = EXCLUDED.day_bucket THEN t.day_count + 1 ELSE 1 END
  RETURNING * INTO rec;

  IF rec.minute_count > p_min OR rec.day_count > p_day THEN
    RETURN jsonb_build_object('ok', false, 'retry_after', 60);
  END IF;
  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION ai_rate_bump(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ai_rate_bump(text, integer, integer) TO anon, authenticated;