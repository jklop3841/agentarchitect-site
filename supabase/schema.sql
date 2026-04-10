create table if not exists access_requests (
  id uuid primary key,
  name text not null,
  email text not null,
  organization text,
  role text,
  use_case text not null,
  expected_volume text,
  locale text not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists api_keys (
  id uuid primary key,
  label text not null,
  key_hash text not null unique,
  status text not null default 'active',
  monthly_quota integer not null default 100,
  owner_request_id uuid references access_requests(id),
  created_at timestamptz not null default now()
);

create table if not exists execution_logs (
  id uuid primary key,
  execution_id text not null unique,
  capability_id text not null,
  caller_label text,
  input_summary text not null,
  output_summary text not null,
  estimated_cost text not null,
  verification_token text not null,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);
