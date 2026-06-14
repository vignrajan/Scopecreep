-- ============================================================
-- Migration 0001 — per-project change-order numbers (CO #1, #2…)
-- Run this once against an EXISTING ScopeLock database. New installs
-- already get this from schema.sql. Safe to re-run (idempotent).
-- ============================================================

alter table public.change_orders
  add column if not exists co_number integer;

-- Backfill existing rows: number each project's change orders by creation order.
with numbered as (
  select id,
         row_number() over (partition by project_id order by created_at, id) as rn
  from public.change_orders
)
update public.change_orders c
set co_number = n.rn
from numbered n
where c.id = n.id
  and c.co_number is null;

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
