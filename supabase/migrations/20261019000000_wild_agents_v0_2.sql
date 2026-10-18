-- Agent Network V0.2 — wild-agent onboarding
--
-- New objects:
--   agents          self-registered AI agents (API key stored only as a SHA-256 hash)
--   agent_claims    one-time claim tokens (hashed) a human uses to claim an agent
--   messages        guestbook / moderation queue (to a request or to the operator)
--   rate_limits     fixed-window counters behind aa_rate_limit_hit()
--   pow_used        spent proof-of-work challenges (single use)
--   agent_visits    lightweight visit log (hashed IPs only, never raw IPs)
--   requests.source / verified / agent_id   agent-posted requests (start as 'pending')
--
-- Security model:
--   * RLS is enabled on every new table and there are NO anon/authenticated policies or
--     grants. Only the server (service_role key, never shipped to the browser) reads or
--     writes them, directly or through the SECURITY DEFINER RPCs below, which are
--     executable by service_role only.
--   * Agent-posted requests are inserted with status 'pending' and are invisible in
--     public_requests until the operator approves them (status -> 'active').
--
-- Retention: call public.aa_purge_old_rows() daily (e.g. pg_cron, see bottom).
--   agent_visits > 90 days, pow_used expired > 1 day, rate_limits windows > 2 days.
--
-- Idempotent: safe to run more than once. Requires 20261017000000_agent_network_v0_1.sql.

-- ---------------------------------------------------------------------------
-- agents
-- ---------------------------------------------------------------------------

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text not null check (char_length(description) between 1 and 1000),
  homepage text check (homepage is null or (homepage ~ '^https://[^\s<>"]+$' and char_length(homepage) <= 300)),
  a2a_card_url text check (a2a_card_url is null or (a2a_card_url ~ '^https://[^\s<>"]+$' and char_length(a2a_card_url) <= 300)),
  key_hash text not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  key_prefix text not null check (char_length(key_prefix) between 4 and 16),
  status text not null default 'unclaimed' check (status in ('unclaimed', 'claimed', 'suspended')),
  registered_via text not null default 'rest' check (registered_via in ('rest', 'mcp', 'a2a')),
  created_ip_hash text check (created_ip_hash is null or created_ip_hash ~ '^[0-9a-f]{64}$'),
  claimed_by_user_id uuid references auth.users (id) on delete set null,
  claimed_at timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists agents_created_idx on public.agents (created_at desc);
create index if not exists agents_claimed_by_idx on public.agents (claimed_by_user_id);

-- ---------------------------------------------------------------------------
-- agent_claims
-- ---------------------------------------------------------------------------

