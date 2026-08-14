-- ============================================
-- WeWoo v2.1.0 M3：用量与审计表（AI 网关 + 联网代理）
-- 在 Supabase SQL Editor 执行一次即可（幂等）
-- ============================================

-- ---------- AI 用量表 ----------
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  tool_id text,
  user_id uuid,
  ip text,
  model text,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  cost_cny numeric(10,6) not null default 0,
  created_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

-- 用户只能插入/查看自己的记录（服务端写入用 service_role，不受影响）
drop policy if exists "ai_usage_insert_self" on public.ai_usage;
create policy "ai_usage_insert_self" on public.ai_usage
  for insert with check (auth.uid() = user_id);

drop policy if exists "ai_usage_select_self" on public.ai_usage;
create policy "ai_usage_select_self" on public.ai_usage
  for select using (auth.uid() = user_id);

create index if not exists ai_usage_user_day on public.ai_usage (user_id, created_at desc);
create index if not exists ai_usage_tool_day on public.ai_usage (tool_id, created_at desc);
create index if not exists ai_usage_created on public.ai_usage (created_at desc);

-- ---------- 联网代理审计表 ----------
create table if not exists public.proxy_log (
  id bigint generated always as identity primary key,
  tool_id text,
  user_id uuid,
  ip text,
  url text,
  status integer,
  size integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.proxy_log enable row level security;

drop policy if exists "proxy_log_insert_self" on public.proxy_log;
create policy "proxy_log_insert_self" on public.proxy_log
  for insert with check (auth.uid() = user_id);

drop policy if exists "proxy_log_select_self" on public.proxy_log;
create policy "proxy_log_select_self" on public.proxy_log
  for select using (auth.uid() = user_id);

create index if not exists proxy_log_created on public.proxy_log (created_at desc);
create index if not exists proxy_log_user_day on public.proxy_log (user_id, created_at desc);
