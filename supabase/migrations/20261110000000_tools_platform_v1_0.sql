-- AgentArchitect tool platform V1.0 — usage metering for /api/v1/tools/* and MCP tool calls.
--
-- One table, written only by the server:
--   tool_usage   one row per tool invocation: which tool, how it ended, how big, how long,
--                and who called (client_class) so crawlers, directory scanners and internal
--                tests can be excluded when counting real external agents.
--
-- Privacy: no inspected content is stored — no file bytes, text, URLs or hashes. The caller
-- is recorded only as a salted IP hash (same salt as agent_visits).
--
-- Security model (same as V0.2): RLS enabled, no policies, no grants to anon/authenticated.
-- Only the server-side secret key reads or writes this table.
--
-- Idempotent: safe to run more than once. Contains no DROP of existing objects.
-- Retention: public.aa_purge_tool_usage() deletes rows older than 90 days; call it daily
-- together with aa_purge_old_rows().

create table if not exists public.tool_usage (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  request_id text not null,
  tool text not null,
  channel text not null check (channel in ('rest', 'mcp')),
  input_mode text not null default 'none',
  status text not null check (status in ('ok', 'error')),
  error_code text,
  client_class text not null check (client_class in ('internal_test', 'search_crawler', 'directory_scanner', 'browser', 'external_agent')),
  registered_agent boolean not null default false,
  ip_hash text not null check (ip_hash ~ '^[0-9a-f]{64}$'),
  user_agent text,
  bytes_in integer not null default 0 check (bytes_in >= 0),
  duration_ms integer not null default 0 check (duration_ms >= 0),
  cost_credits numeric not null default 0 check (cost_credits >= 0)
);

create index if not exists tool_usage_ts_idx on public.tool_usage (ts desc);
create index if not exists tool_usage_class_ts_idx on public.tool_usage (client_class, ts desc);

alter table public.tool_usage enable row level security;

revoke all on table public.tool_usage from public, anon, authenticated;
grant select, insert, delete on table public.tool_usage to service_role;

create or replace function public.aa_purge_tool_usage(p_days integer default 90)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.tool_usage where ts < now() - make_interval(days => greatest(coalesce(p_days, 90), 1));
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.aa_purge_tool_usage(integer) from public, anon, authenticated;
grant execute on function public.aa_purge_tool_usage(integer) to service_role;

-- Weekly view of real usage: external agents only, successful calls only.
create or replace view public.tool_usage_weekly
with (security_invoker = true) as
select
  date_trunc('week', ts) as week,
  tool,
  client_class,
  count(*) filter (where status = 'ok') as ok_calls,
  count(*) filter (where status = 'error') as error_calls,
  count(distinct ip_hash) as distinct_callers
from public.tool_usage
group by 1, 2, 3;

revoke all on table public.tool_usage_weekly from public, anon, authenticated;
grant select on table public.tool_usage_weekly to service_role;
