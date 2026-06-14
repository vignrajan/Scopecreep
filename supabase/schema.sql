-- ============================================================
-- ScopeLock — Supabase schema
-- Run this in the Supabase SQL editor (or via the CLI) on a fresh project.
-- It is idempotent-ish: safe to re-run, but dropping is left to you.
-- ============================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ─── users ──────────────────────────────────────────────────
-- 1:1 with auth.users. A trigger (below) inserts the row on signup.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  hourly_rate numeric not null default 100,
  currency text not null default 'USD',
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  ls_customer_id text,
  ls_subscription_id text,
  ls_variant_id text,
  created_at timestamptz not null default now()
);

-- ─── projects ───────────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  client_name text,
  client_email text,
  original_scope text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  public_token text unique not null,
  client_update text,                       -- optional message shown on the public client page
  total_approved_extras numeric not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists projects_user_id_idx on public.projects (user_id);

-- ─── scope_requests ─────────────────────────────────────────
create table if not exists public.scope_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  content text not null,
  source text not null default 'manual' check (source in ('manual', 'email_paste')),
  ai_verdict text check (ai_verdict in ('in_scope', 'out_of_scope', 'ambiguous')),
  ai_reasoning text,
  ai_estimated_hours numeric,
  status text not null default 'pending'
    check (status in ('pending', 'change_order_created', 'declined', 'accepted_free')),
  created_at timestamptz not null default now()
);
create index if not exists scope_requests_project_id_idx on public.scope_requests (project_id);

-- ─── change_orders ──────────────────────────────────────────
create table if not exists public.change_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  request_id uuid references public.scope_requests (id) on delete set null,
  co_number integer, -- per-project sequential number (CO #1, #2…); set by trigger
  title text not null,
  description text not null,
  hours numeric not null,
  rate numeric not null,
  total numeric generated always as (hours * rate) stored,
  status text not null default 'draft' check (status in ('draft', 'sent', 'signed', 'declined')),
  client_signed_at timestamptz,
  client_ip text,
  sign_token text unique,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists change_orders_project_id_idx on public.change_orders (project_id);
create index if not exists change_orders_sign_token_idx on public.change_orders (sign_token);

-- ============================================================
-- Trigger: assign a per-project sequential change-order number
-- (CO #1, #2, …) on insert. SECURITY DEFINER so the max() lookup
-- isn't constrained by RLS during the insert.
-- ============================================================
create or replace function public.set_change_order_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.co_number is null then
    select coalesce(max(co_number), 0) + 1
      into new.co_number
      from public.change_orders
      where project_id = new.project_id;
  end if;
  return new;
end;
$$;

drop trigger if exists change_orders_set_number on public.change_orders;
create trigger change_orders_set_number
  before insert on public.change_orders
  for each row execute function public.set_change_order_number();

-- ============================================================
-- Trigger: create a public.users row when an auth user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Trigger: keep projects.total_approved_extras in sync with the
-- sum of SIGNED change orders for that project.
-- ============================================================
create or replace function public.recalc_project_extras()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_project uuid;
begin
  target_project := coalesce(new.project_id, old.project_id);
  update public.projects p
  set total_approved_extras = coalesce((
    select sum(co.total)
    from public.change_orders co
    where co.project_id = target_project
      and co.status = 'signed'
  ), 0)
  where p.id = target_project;
  return null;
end;
$$;

drop trigger if exists change_orders_recalc_extras on public.change_orders;
create trigger change_orders_recalc_extras
  after insert or update or delete on public.change_orders
  for each row execute function public.recalc_project_extras();

-- ============================================================
-- Row Level Security
-- Users may only touch their own rows. Public/client-facing reads
-- and signing go through the SERVICE ROLE key (which bypasses RLS)
-- in trusted server code, gated by token validation — never the
-- anon client. So no public SELECT policies are granted here.
-- ============================================================
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.scope_requests enable row level security;
alter table public.change_orders enable row level security;

-- users
drop policy if exists "users self select" on public.users;
create policy "users self select" on public.users
  for select using (auth.uid() = id);
drop policy if exists "users self update" on public.users;
create policy "users self update" on public.users
  for update using (auth.uid() = id);
-- insert is handled by the security-definer trigger; no insert policy needed.

-- projects: owner-only full access
drop policy if exists "projects owner all" on public.projects;
create policy "projects owner all" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- scope_requests: access if you own the parent project
drop policy if exists "scope_requests owner all" on public.scope_requests;
create policy "scope_requests owner all" on public.scope_requests
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = scope_requests.project_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = scope_requests.project_id and p.user_id = auth.uid()
    )
  );

-- change_orders: access if you own the parent project
drop policy if exists "change_orders owner all" on public.change_orders;
create policy "change_orders owner all" on public.change_orders
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = change_orders.project_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = change_orders.project_id and p.user_id = auth.uid()
    )
  );