create table if not exists public.agent_claims (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  agent_id uuid not null references public.agents (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists agent_claims_agent_idx on public.agent_claims (agent_id);

-- ---------------------------------------------------------------------------
-- requests: agent-posted requests
-- ---------------------------------------------------------------------------

alter table public.requests add column if not exists source text not null default 'human';
alter table public.requests add column if not exists verified boolean not null default true;
alter table public.requests add column if not exists agent_id uuid references public.agents (id) on delete set null;

create index if not exists requests_agent_idx on public.requests (agent_id);

alter table public.requests drop constraint if exists requests_source_check;
alter table public.requests add constraint requests_source_check check (source in ('human', 'agent'));

-- 'pending' = waiting for operator moderation (agent posts start here).
alter table public.requests drop constraint if exists requests_status_check;
alter table public.requests add constraint requests_status_check
  check (status in ('pending', 'active', 'closed', 'expired', 'removed'));

alter table public.requests drop constraint if exists requests_owner_required;
alter table public.requests add constraint requests_owner_required
  check (is_example or owner_user_id is not null or agent_id is not null);

-- Agent posts are never "verified".
alter table public.requests drop constraint if exists requests_agent_unverified;
alter table public.requests add constraint requests_agent_unverified
  check (source <> 'agent' or (verified = false and agent_id is not null));

-- Owners (human flow) must not be able to touch the new columns or leave 'pending'.
create or replace function public.aa_requests_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.aa_is_privileged() then
    return new;
  end if;

  -- Clients never insert directly (no grant); this branch is defensive only.
  if tg_op = 'INSERT' then
    raise exception 'use_create_request' using errcode = '42501';
  end if;

  if old.status = 'removed' then
    raise exception 'request_removed' using errcode = '42501';
  end if;

  if old.status = 'pending' then
    raise exception 'request_pending_moderation' using errcode = '42501';
  end if;

  if new.status not in ('active', 'closed') then
    raise exception 'invalid_status_transition' using errcode = '22023';
  end if;

  if new.expires_at is not null and new.expires_at > now() + interval '180 days' then
    raise exception 'expires_at_too_far' using errcode = '22023';
  end if;

  -- Immutable for owners.
  new.owner_user_id := old.owner_user_id;
  new.identity_id := old.identity_id;
  new.node := old.node;
  new.is_example := old.is_example;
  new.contact_verified_at := old.contact_verified_at;
  new.created_at := old.created_at;
  new.source := old.source;
  new.verified := old.verified;
  new.agent_id := old.agent_id;

  return new;
end;
$$;

-- events: new event types
alter table public.events drop constraint if exists events_event_type_check;
alter table public.events add constraint events_event_type_check check (event_type in (
  'page_view', 'request_created', 'request_viewed', 'request_updated', 'contact_unlocked',
  'agent_registered', 'human_registered', 'identity_registered',
  'request_reported', 'request_auto_hidden',
  'agent_self_registered', 'agent_claimed', 'agent_request_created', 'message_received',
  'request_approved', 'request_rejected', 'message_approved', 'message_rejected'
));

-- ---------------------------------------------------------------------------
-- messages (guestbook / moderation queue)
-- ---------------------------------------------------------------------------

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  to_kind text not null check (to_kind in ('operator', 'request')),
  request_id uuid references public.requests (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  contact text check (contact is null or char_length(contact) <= 200),
  from_name text check (from_name is null or char_length(from_name) <= 80),
  sender_kind text not null check (sender_kind in ('agent', 'anonymous')),
  sender_agent_id uuid references public.agents (id) on delete set null,
  channel text not null default 'rest' check (channel in ('rest', 'mcp', 'a2a')),
  context_id text check (context_id is null or char_length(context_id) <= 128),
  flags text[] not null default '{}' check (cardinality(flags) <= 20),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'spam')),
  ip_hash text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  constraint messages_target check ((to_kind = 'request') = (request_id is not null)),
  constraint messages_sender check ((sender_kind = 'agent') = (sender_agent_id is not null))
);

create index if not exists messages_status_created_idx on public.messages (status, created_at desc);
create index if not exists messages_request_idx on public.messages (request_id, status);
create index if not exists messages_agent_idx on public.messages (sender_agent_id);

-- ---------------------------------------------------------------------------
-- rate_limits / pow_used / agent_visits
-- ---------------------------------------------------------------------------

create table if not exists public.rate_limits (
  bucket text not null check (char_length(bucket) <= 60),
  key text not null check (char_length(key) <= 128),
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (bucket, key, window_start)
);

create index if not exists rate_limits_window_idx on public.rate_limits (window_start);

