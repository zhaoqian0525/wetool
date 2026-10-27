-- v2.28.0 匿名增长事件表
-- 目的：统一 first_visit / return_visit / tool_open / tool_completed /
--       share_click / remix_click / create_started / publish_completed。
-- 只存匿名访客/会话 ID 与渠道信息，不存工资、健康数据或任何工具输入。

create table if not exists public.growth_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  visitor_id text not null,
  session_id text,
  tool_id text,
  source text,
  medium text,
  campaign text,
  landing_page text,
  path text,
  device_type text,
  country text,
  created_at timestamptz not null default now()
);

create index if not exists growth_events_created_at_idx
  on public.growth_events (created_at desc);
create index if not exists growth_events_event_idx
  on public.growth_events (event);
create index if not exists growth_events_visitor_idx
  on public.growth_events (visitor_id);
create index if not exists growth_events_source_idx
  on public.growth_events (source, medium, campaign);

alter table public.growth_events enable row level security;

-- 不开放 anon/authenticated 读写；事件写入和后台聚合都走 service_role。
-- service_role 会绕过 RLS，因此这里不需要额外 policy。

comment on table public.growth_events is
  '匿名增长事件；禁止写入工资、健康数据、用户输入文本或可识别个人信息';
