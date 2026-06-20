# Receipt Tracker — Архітектура застосунку

## Що це і для кого

Веб-застосунок для людей, які живуть в одній країні але рахують гроші в іншій валюті. Фотографуєш чек — він сам витягує суму, конвертує в твою валюту за актуальним курсом, і записує в категорію. В кінці місяця бачиш де гроші йдуть.

**Цільовий юзер:** людина в Польщі з зарплатою в USD/EUR, яка хоче бачити витрати в "своїй" валюті без ручного перерахунку.

> **Валютна модель:** гнучка. Юзер задає `home_currency` (валюта чеків, напр. PLN) і `base_currency` (валюта обліку, напр. USD або EUR). Жодних захардкоджених валют у схемі.

---

## Стек

| Шар | Технологія | Навіщо |
|-----|-----------|--------|
| Фронтенд | Next.js (React) | Один репозиторій, легко деплоїти на Vercel |
| База даних | Supabase (PostgreSQL) | Безкоштовний tier, авторизація вбудована |
| AI / OCR | Claude API (claude-sonnet-4-6) | Витягує дані з фото чека |
| Курси валют | ExchangeRate-API (безкоштовно) | Актуальний курс home→base |
| Хостинг | Vercel | Безкоштовно, автодеплой з GitHub |
| Авторизація | Supabase Auth (Google OAuth) | Просто, не треба писати логін вручну |

---

## Структура проекту

```
receipt-tracker/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   └── login/page.tsx      # Сторінка входу
│   ├── (app)/
│   │   ├── layout.tsx          # Загальний лейаут з навігацією
│   │   ├── dashboard/page.tsx  # Головна — графіки і підсумок
│   │   ├── upload/page.tsx     # Завантаження фото чека
│   │   └── history/page.tsx    # Список всіх витрат
│   └── api/
│       ├── parse-receipt/      # POST — отримує фото, повертає дані (тільки для авторизованих)
│       └── exchange-rate/      # GET — актуальний курс
├── components/
│   ├── ui/                     # Базові елементи (кнопка, інпут, картка)
│   ├── receipt/
│   │   ├── UploadZone.tsx      # Drag & drop або камера
│   │   ├── ParsedPreview.tsx   # Показує що витягнув AI — юзер підтверджує
│   │   └── ReceiptCard.tsx     # Одна витрата в списку
│   └── dashboard/
│       ├── SpendingChart.tsx   # Графік по категоріях
│       ├── MonthSummary.tsx    # Підсумок місяця
│       └── CurrencyToggle.tsx  # Перемикач home ↔ base
├── lib/
│   ├── supabase.ts             # Клієнт Supabase
│   ├── claude.ts               # Функція виклику Claude API (ТІЛЬКИ серверна)
│   ├── exchange.ts             # Функція отримання курсу
│   └── categories.ts           # Список категорій (константа) + валідатор
└── types/
    └── index.ts                # TypeScript типи для всього
```

---

## База даних (Supabase)

