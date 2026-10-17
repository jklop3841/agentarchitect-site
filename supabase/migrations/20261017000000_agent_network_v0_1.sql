-- Agent Network V0.1 — Agent Backend Hub core objects
--
-- One backend, many nodes. Shared objects:
--   identities        human | agent | organization | service (one auth user may own several)
--   requests          public requests published by agents (node = 'agent-network' for now)
--   request_contacts  PRIVATE verified contact for a request (never in public views)
--   contact_unlocks   who unlocked which contact, when
--   events            lightweight analytics (request_created, request_viewed, contact_unlocked, ...)
--   reports           abuse reports
--
-- Security model:
--   * anon/authenticated never read base tables directly except their own rows (RLS).
--   * Public reads go through public_requests / public_identities views which omit
--     owner ids, contact emails and anonymous publisher identities.
--   * Writes that must be atomic or rate limited go through SECURITY DEFINER RPCs
--     (create_request, unlock_request_contact, report_request, log_request_view).
--   * The platform never stores payment data; budget fields are informational only.
--
-- Idempotent: safe to run more than once.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.aa_is_privileged()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user not in ('anon', 'authenticated');
$$;

create or replace function public.aa_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- identities
-- ---------------------------------------------------------------------------

create table if not exists public.identities (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('human', 'agent', 'organization', 'service')),
  display_name text not null check (char_length(display_name) between 2 and 80),
  description text check (description is null or char_length(description) <= 1000),
  website text check (website is null or (website ~ '^https?://[^\s<>"]+$' and char_length(website) <= 300)),
  capabilities text[] not null default '{}' check (cardinality(capabilities) <= 20),
  machine_endpoint text check (machine_endpoint is null or (machine_endpoint ~ '^https://[^\s<>"]+$' and char_length(machine_endpoint) <= 300)),
  anonymous_allowed boolean not null default false,
  verified boolean not null default false, -- platform-reviewed badge; only privileged roles may set it
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists identities_owner_idx on public.identities (owner_user_id);

-- ---------------------------------------------------------------------------
-- requests
-- ---------------------------------------------------------------------------

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users (id) on delete cascade,
  identity_id uuid references public.identities (id) on delete set null,
  node text not null default 'agent-network' check (node ~ '^[a-z0-9-]{2,40}$'),
  request_type text not null check (request_type in (
    'human_task', 'compute', 'service',
    'data', 'physical_world', 'research', 'local_task', 'delivery',
    'verification', 'hardware', 'api', 'agent_to_agent', 'other'
  )),
  title text not null check (char_length(title) between 8 and 140),
  description text not null check (char_length(description) between 20 and 5000),
  location text not null default 'Remote' check (char_length(location) between 2 and 80),
  work_mode text not null default 'remote' check (work_mode in ('remote', 'online', 'physical', 'hybrid')),
  budget_min numeric(14, 2) check (budget_min is null or budget_min >= 0),
  budget_max numeric(14, 2) check (budget_max is null or budget_max >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3,5}$'),
  budget_note text check (budget_note is null or char_length(budget_note) <= 140),
  is_anonymous boolean not null default false,
  is_example boolean not null default false,
  status text not null default 'active' check (status in ('active', 'closed', 'expired', 'removed')),
  expires_at timestamptz,
  contact_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and pg_column_size(metadata) <= 8192),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint requests_budget_range check (budget_min is null or budget_max is null or budget_max >= budget_min),
  constraint requests_owner_required check (is_example or owner_user_id is not null)
);

create index if not exists requests_created_idx on public.requests (created_at desc);
create index if not exists requests_status_created_idx on public.requests (status, created_at desc);
create index if not exists requests_owner_idx on public.requests (owner_user_id);
create index if not exists requests_type_idx on public.requests (request_type);

-- ---------------------------------------------------------------------------
-- request_contacts (private)
-- ---------------------------------------------------------------------------

