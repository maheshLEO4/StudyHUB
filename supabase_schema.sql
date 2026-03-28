-- ============================================================
--  StudyHub — Supabase SQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. SUBJECTS
create table if not exists subjects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  color       text default '#6c63ff',
  icon        text default '📚',
  created_at  timestamptz default now()
);

-- 2. NOTES
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid references subjects(id) on delete cascade,
  title       text not null,
  content     text,
  is_important boolean default false,
  tags        text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 3. TASKS
create table if not exists tasks (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  checklist_name text,
  completed      boolean default false,
  due_date       date,
  priority       text default 'Medium' check (priority in ('Low', 'Medium', 'High')),
  created_at     timestamptz default now()
);

-- 4. DSA PROBLEMS
create table if not exists dsa_problems (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  url        text,
  status     text default 'Not Started' check (status in ('Not Started', 'In Progress', 'Completed')),
  difficulty text default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  topic      text,
  notes      text,
  created_at timestamptz default now()
);

-- 5. CALENDAR EVENTS
create table if not exists calendar_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  date        date not null,
  time        text,
  type        text default 'Study' check (type in ('Study', 'Assignment', 'Exam', 'Reminder', 'Other')),
  description text,
  created_at  timestamptz default now()
);

-- 6. LINKS
create table if not exists links (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  url         text not null,
  description text,
  category    text default 'Other' check (category in ('DSA Problems', 'YouTube', 'Articles', 'Coding Platforms', 'Other')),
  tags        text[] default '{}',
  created_at  timestamptz default now()
);

-- ============================================================
--  Row Level Security (RLS)
--  Option A: Public access (no auth needed) — good for personal use
-- ============================================================

alter table subjects       enable row level security;
alter table notes          enable row level security;
alter table tasks          enable row level security;
alter table dsa_problems   enable row level security;
alter table calendar_events enable row level security;
alter table links          enable row level security;

-- Allow full public access (personal/solo use)
create policy "public_all" on subjects        for all using (true) with check (true);
create policy "public_all" on notes           for all using (true) with check (true);
create policy "public_all" on tasks           for all using (true) with check (true);
create policy "public_all" on dsa_problems    for all using (true) with check (true);
create policy "public_all" on calendar_events for all using (true) with check (true);
create policy "public_all" on links           for all using (true) with check (true);

-- ============================================================
--  Option B: Auth-based access (uncomment if using Supabase Auth)
--  Replace the "public_all" policies above with these:
-- ============================================================
-- create policy "auth_all" on subjects        for all using (auth.uid() is not null) with check (auth.uid() is not null);
-- create policy "auth_all" on notes           for all using (auth.uid() is not null) with check (auth.uid() is not null);
-- create policy "auth_all" on tasks           for all using (auth.uid() is not null) with check (auth.uid() is not null);
-- create policy "auth_all" on dsa_problems    for all using (auth.uid() is not null) with check (auth.uid() is not null);
-- create policy "auth_all" on calendar_events for all using (auth.uid() is not null) with check (auth.uid() is not null);
-- create policy "auth_all" on links           for all using (auth.uid() is not null) with check (auth.uid() is not null);

-- ============================================================
--  Indexes for performance
-- ============================================================

create index if not exists notes_subject_id_idx    on notes(subject_id);
create index if not exists notes_updated_at_idx    on notes(updated_at desc);
create index if not exists tasks_completed_idx     on tasks(completed);
create index if not exists dsa_status_idx          on dsa_problems(status);
create index if not exists events_date_idx         on calendar_events(date);
