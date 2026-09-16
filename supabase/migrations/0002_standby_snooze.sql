alter table public.contacts_cache add column standby boolean not null default false;
alter table public.contacts_cache add column snooze_until date;
