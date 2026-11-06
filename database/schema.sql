
-- KONVEKSIBOS DATABASE
-- Initial schema v1

create extension if not exists pgcrypto;

-- 1. USER PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz default now()
);

-- 2. ROOMS
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'active'
    check (status in ('active', 'suspended')),
  created_at timestamptz default now()
);

-- 3. ROOM MEMBERS
create table public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'worker'
    check (role in ('owner', 'admin', 'gudang', 'worker')),
  created_at timestamptz default now(),
  unique(room_id, user_id)
);

-- 4. WORKERS
create table public.workers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  job_type text,
  phone text,
  tariff numeric(14,2) default 0,
  created_at timestamptz default now()
);

-- 5. JOBS
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  quantity integer not null default 0,
  returned integer not null default 0,
  status text not null default 'aktif',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. PAYROLL
create table public.payroll (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  worker_id uuid references public.workers(id) on delete set null,
  job_id uuid references public.jobs(id) on delete set null,
  amount numeric(14,2) not null default 0,
  quantity integer not null default 0,
  status text not null default 'unpaid'
    check (status in ('unpaid', 'paid')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- 7. ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.workers enable row level security;
alter table public.jobs enable row level security;
alter table public.payroll enable row level security;

-- Membership helper
create or replace function public.is_room_member(target_room uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.room_members
    where room_id = target_room
      and user_id = (select auth.uid())
  );
$$;

-- Profiles
create policy "Users read own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "Users insert own profile"
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

create policy "Users update own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- Rooms
create policy "Members read rooms"
on public.rooms for select
to authenticated
using (public.is_room_member(id));

create policy "Owners create rooms"
on public.rooms for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy "Owners update rooms"
on public.rooms for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

-- Room members
create policy "Members read membership"
on public.room_members for select
to authenticated
using (public.is_room_member(room_id));

create policy "Owners add members"
on public.room_members for insert
to authenticated
with check (
  exists (
    select 1 from public.rooms
    where id = room_id and owner_id = (select auth.uid())
  )
  or user_id = (select auth.uid())
);

-- Workers
create policy "Members read workers"
on public.workers for select
to authenticated
using (public.is_room_member(room_id));

create policy "Members manage workers"
on public.workers for all
to authenticated
using (public.is_room_member(room_id))
with check (public.is_room_member(room_id));

-- Jobs
create policy "Members read jobs"
on public.jobs for select
to authenticated
using (public.is_room_member(room_id));

create policy "Members manage jobs"
on public.jobs for all
to authenticated
using (public.is_room_member(room_id))
with check (public.is_room_member(room_id));

-- Payroll
create policy "Members read payroll"
on public.payroll for select
to authenticated
using (public.is_room_member(room_id));

create policy "Members manage payroll"
on public.payroll for all
to authenticated
using (public.is_room_member(room_id))
with check (public.is_room_member(room_id));

-- Performance indexes
create index workers_room_idx on public.workers(room_id);
create index jobs_room_idx on public.jobs(room_id);
create index payroll_room_idx on public.payroll(room_id);
create index room_members_user_idx on public.room_members(user_id);
