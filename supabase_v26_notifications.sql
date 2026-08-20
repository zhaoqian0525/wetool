-- v2.6.0 通知中心：notifications 表 + RLS
-- 在 Supabase SQL Editor 执行一次即可。

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null default 'system',
  actor_id uuid,
  actor_name text,
  tool_id text,
  tool_title text,
  content text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_read_idx
  on public.notifications (user_id, read, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications for select
using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
