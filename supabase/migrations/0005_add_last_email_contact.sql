-- Last email contact date: max(lastSent, lastReceived) from Gmail, kept separate
-- from last_reach (which can also be set manually in Notion).
alter table public.contacts_cache add column last_email_contact date;