### Таблиця `receipts`
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id        uuid REFERENCES auth.users(id)
created_at     timestamp DEFAULT now()
receipt_date   date                        -- дата з чека
store_name     text                        -- назва магазину
total_home     numeric(10,2)               -- сума у валюті чека (напр. PLN)
home_currency  text                        -- валюта чека на момент запису (напр. 'PLN')
total_base     numeric(10,2)               -- сума у валюті обліку (конвертована)
base_currency  text                        -- валюта обліку на момент запису (напр. 'USD')
exchange_rate  numeric(12,6)               -- курс base за 1 home на момент запису
category       text                        -- їжа, транспорт, розваги...
image_url      text                        -- посилання на фото в Supabase Storage
notes          text                        -- нотатка юзера (необов'язково)
is_confirmed   boolean DEFAULT false       -- юзер підтвердив дані після AI
```

> **Чому валюти дублюються в кожному рядку:** курс і валюти зберігаються історично разом із чеком. Якщо юзер потім змінить `base_currency` у налаштуваннях — старі записи лишаються правильними.

### Таблиця `user_settings`
```sql
user_id           uuid REFERENCES auth.users(id) PRIMARY KEY
base_currency     text DEFAULT 'USD'      -- в яку валюту конвертувати (валюта обліку)
home_currency     text DEFAULT 'PLN'      -- валюта чеків
monthly_budget    numeric(10,2)           -- ліміт на місяць (необов'язково)
```

---

## Потік даних — як все працює

```
Юзер фотографує чек
        ↓
UploadZone.tsx — тримає фото в пам'яті (base64), у Storage поки НЕ вантажить
        ↓
POST /api/parse-receipt   (ендпоінт перевіряє сесію Supabase)
  → Claude API отримує base64 зображення
  → Повертає JSON: { store_name, receipt_date, total, category }
  → Паралельно GET /api/exchange-rate → актуальний курс (base за 1 home)
  → Рахує total_base = total_home * exchange_rate
        ↓
ParsedPreview.tsx — показує результат юзеру
  → Юзер перевіряє, може виправити категорію або суму
  → Натискає "Зберегти"
        ↓
Тепер (і тільки тепер) фото вантажиться в Supabase Storage
        ↓
Валідація категорії (∈ список, інакше → "інше")
        ↓
INSERT в таблицю receipts (Supabase)
        ↓
Редірект на dashboard або history
```

> **Напрямок курсу — зафіксовано:** `exchange_rate` = скільки одиниць **base** за 1 одиницю **home**.
> Приклад: 1 PLN = 0.25 USD → `exchange_rate = 0.25`, `total_base = total_home * 0.25`.
> ExchangeRate-API віддає курси відносно бази запиту — переконайся, що береш саме `rates[base] / rates[home]` або робиш запит із `home` як базою. Завжди перевір на одному прикладі вручну.

---

## Claude API — промпт для парсингу чека

```typescript
// lib/claude.ts — ВИКЛИКАЄТЬСЯ ТІЛЬКИ НА СЕРВЕРІ (в app/api/parse-receipt/route.ts)
// Ключ ANTHROPIC_API_KEY ніколи не потрапляє в браузер.

import { ALLOWED_CATEGORIES } from "./categories";

export async function parseReceipt(imageBase64: string) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,   // ← обов'язково, інакше 401
      "anthropic-version": "2023-06-01"              // ← обов'язково
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: "image/jpeg", data: imageBase64 }
          },
          {
            type: "text",
            text: `Це фото чека. Витягни дані і поверни ТІЛЬКИ JSON без жодного тексту навколо:
{
  "store_name": "назва магазину або null",
  "receipt_date": "YYYY-MM-DD або null",
  "total": число (тільки фінальна сума до сплати),
  "category": одне з ["їжа", "транспорт", "кафе", "аптека", "одяг", "розваги", "комунальні", "інше"]
}
Якщо не можеш прочитати — поверни null для того поля.`
          }
        ]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.content[0].text;

  // Надійний парсинг: Claude може обернути JSON у ```json ... ``` або додати текст.
  return extractJson(raw);
}

// Витягує перший JSON-обʼєкт із відповіді, навіть якщо навколо є зайвий текст.
function extractJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("У відповіді немає JSON");
  return JSON.parse(match[0]);
}
```

---

## Ключові принципи щоб нічого не ламалось

### 1. Кожна функція робить одну річ
- `parseReceipt()` — тільки парсить, нічого не зберігає
- `getExchangeRate()` — тільки повертає курс
- `saveReceipt()` — тільки записує в базу
- Якщо щось зламається — ламається тільки одна функція, решта працює

### 2. Юзер завжди підтверджує дані AI
- Claude витягнув дані → показуємо юзеру → юзер натискає "Зберегти"
- Ніколи не зберігаємо автоматично без підтвердження
- Це захищає від помилок OCR

### 3. Обробка помилок скрізь
```typescript
// Завжди так — не покладайся що API відповість ідеально
try {
  const parsed = await parseReceipt(imageBase64);
  setReceiptData(parsed);
} catch (error) {
  setError("Не вдалося прочитати чек. Спробуй ще раз або введи вручну.");
}
```

### 4. Fallback — введення вручну
- Якщо Claude не зміг прочитати чек → форма для ручного введення
- Це важливо бо польські чеки бувають криві

### 5. Row Level Security в Supabase
```sql
-- Юзер бачить ТІЛЬКИ свої дані
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_data" ON receipts
  USING (auth.uid() = user_id);
