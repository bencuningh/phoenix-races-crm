-- Per-contact override of the follow-up threshold (days). Null means "use the
-- global default" (env.followupThresholdDays).
alter table public.contacts_cache add column followup_threshold_days integer;
