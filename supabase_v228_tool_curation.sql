-- v2.28.0 工具库清理
-- 目标：公开广场只保留一套正式版本；重复/测试版本改为 unlisted，
--       链接仍可访问，但不进入广场、搜索和 sitemap。

-- 正式时薪工具：统一标题和简介，避免“修复了第一版错误”这类内部描述。
update public.tools
set
  title = '税后真实时薪计算器',
  description = '输入月薪、工时和加班，算清五险一金、个税后的真实时薪，并查看与法定基准、加班费的差距。'
where id = 'c800bd9b-09bb-4dd0-a1f0-ac67f6e3a7a8';

-- 保留：c800... 时薪 2.0、4c285... 2048 特别版、93fdf... 减肥 2.0、
--       18bca... 人生模拟 2.0、91569... 纪念日记录
update public.tools
set visibility = 'unlisted'
where id in (
  '486223b0-3eec-4dc8-bfba-e5e03f839911', -- 时薪计算器（旧）
  '9c6b669b-3545-4f6d-b893-746f564df38b', -- 2048（新）
  '5b683c30-a750-49e2-940f-f7e4b8213060', -- 2048
  '6d74b64b-89ee-494c-a6f2-d16d452b6902', -- 2048更新
  '060c923a-cbba-458a-b8fa-7a01e97077cc', -- 减肥饮食记录（旧）
  '6d341a2a-daf4-4341-aeaf-1b834f221ba2', -- 人生模拟器（旧）
  '085c9928-f209-453e-b23f-c419084469a6'  -- 情侣纪念日记录测试
);

-- 可选：把正式 2048 的名称统一为 2048。
update public.tools
set title = '2048'
where id = '4c285279-d7cf-4852-a9e0-ed022b06dccf';

-- 回滚（如需恢复公开）：
-- update public.tools set visibility = 'public' where id in (...);
