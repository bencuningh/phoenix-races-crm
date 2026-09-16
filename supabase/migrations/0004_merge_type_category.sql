-- Category was merged into Type (combined role · sector values, e.g.
-- "Partner · Nutrition"), matching the same merge done on the Notion side.
alter table public.contacts_cache drop column category;
