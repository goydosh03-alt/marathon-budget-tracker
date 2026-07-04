"use client";

// Політика конфіденційності — ПУБЛІЧНА сторінка (без логіну).
// Потрібна для App Store, Google Play та Google OAuth verification.
// Мова: автовизначення з браузера + ручний перемикач.

import { useState, useEffect } from "react";
import type { Lang } from "@/lib/i18n";

const UPDATED = "2026-07-04";

type Section = { h: string; p: string[] };
type Doc = { title: string; updated: string; back: string; sections: Section[] };

const DOCS: Record<Lang, Doc> = {
  uk: {
    title: "Політика конфіденційності",
    updated: "Оновлено",
    back: "Назад",
    sections: [
      {
        h: "Хто ми",
        p: [
          "Snapcost — застосунок для обліку особистих витрат за фото чеків. Розробник: Sandor Gajdos. Контакт: goydosh03@gmail.com.",
        ],
      },
      {
        h: "Які дані ми збираємо",
        p: [
          "Дані акаунта: електронна пошта та імʼя (з входу через Google або пошту).",
          "Фінансові записи, які ти вводиш сам: транзакції, рахунки, категорії, бюджет, регулярні платежі, нагадування.",
          "Налаштування: валюта, мова, параметри відображення.",
          "Фото чеків: обробляються лише для розпізнавання позицій і суми та не зберігаються на наших серверах.",
          "Push-підписки: технічні дані для доставки сповіщень, якщо ти їх увімкнув.",
        ],
      },
      {
        h: "Як ми використовуємо дані",
        p: [
          "Виключно для роботи застосунку: показ твоєї статистики, синхронізація між пристроями, нагадування.",
          "Ми не продаємо дані, не показуємо рекламу та не передаємо дані третім особам для маркетингу.",
        ],
      },
      {
        h: "Сервіси, які ми використовуємо",
        p: [
          "Supabase — база даних та автентифікація.",
          "Google — вхід у застосунок (за твоїм вибором).",
          "Anthropic Claude API — розпізнавання фото чеків.",
          "Vercel — хостинг застосунку.",
          "Відкритий сервіс курсів валют — для конвертації (без передачі особистих даних).",
        ],
      },
      {
        h: "Видалення даних",
        p: [
          "У застосунку: Меню → Профіль → Видалити акаунт — це безповоротно стирає всі твої дані.",
          "Або напиши на goydosh03@gmail.com — видалимо вручну.",
        ],
      },
      {
        h: "Зміни цієї політики",
        p: [
          "Якщо політика зміниться, ми оновимо цю сторінку та дату вгорі.",
        ],
      },
    ],
  },
  en: {
    title: "Privacy Policy",
    updated: "Updated",
    back: "Back",
    sections: [
      {
        h: "Who we are",
        p: [
          "Snapcost is a personal expense tracker that reads receipts from photos. Developer: Sandor Gajdos. Contact: goydosh03@gmail.com.",
        ],
      },
      {
        h: "What data we collect",
        p: [
          "Account data: email address and name (from Google or email sign-in).",
          "Financial records you enter yourself: transactions, accounts, categories, budget, recurring payments, reminders.",
          "Settings: currency, language, display preferences.",
          "Receipt photos: processed only to recognize items and totals; they are not stored on our servers.",
          "Push subscriptions: technical data needed to deliver notifications, if you enable them.",
        ],
      },
      {
        h: "How we use your data",
        p: [
          "Solely to make the app work: showing your statistics, syncing across devices, reminders.",
          "We do not sell your data, show ads, or share your data with third parties for marketing.",
        ],
      },
      {
        h: "Services we rely on",
        p: [
          "Supabase — database and authentication.",
          "Google — sign-in (if you choose it).",
          "Anthropic Claude API — receipt photo recognition.",
          "Vercel — app hosting.",
          "A public exchange-rate service — for currency conversion (no personal data is sent).",
        ],
      },
      {
        h: "Deleting your data",
        p: [
          "In the app: Menu → Profile → Delete account — this permanently erases all your data.",
          "Or email goydosh03@gmail.com and we will delete it manually.",
        ],
      },
      {
        h: "Changes to this policy",
        p: [
          "If this policy changes, we will update this page and the date above.",
        ],
      },
    ],
  },
  ru: {
    title: "Политика конфиденциальности",
    updated: "Обновлено",
    back: "Назад",
    sections: [
      {
        h: "Кто мы",
        p: [
          "Snapcost — приложение для учёта личных расходов по фото чеков. Разработчик: Sandor Gajdos. Контакт: goydosh03@gmail.com.",
        ],
      },
      {
        h: "Какие данные мы собираем",
        p: [
          "Данные аккаунта: электронная почта и имя (из входа через Google или почту).",
          "Финансовые записи, которые ты вводишь сам: транзакции, счета, категории, бюджет, регулярные платежи, напоминания.",
          "Настройки: валюта, язык, параметры отображения.",
          "Фото чеков: обрабатываются только для распознавания позиций и суммы и не хранятся на наших серверах.",
          "Push-подписки: технические данные для доставки уведомлений, если ты их включил.",
        ],
      },
      {
        h: "Как мы используем данные",
        p: [
          "Исключительно для работы приложения: показ твоей статистики, синхронизация между устройствами, напоминания.",
          "Мы не продаём данные, не показываем рекламу и не передаём данные третьим лицам для маркетинга.",
        ],
      },
      {
        h: "Сервисы, которые мы используем",
        p: [
          "Supabase — база данных и аутентификация.",
          "Google — вход в приложение (по твоему выбору).",
          "Anthropic Claude API — распознавание фото чеков.",
          "Vercel — хостинг приложения.",
          "Открытый сервис курсов валют — для конвертации (без передачи личных данных).",
        ],
      },
      {
        h: "Удаление данных",
        p: [
          "В приложении: Меню → Профиль → Удалить аккаунт — это безвозвратно стирает все твои данные.",
          "Или напиши на goydosh03@gmail.com — удалим вручную.",
        ],
      },
      {
        h: "Изменения этой политики",
        p: [
          "Если политика изменится, мы обновим эту страницу и дату вверху.",
        ],
      },
    ],
  },
};

