-- contacts_cache: mirror of Notion contacts + computed follow-up fields
create table public.contacts_cache (
  id uuid primary key default gen_random_uuid(),
  notion_page_id text not null unique,
  name text not null,
  company text,
  type text,
  category text,
  email text,
  linkedin text,
  last_reach date,
  is_company_row boolean not null default false,
  days_since_contact integer,
  needs_followup boolean not null default false,
  followup_reason text check (followup_reason in ('never_contacted', 'awaiting_reply', 'silence') or followup_reason is null),
  needs_qualification boolean not null default false,
  updated_at timestamptz not null default now()
);

create index contacts_cache_needs_followup_idx on public.contacts_cache (needs_followup);
create index contacts_cache_company_idx on public.contacts_cache (company);
create index contacts_cache_category_idx on public.contacts_cache (category);
create index contacts_cache_type_idx on public.contacts_cache (type);

-- oauth_tokens: Gmail refresh token storage, service-role access only
create table public.oauth_tokens (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'gmail',
  refresh_token text not null,
  access_token text,
  expiry timestamptz,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider)
);

-- sync_log: history of sync runs, for debugging
create table public.sync_log (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running' check (status in ('running', 'success', 'error', 'partial')),
  trigger text not null default 'manual' check (trigger in ('cron', 'manual')),
  contacts_processed integer not null default 0,
  contacts_updated integer not null default 0,
  errors jsonb
);

create index sync_log_started_at_idx on public.sync_log (started_at desc);

-- Lock everything down: only the service role (used server-side only) can read/write.
-- No policies are defined for anon/authenticated, so RLS denies them by default.
alter table public.contacts_cache enable row level security;
alter table public.oauth_tokens enable row level security;
alter table public.sync_log enable row level security;
