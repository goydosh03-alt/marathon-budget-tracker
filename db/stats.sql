-- ============================================================
-- Snapcost — статистика по всіх користувачах
-- Запускати в Supabase → SQL Editor. Там запити йдуть від ролі
-- postgres, тому RLS не заважає (у застосунку він лишається).
--
-- ВАЖЛИВО про суми: amount_home записана у ВАЛЮТІ РАХУНКУ.
-- Складати їх без огляду на валюту не можна — 100 zł і 100 ₴ це
-- різні гроші. Тому всюди або group by валютою, або amount_base.
-- ============================================================


-- ---------- 1. Скільки взагалі користувачів ----------
select
  count(*)                                                as "усього",
  count(*) filter (where created_at > now() - interval '7 days')  as "за 7 днів",
  count(*) filter (where created_at > now() - interval '30 days') as "за 30 днів",
  count(*) filter (where last_sign_in_at > now() - interval '30 days') as "заходили за 30 днів"
from auth.users;


-- ---------- 2. Реєстрації по днях ----------
select date_trunc('day', created_at)::date as день, count(*) as реєстрацій
from auth.users
group by 1
order by 1 desc
limit 60;


-- ---------- 3. Скільки з них реально користуються ----------
-- Класична воронка: зареєструвався -> записав хоч одну -> записав 10+
with t as (
  select user_id, count(*) as n from public.transactions group by 1
)
select
  (select count(*) from auth.users)                          as "зареєстровані",
  count(*)                                                    as "записали хоч раз",
  count(*) filter (where n >= 10)                             as "записали 10+",
  round(avg(n), 1)                                            as "у середньому записів",
  percentile_cont(0.5) within group (order by n)              as "медіана записів"
from t;


-- ---------- 4. Скільки грошей записано, по валютах ----------
select
  home_currency                                        as валюта,
  type                                                 as тип,
  count(*)                                             as записів,
  sum(amount_home)                                     as сума,
  round(avg(amount_home), 2)                           as "середній чек"
from public.transactions
group by 1, 2
order by 1, 2;


-- ---------- 5. Те саме за останні 30 днів ----------
select
  home_currency as валюта,
  sum(amount_home) filter (where type = 'expense') as витрати,
  sum(amount_home) filter (where type = 'income')  as доходи,
  count(*)                                          as записів
from public.transactions
where tx_date > current_date - 30
group by 1
order by 3 desc;


-- ---------- 6. Найпопулярніші категорії ----------
select
  category                                          as категорія,
  count(*)                                          as записів,
  count(distinct user_id)                           as "скільки людей юзає"
from public.transactions
where type = 'expense' and category is not null
group by 1
order by 2 desc
limit 20;


-- ---------- 7. Активність по днях ----------
select
  tx_date                        as день,
  count(*)                       as записів,
  count(distinct user_id)        as "активних людей"
from public.transactions
where tx_date > current_date - 30
group by 1
order by 1 desc;


-- ---------- 8. Скільки хто користується сканом чеків ----------
select
  count(*) filter (where image_url is not null)     as "зі сканом",
  count(*) filter (where image_url is null)         as "вручну",
  count(distinct user_id) filter (where image_url is not null) as "людей юзали скан"
from public.transactions;


-- ---------- 9. Розподіл валют серед користувачів ----------
select home_currency as "основна валюта", base_currency as "валюта обліку", count(*) as людей
from public.user_settings
group by 1, 2
order by 3 desc;


-- ============================================================
-- Одним рядком — коротка зведена картка
-- ============================================================
select
  (select count(*) from auth.users)                                        as користувачів,
  (select count(*) from public.transactions)                               as транзакцій,
  (select count(distinct user_id) from public.transactions)                as "хто щось записав",
  (select count(distinct user_id) from public.transactions
     where tx_date > current_date - 7)                                     as "активні за 7 днів",
  (select count(*) from public.accounts)                                   as рахунків;
