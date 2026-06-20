-- ============================================================
-- Snapcost — схема бази даних (Етап 1: рахунки + транзакції)
-- Запускати в Supabase → SQL Editor → New query → Run
-- ============================================================

-- ---------- accounts (рахунки: готівка, картка...) ----------
create table if not exists public.accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz default now(),
  name            text not null,              -- "Готівка", "Картка"...
  type            text default 'cash',        -- cash | card | bank | savings
  currency        text default 'PLN',         -- валюта рахунку (home)
  opening_balance numeric(12,2) default 0,    -- стартовий баланс
  icon            text,                        -- емоджі/назва іконки (необов'язково)
  color           text                         -- акцент картки (необов'язково)
);

-- ---------- transactions (доходи / витрати / перекази) ----------
create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  account_id    uuid references public.accounts(id) on delete set null,
  created_at    timestamptz default now(),
  tx_date       date not null default current_date,  -- дата транзакції
  type          text not null default 'expense'      -- expense | income | transfer
                  check (type in ('expense','income','transfer')),
  amount_home   numeric(12,2) not null,    -- сума у валюті рахунку
  home_currency text not null,             -- напр. 'PLN'
  amount_base   numeric(12,2),             -- конвертована сума
  base_currency text,                      -- напр. 'USD'
  exchange_rate numeric(14,6),             -- курс base за 1 home на момент запису
  category      text,                      -- їжа, кафе, транспорт, зарплата...
  merchant      text,                      -- магазин / джерело доходу
  note          text,
  image_url     text,                      -- фото чека (Supabase Storage)
  is_confirmed  boolean default true,      -- AI-скан = false доки юзер не підтвердить
  transfer_to_account_id uuid references public.accounts(id) on delete set null
);

create index if not exists tx_user_date_idx on public.transactions (user_id, tx_date desc);
create index if not exists tx_account_idx   on public.transactions (account_id);

-- ---------- user_settings (налаштування) ----------
create table if not exists public.user_settings (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  base_currency  text default 'USD',   -- валюта обліку
  home_currency  text default 'PLN',   -- основна валюта чеків
  monthly_budget numeric(12,2)
);

-- ============================================================
-- Row Level Security — кожен бачить ТІЛЬКИ свої дані
-- ============================================================
alter table public.accounts      enable row level security;
alter table public.transactions  enable row level security;
alter table public.user_settings enable row level security;

-- (drop+create = скрипт можна запускати повторно без помилок)
drop policy if exists "accounts_select_own" on public.accounts;
drop policy if exists "accounts_insert_own" on public.accounts;
drop policy if exists "accounts_update_own" on public.accounts;
drop policy if exists "accounts_delete_own" on public.accounts;
create policy "accounts_select_own" on public.accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on public.accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on public.accounts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "accounts_delete_own" on public.accounts for delete using (auth.uid() = user_id);

drop policy if exists "tx_select_own" on public.transactions;
drop policy if exists "tx_insert_own" on public.transactions;
drop policy if exists "tx_update_own" on public.transactions;
drop policy if exists "tx_delete_own" on public.transactions;
create policy "tx_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "tx_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "tx_update_own" on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tx_delete_own" on public.transactions for delete using (auth.uid() = user_id);

drop policy if exists "settings_select_own" on public.user_settings;
drop policy if exists "settings_insert_own" on public.user_settings;
drop policy if exists "settings_update_own" on public.user_settings;
create policy "settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