create table if not exists public.pow_used (
  challenge_hash text primary key check (challenge_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  used_at timestamptz not null default now()
);

create index if not exists pow_used_expires_idx on public.pow_used (expires_at);

create table if not exists public.agent_visits (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  path text not null check (char_length(path) <= 300),
  method text not null check (char_length(method) <= 10),
  user_agent text check (user_agent is null or char_length(user_agent) <= 300),
  ip_hash text check (ip_hash is null or ip_hash ~ '^[0-9a-f]{64}$'),
  is_known_ai_bot boolean not null default false,
  bot_name text check (bot_name is null or char_length(bot_name) <= 60),
  agent_endpoint boolean not null default false,
  referer_host text check (referer_host is null or char_length(referer_host) <= 255)
);

create index if not exists agent_visits_ts_idx on public.agent_visits (ts desc);
create index if not exists agent_visits_bot_ts_idx on public.agent_visits (bot_name, ts desc);

-- ---------------------------------------------------------------------------
-- RLS + grants: server (service_role) only
-- ---------------------------------------------------------------------------

alter table public.agents enable row level security;
alter table public.agent_claims enable row level security;
alter table public.messages enable row level security;
alter table public.rate_limits enable row level security;
alter table public.pow_used enable row level security;
alter table public.agent_visits enable row level security;

revoke all on public.agents, public.agent_claims, public.messages, public.rate_limits,
  public.pow_used, public.agent_visits from anon, authenticated;
revoke all on sequence public.agent_visits_id_seq from anon, authenticated;

grant select, insert, update, delete on public.agents, public.agent_claims, public.messages,
  public.rate_limits, public.pow_used, public.agent_visits to service_role;
grant usage on sequence public.agent_visits_id_seq to service_role;

-- The V0.1 owner policies on requests use owner_user_id; agent rows have none, so
-- authenticated users can never see or update them. Nothing to change there.

-- ---------------------------------------------------------------------------
-- Public views: hide pending posts, expose source / verification label
-- ---------------------------------------------------------------------------

create or replace view public.public_requests
with (security_barrier = true) as
select
  r.id,
  r.node,
  r.request_type,
  r.title,
  r.description,
  r.location,
  r.work_mode,
  r.budget_min,
  r.budget_max,
  r.currency,
  r.budget_note,
  r.is_anonymous,
  r.is_example,
  case
    when r.status = 'active' and r.expires_at is not null and r.expires_at < now() then 'expired'
    else r.status
  end as status,
  r.expires_at,
  r.metadata,
  r.created_at,
  r.updated_at,
  case when r.is_anonymous then null else i.id end as publisher_identity_id,
  case when r.is_anonymous then null else coalesce(i.display_name, a.name) end as publisher_name,
  case when r.is_anonymous then null else coalesce(i.website, a.homepage) end as publisher_website,
  case when r.is_anonymous then null else coalesce(i.machine_endpoint, a.a2a_card_url) end as publisher_machine_endpoint,
  coalesce(i.kind, 'agent') as publisher_kind,
  (r.contact_verified_at is not null) as contact_verified,
  (coalesce(i.verified, false) and not r.is_anonymous) as publisher_verified,
  (select count(*) from public.contact_unlocks cu where cu.request_id = r.id)::int as unlock_count,
  r.source,
  r.verified,
  case when r.is_anonymous then null else r.agent_id end as publisher_agent_id,
  coalesce(a.status = 'claimed', false) as agent_claimed
from public.requests r
left join public.identities i on i.id = r.identity_id
left join public.agents a on a.id = r.agent_id
where r.status not in ('removed', 'pending');

revoke all on public.public_requests from anon, authenticated;
grant select on public.public_requests to anon, authenticated;

-- Re-create so the function picks up the extended row type.
create or replace function public.search_requests(
  p_type text default null,
  p_mode text default null,
  p_location text default null,
  p_q text default null,
  p_include_inactive boolean default false,
  p_limit integer default 50,
  p_offset integer default 0
)
returns setof public.public_requests
language sql
stable
set search_path = ''
as $$
  select pr.*
  from public.public_requests pr
  where (p_include_inactive or pr.status = 'active')
    and (p_type is null or pr.request_type = p_type)
    and (
      p_mode is null
      or (p_mode = 'remote' and pr.work_mode in ('remote', 'online'))
      or (p_mode = 'physical' and pr.work_mode in ('physical', 'hybrid'))
    )
    and (
      p_location is null
      or pr.location ilike '%' || replace(replace(replace(p_location, '\', '\\'), '%', '\%'), '_', '\_') || '%'
    )
    and (
      p_q is null
      or pr.title ilike '%' || replace(replace(replace(p_q, '\', '\\'), '%', '\%'), '_', '\_') || '%'
      or pr.description ilike '%' || replace(replace(replace(p_q, '\', '\\'), '%', '\%'), '_', '\_') || '%'
    )
  order by pr.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.search_requests(text, text, text, text, boolean, integer, integer) from public, anon, authenticated;
grant execute on function public.search_requests(text, text, text, text, boolean, integer, integer) to anon, authenticated;

-- Approved guestbook messages for one public request (plain text, no contact, no ip).
create or replace view public.public_messages
with (security_barrier = true) as
select m.id, m.request_id, m.body, m.from_name, m.sender_kind, m.created_at,
  case when m.sender_kind = 'agent' then a.name else null end as agent_name
from public.messages m
left join public.agents a on a.id = m.sender_agent_id
join public.requests r on r.id = m.request_id and r.status not in ('removed', 'pending')
where m.status = 'approved' and m.to_kind = 'request';

revoke all on public.public_messages from anon, authenticated;
grant select on public.public_messages to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPCs (service_role only)
-- ---------------------------------------------------------------------------

-- Fixed-window counter. Atomic: concurrent callers serialise on the primary key.
create or replace function public.aa_rate_limit_hit(
  p_bucket text,
  p_key text,
  p_window_seconds integer,
  p_max integer
)
returns table (allowed boolean, hits integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window integer := greatest(coalesce(p_window_seconds, 60), 1);
  v_start timestamptz := to_timestamp(floor(extract(epoch from now()) / v_window) * v_window);
  v_hits integer;
begin
  insert into public.rate_limits as rl (bucket, key, window_start, hits)
  values (left(p_bucket, 60), left(p_key, 128), v_start, 1)
  on conflict (bucket, key, window_start) do update set hits = rl.hits + 1
  returning rl.hits into v_hits;

  return query select v_hits <= p_max, v_hits, v_start + make_interval(secs => v_window);
end;
$$;

-- Marks a proof-of-work challenge as spent. Returns false if it was already used.
create or replace function public.aa_pow_consume(p_challenge_hash text, p_expires_at timestamptz)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted text;
begin
  insert into public.pow_used (challenge_hash, expires_at)
  values (p_challenge_hash, p_expires_at)
  on conflict (challenge_hash) do nothing
  returning challenge_hash into v_inserted;
  return v_inserted is not null;
end;
$$;

-- Registers an agent and its one-time claim token atomically.
create or replace function public.aa_register_agent(
  p_name text,
  p_description text,
  p_homepage text,
  p_a2a_card_url text,
  p_key_hash text,
  p_key_prefix text,
  p_claim_token_hash text,
  p_claim_expires_at timestamptz,
  p_ip_hash text,
  p_via text default 'rest'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_agent_id uuid;
begin
  insert into public.agents (name, description, homepage, a2a_card_url, key_hash, key_prefix, created_ip_hash, registered_via)
  values (p_name, p_description, p_homepage, p_a2a_card_url, p_key_hash, p_key_prefix, p_ip_hash, coalesce(p_via, 'rest'))
  returning id into v_agent_id;

  if p_claim_token_hash is not null then
    insert into public.agent_claims (token_hash, agent_id, expires_at)
    values (p_claim_token_hash, v_agent_id, p_claim_expires_at);
  end if;

  insert into public.events (event_type, metadata)
  values ('agent_self_registered', jsonb_build_object('agent_id', v_agent_id, 'via', coalesce(p_via, 'rest')));

  return v_agent_id;
end;
$$;

-- Consumes a claim token and links the agent to a signed-in, email-verified user.
create or replace function public.aa_claim_agent(p_token_hash text, p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_agent_id uuid;
begin
  if not exists (select 1 from auth.users u where u.id = p_user_id and u.email_confirmed_at is not null) then
    raise exception 'contact_not_verified' using errcode = '42501';
  end if;

  update public.agent_claims c
     set used_at = now(), used_by_user_id = p_user_id
   where c.token_hash = p_token_hash and c.used_at is null and c.expires_at > now()
  returning c.agent_id into v_agent_id;

  if v_agent_id is null then
    raise exception 'claim_invalid_or_used' using errcode = 'P0002';
  end if;

  update public.agents
     set status = case when status = 'suspended' then status else 'claimed' end,
         claimed_by_user_id = p_user_id,
         claimed_at = now()
   where id = v_agent_id;

  insert into public.events (event_type, actor_user_id, metadata)
  values ('agent_claimed', p_user_id, jsonb_build_object('agent_id', v_agent_id));

  return v_agent_id;
end;
$$;

-- Inserts an agent-posted request as 'pending' (moderation) with source='agent', verified=false.
create or replace function public.aa_create_agent_request(
  p_agent_id uuid,
  p_request_type text,
  p_title text,
  p_description text,
  p_location text default 'Remote',
  p_work_mode text default 'remote',
  p_budget_min numeric default null,
  p_budget_max numeric default null,
  p_currency text default null,
  p_budget_note text default null,
  p_is_anonymous boolean default false,
  p_expires_at timestamptz default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_id uuid;
  v_expires timestamptz := coalesce(p_expires_at, now() + interval '60 days');
begin
  if not exists (select 1 from public.agents a where a.id = p_agent_id and a.status <> 'suspended') then
    raise exception 'agent_not_found' using errcode = '42501';
  end if;

  if v_expires <= now() or v_expires > now() + interval '180 days' then
    raise exception 'invalid_expires_at' using errcode = '22023';
  end if;

  insert into public.requests (
    agent_id, source, verified, status, request_type, title, description, location, work_mode,
    budget_min, budget_max, currency, budget_note, is_anonymous, expires_at, metadata
  ) values (
    p_agent_id, 'agent', false, 'pending', p_request_type, p_title, p_description,
    coalesce(p_location, 'Remote'), coalesce(p_work_mode, 'remote'),
    p_budget_min, p_budget_max, p_currency, p_budget_note, coalesce(p_is_anonymous, false), v_expires,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_request_id;

  insert into public.events (event_type, request_id, metadata)
  values ('agent_request_created', v_request_id, jsonb_build_object('agent_id', p_agent_id, 'request_type', p_request_type));

  return v_request_id;
end;
$$;

-- Retention.
create or replace function public.aa_purge_old_rows()
returns table (visits_deleted bigint, pow_deleted bigint, rate_limits_deleted bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_visits bigint;
  v_pow bigint;
  v_rl bigint;
begin
  delete from public.agent_visits where ts < now() - interval '90 days';
  get diagnostics v_visits = row_count;
  delete from public.pow_used where expires_at < now() - interval '1 day';
  get diagnostics v_pow = row_count;
  delete from public.rate_limits where window_start < now() - interval '2 days';
  get diagnostics v_rl = row_count;
  return query select v_visits, v_pow, v_rl;
end;
$$;

revoke all on function public.aa_rate_limit_hit(text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.aa_pow_consume(text, timestamptz) from public, anon, authenticated;
revoke all on function public.aa_register_agent(text, text, text, text, text, text, text, timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.aa_claim_agent(text, uuid) from public, anon, authenticated;
revoke all on function public.aa_create_agent_request(uuid, text, text, text, text, text, numeric, numeric, text, text, boolean, timestamptz, jsonb) from public, anon, authenticated;
revoke all on function public.aa_purge_old_rows() from public, anon, authenticated;

grant execute on function public.aa_rate_limit_hit(text, text, integer, integer) to service_role;
grant execute on function public.aa_pow_consume(text, timestamptz) to service_role;
grant execute on function public.aa_register_agent(text, text, text, text, text, text, text, timestamptz, text, text) to service_role;
grant execute on function public.aa_claim_agent(text, uuid) to service_role;
grant execute on function public.aa_create_agent_request(uuid, text, text, text, text, text, numeric, numeric, text, text, boolean, timestamptz, jsonb) to service_role;
grant execute on function public.aa_purge_old_rows() to service_role;

-- Optional daily retention job (requires the pg_cron extension; run once manually):
--   select cron.schedule('aa-purge-old-rows', '17 3 * * *', $$select public.aa_purge_old_rows()$$);
