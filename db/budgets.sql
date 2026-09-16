-- ============================================================
-- Snapcost — таблиця бюджетів (фіча «Бюджет», модель DIME)
-- Запусти ОДИН раз у Supabase → SQL Editor → New query → Run.
-- Скрипт безпечно перезапускати (if not exists / drop+create policy).
-- ============================================================

create table if not exists public.budgets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  type       text not null default 'overall'
               check (type in ('overall','category')),  -- загальний | по категорії
  category   text,                                        -- для type='category'
  period     text not null default 'month'
               check (period in ('day','week','month')),  -- день | тиждень | місяць
  start_ref  int,   -- week: 1..7 (Пн..Нд); month: 1..28 (число); day: null
  amount     numeric(12,2) not null                       -- сума бюджету на період
);

create index if not exists budgets_user_idx on public.budgets (user_id, created_at desc);

-- ---------- Row Level Security: кожен бачить ТІЛЬКИ свої бюджети ----------
alter table public.budgets enable row level security;

drop policy if exists "budgets_select_own" on public.budgets;
drop policy if exists "budgets_insert_own" on public.budgets;
drop policy if exists "budgets_update_own" on public.budgets;
drop policy if exists "budgets_delete_own" on public.budgets;

create policy "budgets_select_own" on public.budgets for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets for delete using (auth.uid() = user_id);
