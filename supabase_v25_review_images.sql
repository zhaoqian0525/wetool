-- v2.5.0 评论配图：reviews 表加 image_url 列 + review-images 公开存储桶
-- 在 Supabase SQL Editor 执行一次即可。

-- 1) 评论表增加配图字段（兼容旧数据，可空）
alter table public.reviews
  add column if not exists image_url text;

-- 2) 创建评论图片公开桶（已存在则跳过）
insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do nothing;

-- 3) 登录用户可上传评论图片（仅 review-images 桶）
drop policy if exists "review_images_upload" on storage.objects;
create policy "review_images_upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'review-images');

-- 4) 公开可读（评论图片需要匿名可见）
drop policy if exists "review_images_read" on storage.objects;
create policy "review_images_read"
on storage.objects for select
using (bucket_id = 'review-images');
