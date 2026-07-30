-- =============================================
-- 修复 tools 表 RLS 策略
-- 允许登录用户发布/编辑/删除自己的工具
-- =============================================

-- 确保 RLS 已启用
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- 1. 允许所有人读取公开工具
DROP POLICY IF EXISTS "tools_public_read" ON tools;
CREATE POLICY "tools_public_read" ON tools
  FOR SELECT
  USING (visibility = 'public');

-- 2. 允许作者读取自己的所有工具（含私密）
DROP POLICY IF EXISTS "tools_author_select" ON tools;
CREATE POLICY "tools_author_select" ON tools
  FOR SELECT
  USING (auth.uid()::text = author_id);

-- 3. 允许登录用户插入工具
DROP POLICY IF EXISTS "tools_user_insert" ON tools;
CREATE POLICY "tools_user_insert" ON tools
  FOR INSERT
  WITH CHECK (auth.uid()::text = author_id);

-- 4. 允许作者更新自己的工具
DROP POLICY IF EXISTS "tools_author_update" ON tools;
CREATE POLICY "tools_author_update" ON tools
  FOR UPDATE
  USING (auth.uid()::text = author_id);

-- 5. 允许作者删除自己的工具
DROP POLICY IF EXISTS "tools_author_delete" ON tools;
CREATE POLICY "tools_author_delete" ON tools
  FOR DELETE
  USING (auth.uid()::text = author_id);

-- 6. 允许所有人读取（通过 ID 直接访问 unlisted 工具）
DROP POLICY IF EXISTS "tools_direct_read" ON tools;
CREATE POLICY "tools_direct_read" ON tools
  FOR SELECT
  USING (visibility != 'private');

-- =============================================
-- 同样修复 favorites 表 RLS（历史数据兼容）
-- =============================================
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fav_public_read" ON favorites;
CREATE POLICY "fav_public_read" ON favorites FOR SELECT USING (true);

DROP POLICY IF EXISTS "fav_user_insert" ON favorites;
CREATE POLICY "fav_user_insert" ON favorites FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "fav_user_delete" ON favorites;
CREATE POLICY "fav_user_delete" ON favorites FOR DELETE USING (auth.uid()::text = user_id);

-- =============================================
-- 同样修复 reviews 表 RLS
-- =============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rev_public_read" ON reviews;
CREATE POLICY "rev_public_read" ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "rev_user_insert" ON reviews;
CREATE POLICY "rev_user_insert" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "rev_user_delete" ON reviews;
CREATE POLICY "rev_user_delete" ON reviews FOR DELETE USING (auth.uid()::text = user_id);
