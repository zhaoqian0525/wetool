-- ============================================================
-- WeWoo v2.0.0 审核底线（举报 + 快速下架）
-- 在 Supabase SQL Editor 中执行一次即可
-- ============================================================

-- 1) 举报表
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (reason in ('垃圾广告','侵权内容','违法信息','色情低俗','其他')),
  status text not null default 'pending' check (status in ('pending','processing','resolved','rejected')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_tool_idx on public.reports(tool_id);
create index if not exists reports_status_idx on public.reports(status);
create index if not exists reports_user_tool_idx on public.reports(user_id, tool_id);

-- 2) 举报表 RLS：登录用户可提交；任何人可读（管理端后续收紧）
alter table public.reports enable row level security;

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "reports_select_all" on public.reports;
create policy "reports_select_all" on public.reports
  for select to authenticated
  using (true);

-- 3) 工具表增加 is_banned（快速下架标记）
alter table public.tools add column if not exists is_banned boolean not null default false;

-- 4) 快速下架辅助函数（管理员手动执行）：
--    update public.tools set is_banned = true where id = '<工具UUID>';
--    列表/搜索接口将过滤 is_banned = true 的工具（代码已接入后生效）