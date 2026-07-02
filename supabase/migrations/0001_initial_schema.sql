create extension if not exists "uuid-ossp";

create table if not exists public.learning_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  title text not null,
  description text,
  target_level text,
  weekly_hours integer,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

alter table public.learning_goals enable row level security;

create policy "Users can manage their own learning goals"
on public.learning_goals
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
