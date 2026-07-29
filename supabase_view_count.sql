-- ============================================
-- WeWoo: Supabase 完整建库脚本（幂等版，可重复执行）
-- 在 Supabase SQL Editor 中一次性粘贴，点 Run
-- ============================================

-- 1. 工具表
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  author_id TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  thumbnail_gradient TEXT DEFAULT 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  visibility TEXT NOT NULL DEFAULT 'public',
  is_downloadable BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 兼容旧表：补充新列（已存在的表不会自动补列，所以必须显式 ADD COLUMN IF NOT EXISTS）
ALTER TABLE tools ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'public';
ALTER TABLE tools ADD COLUMN IF NOT EXISTS is_downloadable BOOLEAN DEFAULT false;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0 NOT NULL;

-- 如果 is_public 列存在，迁移数据后删除
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'tools' AND column_name = 'is_public'
  ) THEN
    UPDATE tools SET visibility = CASE WHEN is_public THEN 'public' ELSE 'private' END;
    -- CASCADE: 旧 RLS 策略依赖 is_public，一并删除，后面会重建
    ALTER TABLE tools DROP COLUMN IF EXISTS is_public CASCADE;
  END IF;
END $$;

-- 2. 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  user_id TEXT NOT NULL,
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, tool_id)
);

-- 3. 评论表
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 浏览量自增函数
CREATE OR REPLACE FUNCTION increment_view_count(tool_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE tools SET view_count = view_count + 1 WHERE id = tool_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon, authenticated;

-- 5. 开启行级安全
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 6. tools RLS 策略
-- 任何人都能看到公开工具
DROP POLICY IF EXISTS "tools_select_public" ON tools;
CREATE POLICY "tools_select_public" ON tools FOR SELECT USING (visibility = 'public');

-- 已登录用户可以看自己的所有工具
DROP POLICY IF EXISTS "tools_select_own" ON tools;
CREATE POLICY "tools_select_own" ON tools FOR SELECT USING (auth.uid()::text = author_id);

-- 已登录用户可以发布工具
DROP POLICY IF EXISTS "tools_insert_auth" ON tools;
CREATE POLICY "tools_insert_auth" ON tools FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 用户只能修改/删除自己的工具
DROP POLICY IF EXISTS "tools_update_own" ON tools;
CREATE POLICY "tools_update_own" ON tools FOR UPDATE USING (auth.uid()::text = author_id);

DROP POLICY IF EXISTS "tools_delete_own" ON tools;
CREATE POLICY "tools_delete_own" ON tools FOR DELETE USING (auth.uid()::text = author_id);

-- 7. favorites RLS 策略
DROP POLICY IF EXISTS "favorites_select_public" ON favorites;
CREATE POLICY "favorites_select_public" ON favorites FOR SELECT USING (true);

DROP POLICY IF EXISTS "favorites_insert_auth" ON favorites;
CREATE POLICY "favorites_insert_auth" ON favorites FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE USING (auth.uid()::text = user_id);

-- 8. reviews RLS 策略
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert_auth" ON reviews;
CREATE POLICY "reviews_insert_auth" ON reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "reviews_delete_own" ON reviews;
CREATE POLICY "reviews_delete_own" ON reviews FOR DELETE USING (auth.uid()::text = user_id);

-- 9. 用户草稿表（工具输入自动存档）
CREATE TABLE IF NOT EXISTS tool_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tool_id UUID NOT NULL,
  form_data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tool_id)
);
ALTER TABLE tool_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "drafts_select_own" ON tool_drafts;
CREATE POLICY "drafts_select_own" ON tool_drafts FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "drafts_insert_own" ON tool_drafts;
CREATE POLICY "drafts_insert_own" ON tool_drafts FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "drafts_update_own" ON tool_drafts;
CREATE POLICY "drafts_update_own" ON tool_drafts FOR UPDATE USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "drafts_delete_own" ON tool_drafts;
CREATE POLICY "drafts_delete_own" ON tool_drafts FOR DELETE USING (auth.uid()::text = user_id);

-- 10. 工具使用历史表
CREATE TABLE IF NOT EXISTS tool_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tool_id UUID NOT NULL,
  action TEXT NOT NULL,
  input_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE tool_usage_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "history_select_own" ON tool_usage_history;
CREATE POLICY "history_select_own" ON tool_usage_history FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "history_insert_own" ON tool_usage_history;
CREATE POLICY "history_insert_own" ON tool_usage_history FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 11. 常用工具置顶表
CREATE TABLE IF NOT EXISTS user_pinned_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tool_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tool_id)
);
ALTER TABLE user_pinned_tools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pinned_select_own" ON user_pinned_tools;
CREATE POLICY "pinned_select_own" ON user_pinned_tools FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "pinned_insert_own" ON user_pinned_tools;
CREATE POLICY "pinned_insert_own" ON user_pinned_tools FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "pinned_delete_own" ON user_pinned_tools;
CREATE POLICY "pinned_delete_own" ON user_pinned_tools FOR DELETE USING (auth.uid()::text = user_id);

-- 12. 工具状态保存表（工具内表单数据自动保存与恢复）
CREATE TABLE IF NOT EXISTS tool_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tool_id UUID NOT NULL,
  state_data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tool_id)
);
ALTER TABLE tool_state ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE tool_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "state_select_own" ON tool_state;
CREATE POLICY "state_select_own" ON tool_state FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "state_insert_own" ON tool_state;
CREATE POLICY "state_insert_own" ON tool_state FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "state_update_own" ON tool_state;
CREATE POLICY "state_update_own" ON tool_state FOR UPDATE USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "state_delete_own" ON tool_state;
CREATE POLICY "state_delete_own" ON tool_state FOR DELETE USING (auth.uid()::text = user_id);

-- 13. 最近使用工具表（首页"最近使用"）
CREATE TABLE IF NOT EXISTS tool_recent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  tool_id UUID NOT NULL,
  opened_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tool_id)
);
ALTER TABLE tool_recent ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "recent_select_own" ON tool_recent;
CREATE POLICY "recent_select_own" ON tool_recent FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "recent_insert_own" ON tool_recent;
CREATE POLICY "recent_insert_own" ON tool_recent FOR INSERT WITH CHECK (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "recent_update_own" ON tool_recent;
CREATE POLICY "recent_update_own" ON tool_recent FOR UPDATE USING (auth.uid()::text = user_id);