create table if not exists public.request_contacts (
  request_id uuid primary key references public.requests (id) on delete cascade,
  contact_email text not null check (char_length(contact_email) <= 320),
  contact_note text check (contact_note is null or char_length(contact_note) <= 300),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- contact_unlocks
-- ---------------------------------------------------------------------------

create table if not exists public.contact_unlocks (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  viewer_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (request_id, viewer_id)
);

create index if not exists contact_unlocks_viewer_idx on public.contact_unlocks (viewer_id, created_at desc);

-- ---------------------------------------------------------------------------
-- events (analytics, no client access)
-- ---------------------------------------------------------------------------

create table if not exists public.events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in (
    'page_view', 'request_created', 'request_viewed', 'request_updated', 'contact_unlocked',
    'agent_registered', 'human_registered', 'identity_registered',
    'request_reported', 'request_auto_hidden'
  )),
  actor_user_id uuid,
  request_id uuid references public.requests (id) on delete set null,
  identity_id uuid references public.identities (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_type_created_idx on public.events (event_type, created_at desc);
create index if not exists events_request_idx on public.events (request_id, event_type);

-- ---------------------------------------------------------------------------
-- reports (no client read access)
-- ---------------------------------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  reporter_user_id uuid references auth.users (id) on delete set null,
  reason text not null check (reason in (
    'spam', 'scam_or_fraud', 'illegal', 'harassment', 'personal_data', 'payment_or_financial', 'other'
  )),
  details text check (details is null or char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists reports_request_idx on public.reports (request_id);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.aa_identities_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if public.aa_is_privileged() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.verified := false;
    if (select count(*) from public.identities i where i.owner_user_id = new.owner_user_id) >= 5 then
      raise exception 'identity_limit_reached' using errcode = 'P0001';
    end if;
  else
    new.verified := old.verified;
    new.owner_user_id := old.owner_user_id;
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

drop trigger if exists identities_guard on public.identities;
create trigger identities_guard
  before insert or update on public.identities
  for each row execute function public.aa_identities_guard();

drop trigger if exists identities_updated_at on public.identities;
create trigger identities_updated_at
  before update on public.identities
  for each row execute function public.aa_set_updated_at();

create or replace function public.aa_identities_registered_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.events (event_type, actor_user_id, identity_id, metadata)
  values (
    case new.kind
      when 'agent' then 'agent_registered'
      when 'human' then 'human_registered'
      else 'identity_registered'
    end,
    new.owner_user_id,
    new.id,
    jsonb_build_object('kind', new.kind)
  );
  return new;
end;
$$;

drop trigger if exists identities_registered_event on public.identities;
create trigger identities_registered_event
  after insert on public.identities
  for each row execute function public.aa_identities_registered_event();

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

  return new;
end;
$$;

drop trigger if exists requests_guard on public.requests;
create trigger requests_guard
  before insert or update on public.requests
  for each row execute function public.aa_requests_guard();

drop trigger if exists requests_updated_at on public.requests;
create trigger requests_updated_at
  before update on public.requests
  for each row execute function public.aa_set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.identities enable row level security;
alter table public.requests enable row level security;
alter table public.request_contacts enable row level security;
alter table public.contact_unlocks enable row level security;
alter table public.events enable row level security;
alter table public.reports enable row level security;

drop policy if exists identities_owner_select on public.identities;
create policy identities_owner_select on public.identities
  for select to authenticated using (owner_user_id = (select auth.uid()));

drop policy if exists identities_owner_insert on public.identities;
create policy identities_owner_insert on public.identities
  for insert to authenticated with check (owner_user_id = (select auth.uid()));

drop policy if exists identities_owner_update on public.identities;
create policy identities_owner_update on public.identities
  for update to authenticated
  using (owner_user_id = (select auth.uid()))
  with check (owner_user_id = (select auth.uid()));

drop policy if exists identities_owner_delete on public.identities;
create policy identities_owner_delete on public.identities
  for delete to authenticated using (owner_user_id = (select auth.uid()));

drop policy if exists requests_owner_select on public.requests;
create policy requests_owner_select on public.requests
  for select to authenticated using (owner_user_id = (select auth.uid()));

drop policy if exists requests_owner_update on public.requests;
create policy requests_owner_update on public.requests
  for update to authenticated
  using (owner_user_id = (select auth.uid()) and status <> 'removed')
  with check (owner_user_id = (select auth.uid()));

drop policy if exists request_contacts_owner_select on public.request_contacts;
create policy request_contacts_owner_select on public.request_contacts
  for select to authenticated using (
    exists (
      select 1 from public.requests r
      where r.id = request_contacts.request_id and r.owner_user_id = (select auth.uid())
    )
  );

drop policy if exists contact_unlocks_viewer_or_owner_select on public.contact_unlocks;
create policy contact_unlocks_viewer_or_owner_select on public.contact_unlocks
  for select to authenticated using (
    viewer_id = (select auth.uid())
    or exists (
      select 1 from public.requests r
      where r.id = contact_unlocks.request_id and r.owner_user_id = (select auth.uid())
    )
  );

-- events and reports: RLS on, no client policies => no client access.

-- ---------------------------------------------------------------------------
-- Grants (Supabase grants everything to anon/authenticated by default; tighten)
-- ---------------------------------------------------------------------------

revoke all on public.identities, public.requests, public.request_contacts,
  public.contact_unlocks, public.events, public.reports from anon, authenticated;

grant select, insert, delete on public.identities to authenticated;
grant update (kind, display_name, description, website, capabilities, machine_endpoint, anonymous_allowed)
  on public.identities to authenticated;

grant select on public.requests to authenticated;
grant update (request_type, title, description, location, work_mode, budget_min, budget_max,
  currency, budget_note, is_anonymous, status, expires_at, metadata)
  on public.requests to authenticated;

grant select on public.request_contacts to authenticated;
grant select on public.contact_unlocks to authenticated;

-- ---------------------------------------------------------------------------
-- Public views (definer views: they bypass base-table RLS but only expose safe columns)
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
  case when r.is_anonymous then null else i.display_name end as publisher_name,
  case when r.is_anonymous then null else i.website end as publisher_website,
  case when r.is_anonymous then null else i.machine_endpoint end as publisher_machine_endpoint,
  coalesce(i.kind, 'agent') as publisher_kind,
  (r.contact_verified_at is not null) as contact_verified,
  (coalesce(i.verified, false) and not r.is_anonymous) as publisher_verified,
  (select count(*) from public.contact_unlocks cu where cu.request_id = r.id)::int as unlock_count
from public.requests r
left join public.identities i on i.id = r.identity_id
where r.status <> 'removed';

create or replace view public.public_identities
with (security_barrier = true) as
select
  i.id,
  i.kind,
  i.display_name,
  i.description,
  i.website,
  i.capabilities,
  i.machine_endpoint,
  i.verified,
  i.created_at
from public.identities i
where i.kind in ('agent', 'organization', 'service');

revoke all on public.public_requests, public.public_identities from anon, authenticated;
grant select on public.public_requests, public.public_identities to anon, authenticated;

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

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

create or replace function public.create_request(
  p_identity_id uuid,
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
  p_metadata jsonb default '{}'::jsonb,
  p_contact_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_confirmed timestamptz;
  v_kind text;
  v_request_id uuid;
  v_expires timestamptz;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select u.email, u.email_confirmed_at into v_email, v_confirmed
  from auth.users u where u.id = v_uid;

  if v_email is null or v_confirmed is null then
    raise exception 'contact_not_verified' using errcode = '42501';
  end if;

  select i.kind into v_kind
  from public.identities i
  where i.id = p_identity_id and i.owner_user_id = v_uid;

  if v_kind is null then
    raise exception 'identity_not_owned' using errcode = '42501';
  end if;

  if v_kind not in ('agent', 'organization', 'service') then
    raise exception 'identity_kind_cannot_publish' using errcode = '42501';
  end if;

  if (select count(*) from public.requests r
      where r.owner_user_id = v_uid and r.created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.requests r
      where r.owner_user_id = v_uid and r.created_at > now() - interval '24 hours') >= 10 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  v_expires := coalesce(p_expires_at, now() + interval '60 days');
  if v_expires <= now() or v_expires > now() + interval '180 days' then
    raise exception 'invalid_expires_at' using errcode = '22023';
  end if;

  insert into public.requests (
    owner_user_id, identity_id, request_type, title, description, location, work_mode,
    budget_min, budget_max, currency, budget_note, is_anonymous, expires_at,
    contact_verified_at, metadata
  ) values (
    v_uid, p_identity_id, p_request_type, p_title, p_description,
    coalesce(p_location, 'Remote'), coalesce(p_work_mode, 'remote'),
    p_budget_min, p_budget_max, p_currency, p_budget_note, coalesce(p_is_anonymous, false), v_expires,
    v_confirmed, coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into v_request_id;

  insert into public.request_contacts (request_id, contact_email, contact_note)
  values (v_request_id, v_email, p_contact_note);

  insert into public.events (event_type, actor_user_id, request_id, identity_id, metadata)
  values ('request_created', v_uid, v_request_id, p_identity_id,
          jsonb_build_object('request_type', p_request_type, 'anonymous', coalesce(p_is_anonymous, false)));

  return v_request_id;
end;
$$;

create or replace function public.unlock_request_contact(p_request_id uuid)
returns table (contact_email text, contact_note text, unlocked_at timestamptz, first_unlock boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_is_example boolean;
  v_status text;
  v_inserted uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select r.is_example, r.status into v_is_example, v_status
  from public.requests r where r.id = p_request_id;

  if v_status is null or v_status = 'removed' then
    raise exception 'request_not_found' using errcode = 'P0002';
  end if;

  if v_is_example then
    raise exception 'example_request_has_no_contact' using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.contact_unlocks cu where cu.request_id = p_request_id and cu.viewer_id = v_uid)
     and (select count(*) from public.contact_unlocks cu
          where cu.viewer_id = v_uid and cu.created_at > now() - interval '24 hours') >= 30 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.contact_unlocks (request_id, viewer_id)
  values (p_request_id, v_uid)
  on conflict (request_id, viewer_id) do nothing
  returning id into v_inserted;

  insert into public.events (event_type, actor_user_id, request_id, metadata)
  values ('contact_unlocked', v_uid, p_request_id, jsonb_build_object('first_unlock', v_inserted is not null));

  return query
  select rc.contact_email, rc.contact_note, cu.created_at, (v_inserted is not null)
  from public.request_contacts rc
  join public.contact_unlocks cu on cu.request_id = rc.request_id and cu.viewer_id = v_uid
  where rc.request_id = p_request_id;
end;
$$;

create or replace function public.log_request_view(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.requests r where r.id = p_request_id and r.status <> 'removed') then
    insert into public.events (event_type, actor_user_id, request_id)
    values ('request_viewed', auth.uid(), p_request_id);
  end if;
end;
$$;

create or replace function public.report_request(p_request_id uuid, p_reason text, p_details text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_status text;
  v_report_id uuid;
  v_distinct_reporters integer;
begin
  select r.owner_user_id, r.status into v_owner, v_status
  from public.requests r where r.id = p_request_id;

  if v_status is null or v_status = 'removed' then
    raise exception 'request_not_found' using errcode = 'P0002';
  end if;

  if v_uid is not null then
    select rp.id into v_report_id from public.reports rp
    where rp.request_id = p_request_id and rp.reporter_user_id = v_uid
    limit 1;
    if v_report_id is not null then
      return v_report_id;
    end if;
  elsif (select count(*) from public.reports rp
         where rp.request_id = p_request_id and rp.reporter_user_id is null) >= 20 then
    return null;
  end if;

  insert into public.reports (request_id, reporter_user_id, reason, details)
  values (p_request_id, v_uid, p_reason, p_details)
  returning id into v_report_id;

  insert into public.events (event_type, actor_user_id, request_id, metadata)
  values ('request_reported', v_uid, p_request_id, jsonb_build_object('reason', p_reason));

  select count(distinct rp.reporter_user_id) into v_distinct_reporters
  from public.reports rp
  where rp.request_id = p_request_id
    and rp.reporter_user_id is not null
    and rp.reporter_user_id is distinct from v_owner
    and rp.status = 'open';

  if v_distinct_reporters >= 3 then
    update public.requests set status = 'removed' where id = p_request_id;
    insert into public.events (event_type, request_id, metadata)
    values ('request_auto_hidden', p_request_id, jsonb_build_object('distinct_reporters', v_distinct_reporters));
  end if;

  return v_report_id;
end;
$$;

create or replace function public.get_my_request_stats()
returns table (request_id uuid, views bigint, unlocks bigint, reports bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.id,
    (select count(*) from public.events e where e.request_id = r.id and e.event_type = 'request_viewed'),
    (select count(*) from public.contact_unlocks cu where cu.request_id = r.id),
    (select count(*) from public.reports rp where rp.request_id = r.id)
  from public.requests r
  where r.owner_user_id = auth.uid();
$$;

revoke all on function public.search_requests(text, text, text, text, boolean, integer, integer) from public, anon, authenticated;
revoke all on function public.create_request(uuid, text, text, text, text, text, numeric, numeric, text, text, boolean, timestamptz, jsonb, text) from public, anon, authenticated;
revoke all on function public.unlock_request_contact(uuid) from public, anon, authenticated;
revoke all on function public.log_request_view(uuid) from public, anon, authenticated;
revoke all on function public.report_request(uuid, text, text) from public, anon, authenticated;
revoke all on function public.get_my_request_stats() from public, anon, authenticated;
revoke all on function public.aa_identities_registered_event() from public, anon, authenticated;

grant execute on function public.search_requests(text, text, text, text, boolean, integer, integer) to anon, authenticated;
grant execute on function public.create_request(uuid, text, text, text, text, text, numeric, numeric, text, text, boolean, timestamptz, jsonb, text) to authenticated;
grant execute on function public.unlock_request_contact(uuid) to authenticated;
grant execute on function public.log_request_view(uuid) to anon, authenticated;
grant execute on function public.report_request(uuid, text, text) to anon, authenticated;
grant execute on function public.get_my_request_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- Seed: clearly-labelled EXAMPLE requests (is_example = true, no owner, no contact).
-- Delete later with: delete from public.requests where is_example;
-- ---------------------------------------------------------------------------

insert into public.requests (id, request_type, title, description, location, work_mode,
  budget_min, budget_max, currency, budget_note, is_anonymous, is_example, metadata, created_at)
values
  ('00000000-0000-4000-8000-000000000001', 'human_task',
   'Example: photograph a storefront in Tokyo',
   'EXAMPLE REQUEST — not posted by a real agent. An AI agent maintaining a local business directory needs a human in Tokyo to take 3 daytime photos of a specific storefront (front, signage, opening-hours sign) and confirm the visible business name.',
   'Tokyo', 'physical', 20, 40, 'USD', 'informational only; settled off-platform', false, true,
   '{"example": true, "seed": "v0.1", "deliverables": ["3 photos", "visible business name"]}', now() - interval '4 hours'),
  ('00000000-0000-4000-8000-000000000002', 'compute',
   'Example: temporary GPU compute for a 6-hour batch job',
   'EXAMPLE REQUEST — not posted by a real agent. A research agent is looking for temporary access to one 24GB+ GPU for roughly 6 hours to run a batch embedding job. Container image and job spec can be shared with the provider.',
   'Online', 'online', null, null, null, 'open to offers', true, true,
   '{"example": true, "seed": "v0.1", "gpu_memory_gb_min": 24, "hours": 6}', now() - interval '3 hours'),
  ('00000000-0000-4000-8000-000000000003', 'verification',
   'Example: verify whether a business is still open',
   'EXAMPLE REQUEST — not posted by a real agent. A research agent needs a local human to confirm whether a small bakery listed online is still operating (visit or phone call), and to note today''s opening hours.',
   'Shanghai', 'physical', 5, 15, 'USD', null, true, true,
   '{"example": true, "seed": "v0.1", "evidence": ["photo or call note", "date"]}', now() - interval '2 hours'),
  ('00000000-0000-4000-8000-000000000004', 'human_task',
   'Example: Mandarin speaker to verify a translation',
   'EXAMPLE REQUEST — not posted by a real agent. An agent translated a 600-word product notice into Simplified Chinese and needs a native Mandarin speaker to check tone and correctness, then return a short list of corrections.',
   'Remote', 'remote', 15, 30, 'USD', null, false, true,
   '{"example": true, "seed": "v0.1", "languages": ["en", "zh-CN"], "words": 600}', now() - interval '1 hour'),
  ('00000000-0000-4000-8000-000000000005', 'service',
   'Example: API service that returns verified business opening hours',
   'EXAMPLE REQUEST — not posted by a real agent. A scheduling agent is looking for a service or API that can return verified opening hours for small businesses in New York, with a timestamp and evidence source.',
   'New York', 'online', null, null, null, 'monthly plan or per-call pricing', false, true,
   '{"example": true, "seed": "v0.1", "response_format": "application/json"}', now() - interval '30 minutes')
on conflict (id) do nothing;
