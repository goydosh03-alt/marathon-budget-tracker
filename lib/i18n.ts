// Легкий i18n без бібліотек: словник + translate(). Працює і на сервері (пряма
// функція), і на клієнті (через хук useT у SettingsProvider).

export type Lang = "uk" | "en" | "ru";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🌐" },
];

export const DEFAULT_LANG: Lang = "uk";

export function isLang(v: unknown): v is Lang {
  return v === "uk" || v === "en" || v === "ru";
}

type Entry = { uk: string; en: string; ru: string };

// Ключі згруповані за зоною. Додавай нові рядки сюди.
export const STRINGS = {
  // нижній навбар
  "nav.home": { uk: "Головна", en: "Home", ru: "Главная" },
  "nav.history": { uk: "Історія", en: "History", ru: "История" },
  "nav.reports": { uk: "Звіти", en: "Reports", ru: "Отчёты" },
  "nav.menu": { uk: "Меню", en: "Menu", ru: "Меню" },
  "nav.add": { uk: "Додати", en: "Add", ru: "Добавить" },

  // меню — розділи
  "menu.title": { uk: "Меню", en: "Menu", ru: "Меню" },
  "menu.group.manage": { uk: "Керування", en: "Management", ru: "Управление" },
  "menu.group.finance": { uk: "Фінанси", en: "Finance", ru: "Финансы" },
  "menu.group.automation": { uk: "Автоматизація", en: "Automation", ru: "Автоматизация" },
  "menu.group.app": { uk: "Застосунок", en: "App", ru: "Приложение" },

  // меню — пункти
  "menu.settings": { uk: "Налаштування", en: "Settings", ru: "Настройки" },
  "menu.settings.sub": { uk: "Рахунки та дані", en: "Accounts & data", ru: "Счета и данные" },
  "menu.categories": { uk: "Категорії", en: "Categories", ru: "Категории" },
  "menu.categories.sub": { uk: "Свої категорії витрат", en: "Your spending categories", ru: "Свои категории расходов" },
  "menu.currency": { uk: "Валюта", en: "Currency", ru: "Валюта" },
  "menu.export": { uk: "Експорт даних", en: "Export data", ru: "Экспорт данных" },
  "menu.export.sub": { uk: "CSV для Excel / Sheets", en: "CSV for Excel / Sheets", ru: "CSV для Excel / Sheets" },
  "menu.recurring": { uk: "Регулярні платежі", en: "Recurring payments", ru: "Регулярные платежи" },
  "menu.recurring.sub": { uk: "Підписки й щомісячні рахунки", en: "Subscriptions & monthly bills", ru: "Подписки и ежемесячные счета" },
  "menu.reminders": { uk: "Нагадування", en: "Reminders", ru: "Напоминания" },
  "menu.reminders.sub": { uk: "Не забути записати витрати", en: "Don't forget to log expenses", ru: "Не забыть записать расходы" },
  "menu.language": { uk: "Мова", en: "Language", ru: "Язык" },
  "menu.rate": { uk: "Оцінити застосунок", en: "Rate the app", ru: "Оценить приложение" },
  "menu.rate.sub": { uk: "Підтримати Snapcost", en: "Support Snapcost", ru: "Поддержать Snapcost" },
  "menu.hideCents": { uk: "Приховати копійки", en: "Hide cents", ru: "Скрыть копейки" },
  "menu.hideCents.on": { uk: "Без копійок", en: "No cents", ru: "Без копеек" },
  "menu.hideCents.off": { uk: "Показувати", en: "Show", ru: "Показывать" },
  "menu.mainCurrency": { uk: "Основна валюта", en: "Main currency", ru: "Основная валюта" },
  "menu.donate": { uk: "Підтримати автора", en: "Support the author", ru: "Поддержать автора" },
  "menu.donate.sub": { uk: "Безкоштовно, без реклами — на свій розсуд", en: "Free, no ads — as you wish", ru: "Бесплатно, без рекламы — на ваше усмотрение" },

  // спільні кнопки / дії
  "common.save": { uk: "Зберегти", en: "Save", ru: "Сохранить" },
  "common.cancel": { uk: "Скасувати", en: "Cancel", ru: "Отмена" },
  "common.delete": { uk: "Видалити", en: "Delete", ru: "Удалить" },
  "common.done": { uk: "Готово", en: "Done", ru: "Готово" },
  "common.close": { uk: "Закрити", en: "Close", ru: "Закрыть" },
  "common.add": { uk: "Додати", en: "Add", ru: "Добавить" },
  "common.apply": { uk: "Застосувати", en: "Apply", ru: "Применить" },
  "common.back": { uk: "Назад", en: "Back", ru: "Назад" },
  "common.soon": { uk: "СКОРО", en: "SOON", ru: "СКОРО" },

  // мова — екран вибору
  "lang.title": { uk: "Мова", en: "Language", ru: "Язык" },
  "lang.hint": { uk: "Оберіть мову інтерфейсу.", en: "Choose the interface language.", ru: "Выберите язык интерфейса." },
} satisfies Record<string, Entry>;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, lang: Lang): string {
  const e = STRINGS[key];
  if (!e) return key;
  return e[lang] || e.uk;
}
