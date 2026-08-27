-- v2.11.0：设备适配目标（mobile = 移动端优先，desktop = 电脑端优先，默认 mobile）
-- 在 Supabase SQL Editor 执行一次即可；幂等（IF NOT EXISTS）
ALTER TABLE tools ADD COLUMN IF NOT EXISTS layout_target text NOT NULL DEFAULT 'mobile';