const LANG_CHIPS: { code: Lang; label: string }[] = [
  { code: "uk", label: "Укр" },
  { code: "en", label: "En" },
  { code: "ru", label: "Ру" },
];

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("uk")) setLang("uk");
    else if (nav.startsWith("ru")) setLang("ru");
    else setLang("en");
  }, []);

  const doc = DOCS[lang];

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px 48px", color: "rgba(255,255,255,0.92)", lineHeight: 1.6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <button
          onClick={() => history.back()}
          style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 15, cursor: "pointer", padding: 0 }}
        >
          ‹ {doc.back}
        </button>
        <div style={{ display: "flex", gap: 6 }}>
          {LANG_CHIPS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              style={{
                background: lang === l.code ? "rgba(124,92,255,0.28)" : "rgba(255,255,255,0.07)",
                border: "1px solid " + (lang === l.code ? "rgba(124,92,255,0.6)" : "transparent"),
                color: "#fff",
                borderRadius: 999,
                padding: "4px 12px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <h1 style={{ fontSize: 26, margin: "16px 0 4px" }}>{doc.title}</h1>
      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 0 }}>
        Snapcost · {doc.updated}: {UPDATED}
      </p>

      {doc.sections.map((s) => (
        <section key={s.h} style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 17, marginBottom: 8 }}>{s.h}</h2>
          {s.p.map((para, i) => (
            <p key={i} style={{ margin: "6px 0", color: "rgba(255,255,255,0.78)", fontSize: 15 }}>
              {para}
            </p>
          ))}
        </section>
      ))}
    </main>
  );
}
