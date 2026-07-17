-- ============================================
-- Covenant Learning — Supabase Schema
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- USERS (extends Supabase auth.users via profile table)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  role text not null default 'student' check (role in ('student', 'facilitator', 'admin')),
  organization_id uuid,
  created_at timestamptz default now()
);

-- ORGANIZATIONS (multi-tenant support for churches/cohorts)
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz default now()
);

-- COURSES
create table if not exists public.courses (
  id text primary key,               -- e.g. 'covenant-marriage-foundation'
  title text not null,
  description text,
  modules jsonb not null default '[]', -- full module array as JSON
  bonus_resources jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ENROLLMENTS
create table if not exists public.enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id text references public.courses(id) on delete cascade,
  enrolled_at timestamptz default now(),
  unique (user_id, course_id)
);

-- PROGRESS (per user, per course, JSON blob of module completion + worksheet answers)
create table if not exists public.user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id text references public.courses(id) on delete cascade,
  progress jsonb not null default '{}',
  updated_at timestamptz default now(),
  unique (user_id, course_id)
);

-- CERTIFICATES ISSUED
create table if not exists public.certificates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  course_id text references public.courses(id) on delete cascade,
  issued_at timestamptz default now(),
  certificate_url text
);

-- ============================================
-- Row Level Security
-- ============================================
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.enrollments enable row level security;
alter table public.certificates enable row level security;
alter table public.courses enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Courses: readable by everyone (public catalog), writable only by admins
create policy "Courses are publicly readable" on public.courses
  for select using (true);
create policy "Admins can modify courses" on public.courses
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Progress: users can only read/write their own progress
create policy "Users manage own progress" on public.user_progress
  for all using (auth.uid() = user_id);

-- Enrollments: users can view/create their own enrollments
create policy "Users manage own enrollments" on public.enrollments
  for all using (auth.uid() = user_id);

-- Certificates: users can view their own certificates
create policy "Users view own certificates" on public.certificates
  for select using (auth.uid() = user_id);

-- ============================================
-- Trigger: auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'student');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