```

### 6. Захист ендпоінта parse-receipt (не тільки бази)
- RLS захищає базу, але **не** твій API-роут, який витрачає гроші на Claude.
- На вході в `POST /api/parse-receipt` перевіряй сесію Supabase — анонімний запит → 401.
- Додай простий rate limit (напр. N запитів/хв на user_id), щоб ніхто не палив твій бюджет.

```typescript
// app/api/parse-receipt/route.ts (ескіз)
const { data: { user } } = await supabase.auth.getUser();
if (!user) return new Response("Unauthorized", { status: 401 });
// ... далі rate limit, потім parseReceipt()
```

### 7. Валідація категорії від AI
- Claude може повернути категорію не зі списку → перед INSERT приводимо до дозволеної.

```typescript
// lib/categories.ts
export const ALLOWED_CATEGORIES = [
  "їжа", "транспорт", "кафе", "аптека", "одяг", "розваги", "комунальні", "інше"
] as const;

export function normalizeCategory(c: string | null): string {
  return ALLOWED_CATEGORIES.includes(c as any) ? (c as string) : "інше";
}
```

---

## Сторінки застосунку

### `/login`
- Кнопка "Увійти через Google"
- Більше нічого — просто і чисто

### `/dashboard` (головна)
- Підсумок поточного місяця: витрачено X home = Y base
- Донат-чарт по категоріях
- Якщо є бюджет — прогрес-бар "витрачено / ліміт"
- Кнопка "+ Додати чек" — завжди видима

### `/upload`
- Велика зона для drag & drop або кнопка "Зробити фото" (на мобільному)
- Після завантаження → спінер → ParsedPreview
- ParsedPreview: картка з даними від AI + можливість виправити + кнопка "Зберегти"

### `/history`
- Список витрат по місяцях
- Фільтр по категорії
- Кожен рядок: дата, магазин, сума в home і base, категорія

---

## План на тиждень

| День | Що робити |
|------|-----------|
| 1 | Створити репозиторій, налаштувати Next.js + Supabase + Vercel, зробити авторизацію через Google |
| 2 | Таблиці в базі (з RLS), базовий лейаут, сторінка `/upload` з drag & drop |
| 3 | Серверний роут `/api/parse-receipt` з auth-перевіркою + інтеграція Claude API, показ результату |
| 4 | Інтеграція ExchangeRate API, валідація категорії, збереження в Supabase, сторінка `/history` |
| 5 | Dashboard з графіками (recharts або chart.js) |
| 6 | Мобільна версія, обробка помилок, fallback ручне введення |
| 7 | Тести на реальних чеках, фіксація багів, деплой |

---

## Змінні середовища (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # тільки на сервері, для перевірки сесії в API
ANTHROPIC_API_KEY=
EXCHANGE_RATE_API_KEY=
```

> ⚠️ `ANTHROPIC_API_KEY` і `SUPABASE_SERVICE_ROLE_KEY` — тільки на сервері (без `NEXT_PUBLIC_`), ніколи не в браузері.

---

## Що НЕ робити в першій версії

- Немає сповіщень і алертів (другий етап)
- Немає експорту в Excel
- Валютна модель гнучка (home → base), але в UI поки даємо вибір з кількох валют, не повний довідник усіх світових
- Немає соціальних функцій
- Немає темної теми

Зроби просте і робоче — потім додаси.
