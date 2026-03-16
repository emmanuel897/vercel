-- Run this in your Supabase SQL editor to create the tasks table

create table public.tasks (
  id          bigserial primary key,
  title       text        not null,
  description text,
  done        boolean     not null default false,
  created_at  timestamptz not null default now()
);

-- Enable Row Level Security (optional but recommended)
alter table public.tasks enable row level security;

-- Allow anonymous reads and writes for demo purposes
-- (In production, add auth-based policies)
create policy "Allow all" on public.tasks
  for all using (true) with check (true);
