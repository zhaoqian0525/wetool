-- v1.14.0 评论系统完善：回复 + 头像
-- 在 Supabase Dashboard → SQL Editor 中执行一次即可（幂等）
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS parent_id uuid;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply_to_name text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_avatar text;
-- 可选索引：加速按父评论查询回复
CREATE INDEX IF NOT EXISTS reviews_parent_id_idx ON reviews (parent_id);
