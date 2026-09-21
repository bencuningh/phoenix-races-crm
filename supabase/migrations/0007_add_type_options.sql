-- type_options: cached snapshot of the Notion "Type" select property's options,
-- refreshed on every sync so the app's Type dropdown can never drift from Notion.
create table public.type_options (
  id integer primary key default 1,
  options text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint type_options_singleton check (id = 1)
);

alter table public.type_options enable row level security;
