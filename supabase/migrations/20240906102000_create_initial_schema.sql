-- Migration: create_initial_schema
-- Description: Creates the initial database schema for 10x-cards application
-- Tables: users, flashcards, source, generations, generation_errors_log
-- Created at: 2024-09-06

-- note: users table is managed by supabase auth, this is just for reference
-- the actual table is created by supabase automatically

-- create source table
create table if not exists source (
  id uuid primary key default gen_random_uuid(),
  model varchar not null,
  text_hash varchar not null,
  length integer not null check (length between 1000 and 10000),
  source_type varchar not null check (source_type in ('ai-full', 'ai-edited', 'manula')),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- create index on source table
create index if not exists source_user_id_idx on source(user_id);

-- create generations table
create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source_id uuid references source(id) on delete cascade,
  generated_count integer not null default 0 check (generated_count >= 0),
  accepted_unedited_count integer not null default 0 check (accepted_unedited_count >= 0),
  accepted_edited_count integer not null default 0 check (accepted_edited_count >= 0),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- create indexes on generations table
create index if not exists generations_user_id_idx on generations(user_id);
create index if not exists generations_source_id_idx on generations(source_id);

-- create flashcards table
create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  front varchar(200) not null,
  back varchar(500) not null,
  source_id uuid references source(id) on delete cascade,
  generation_id uuid references generations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- create indexes on flashcards table
create index if not exists flashcards_user_id_idx on flashcards(user_id);
create index if not exists flashcards_source_id_idx on flashcards(source_id);
create index if not exists flashcards_generation_id_idx on flashcards(generation_id);

-- create generation_errors_log table
create table if not exists generation_errors_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source_id uuid references source(id) on delete cascade,
  error_code varchar not null,
  error_message text not null,
  created_at timestamp with time zone not null default now()
);

-- create indexes on generation_errors_log table
create index if not exists generation_errors_log_user_id_idx on generation_errors_log(user_id);
create index if not exists generation_errors_log_source_id_idx on generation_errors_log(source_id);

-- enable row level security on all tables
alter table source enable row level security;
alter table generations enable row level security;
alter table flashcards enable row level security;
alter table generation_errors_log enable row level security;

-- create row level security policies for source table
-- policy for authenticated users to select their own data
create policy "Users can view their own sources"
  on source for select
  to authenticated
  using (user_id = auth.uid());

-- policy for authenticated users to insert their own data
create policy "Users can insert their own sources"
  on source for insert
  to authenticated
  with check (user_id = auth.uid());

-- policy for authenticated users to update their own data
create policy "Users can update their own sources"
  on source for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- policy for authenticated users to delete their own data
create policy "Users can delete their own sources"
  on source for delete
  to authenticated
  using (user_id = auth.uid());

-- create row level security policies for generations table
-- policy for authenticated users to select their own data
create policy "Users can view their own generations"
  on generations for select
  to authenticated
  using (user_id = auth.uid());

-- policy for authenticated users to insert their own data
create policy "Users can insert their own generations"
  on generations for insert
  to authenticated
  with check (user_id = auth.uid());

-- policy for authenticated users to update their own data
create policy "Users can update their own generations"
  on generations for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- policy for authenticated users to delete their own data
create policy "Users can delete their own generations"
  on generations for delete
  to authenticated
  using (user_id = auth.uid());

-- create row level security policies for flashcards table
-- policy for authenticated users to select their own data
create policy "Users can view their own flashcards"
  on flashcards for select
  to authenticated
  using (user_id = auth.uid());

-- policy for authenticated users to insert their own data
create policy "Users can insert their own flashcards"
  on flashcards for insert
  to authenticated
  with check (user_id = auth.uid());

-- policy for authenticated users to update their own data
create policy "Users can update their own flashcards"
  on flashcards for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- policy for authenticated users to delete their own data
create policy "Users can delete their own flashcards"
  on flashcards for delete
  to authenticated
  using (user_id = auth.uid());

-- create row level security policies for generation_errors_log table
-- policy for authenticated users to select their own data
create policy "Users can view their own generation errors"
  on generation_errors_log for select
  to authenticated
  using (user_id = auth.uid());

-- policy for authenticated users to insert their own data
create policy "Users can insert their own generation errors"
  on generation_errors_log for insert
  to authenticated
  with check (user_id = auth.uid());

-- Create separate policies for anon users (all deny access since these tables should only be accessed by authenticated users)
-- Source table anon policies
create policy "Anon users cannot select sources"
  on source for select
  to anon
  using (false);

create policy "Anon users cannot insert sources"
  on source for insert
  to anon
  with check (false);

-- Generations table anon policies
create policy "Anon users cannot select generations"
  on generations for select
  to anon
  using (false);

create policy "Anon users cannot insert generations"
  on generations for insert
  to anon
  with check (false);

-- Flashcards table anon policies
create policy "Anon users cannot select flashcards"
  on flashcards for select
  to anon
  using (false);

create policy "Anon users cannot insert flashcards"
  on flashcards for insert
  to anon
  with check (false);

-- Generation errors log table anon policies
create policy "Anon users cannot select generation errors"
  on generation_errors_log for select
  to anon
  using (false);

create policy "Anon users cannot insert generation errors"
  on generation_errors_log for insert
  to anon
  with check (false); 