// Легкий i18n без бібліотек: словник + translate(). Працює і на сервері (пряма
// функція), і на клієнті (через хук useT у SettingsProvider).

export type Lang = "uk" | "en" | "ru";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ru", label: "Русский", flag: "🌐" },
];

export const DEFAULT_LANG: Lang = "en";

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

  // спільне — типи/періоди
  "common.expenses": { uk: "Витрати", en: "Expenses", ru: "Расходы" },
  "common.income": { uk: "Дохід", en: "Income", ru: "Доход" },
  "common.period": { uk: "Період", en: "Period", ru: "Период" },
  "period.day": { uk: "День", en: "Day", ru: "День" },
  "period.week": { uk: "Тиждень", en: "Week", ru: "Неделя" },
  "period.month": { uk: "Місяць", en: "Month", ru: "Месяц" },
  "period.year": { uk: "Рік", en: "Year", ru: "Год" },
  "period.short.day": { uk: "сьогодні", en: "today", ru: "сегодня" },
  "period.short.week": { uk: "цей тиждень", en: "this week", ru: "эта неделя" },
  "period.short.month": { uk: "цей місяць", en: "this month", ru: "этот месяц" },
  "period.short.year": { uk: "цей рік", en: "this year", ru: "этот год" },

  // головна
  "dash.totalBalance": { uk: "Загальний баланс", en: "Total balance", ru: "Общий баланс" },
  "dash.spent": { uk: "Витрачено", en: "Spent", ru: "Потрачено" },
  "dash.earned": { uk: "Зароблено", en: "Earned", ru: "Заработано" },
  "dash.budgetPre": { uk: "з", en: "of", ru: "из" },
  "dash.budgetPost": { uk: "бюджету", en: "budget", ru: "бюджета" },
  "dash.recent": { uk: "Останні транзакції", en: "Recent transactions", ru: "Последние транзакции" },
  "dash.all": { uk: "Всі", en: "All", ru: "Все" },
  "dash.empty.exp": { uk: "Поки що порожньо", en: "Nothing yet", ru: "Пока пусто" },
  "dash.empty.inc": { uk: "Ще немає доходів", en: "No income yet", ru: "Доходов пока нет" },
  "dash.empty.expHint": { uk: "Додай першу витрату кнопкою + унизу або сканни чек", en: "Add your first expense with the + below, or scan a receipt", ru: "Добавь первый расход кнопкой + внизу или сканируй чек" },
  "dash.empty.incHint": { uk: "Додай дохід кнопкою + унизу", en: "Add income with the + below", ru: "Добавь доход кнопкой + внизу" },

  // історія
  "common.clear": { uk: "Очистити", en: "Clear", ru: "Очистить" },
  "hist.search": { uk: "Пошук: назва, категорія…", en: "Search: name, category…", ru: "Поиск: название, категория…" },
  "hist.found": { uk: "Знайдено", en: "Found", ru: "Найдено" },
  "hist.notFound": { uk: "Нічого не знайдено", en: "Nothing found", ru: "Ничего не найдено" },
  "hist.noTxFor": { uk: "Немає транзакцій за", en: "No transactions for", ru: "Нет транзакций по" },
  "hist.emptyPeriod": { uk: "Нічого за цей період", en: "Nothing for this period", ru: "Ничего за этот период" },
  "hist.emptyPeriodHint": { uk: "Інший період чи діапазон, або додай кнопкою + унизу.", en: "Try another period or range, or add with the + below.", ru: "Другой период или диапазон, или добавь кнопкой + внизу." },
  "hist.categories": { uk: "Категорії", en: "Categories", ru: "Категории" },

  // категорія (drilldown) + спільне
  "common.export": { uk: "Експорт", en: "Export", ru: "Экспорт" },
  "common.items": { uk: "Позиції", en: "Items", ru: "Позиции" },
  "cat.search": { uk: "Пошук по назві…", en: "Search by name…", ru: "Поиск по названию…" },
  "cat.sortDate": { uk: "За датою", en: "By date", ru: "По дате" },
  "cat.sortAmount": { uk: "За сумою", en: "By amount", ru: "По сумме" },
  "cat.tryAnother": { uk: "Спробуй інший запит.", en: "Try another query.", ru: "Попробуй другой запрос." },

  // деталі транзакції
  "common.expense": { uk: "Витрата", en: "Expense", ru: "Расход" },
  "common.edit": { uk: "Редагувати", en: "Edit", ru: "Изменить" },
  "det.category": { uk: "Категорія", en: "Category", ru: "Категория" },
  "det.date": { uk: "Дата", en: "Date", ru: "Дата" },
  "det.account": { uk: "Рахунок", en: "Account", ru: "Счёт" },
  "det.type": { uk: "Тип", en: "Type", ru: "Тип" },
  "det.note": { uk: "Нотатка", en: "Note", ru: "Заметка" },
  "det.items": { uk: "Позиції чека", en: "Receipt items", ru: "Позиции чека" },
  "det.receipt": { uk: "Чек", en: "Receipt", ru: "Чек" },

  // звіти + відносні дати
  "rel.today": { uk: "Сьогодні", en: "Today", ru: "Сегодня" },
  "rel.yesterday": { uk: "Вчора", en: "Yesterday", ru: "Вчера" },
  "rep.noData": { uk: "Немає даних", en: "No data", ru: "Нет данных" },
  "rep.noDataExp": { uk: "За цей період витрат немає.", en: "No expenses for this period.", ru: "Расходов за этот период нет." },
  "rep.noDataInc": { uk: "За цей період доходів немає.", en: "No income for this period.", ru: "Доходов за этот период нет." },
  "rep.donut": { uk: "Кругова", en: "Donut", ru: "Круговая" },
  "rep.bars": { uk: "Стовпчики", en: "Bars", ru: "Столбцы" },

  // форма додавання транзакції
  "common.undo": { uk: "Повернути", en: "Undo", ru: "Вернуть" },
  "common.saved": { uk: "Збережено", en: "Saved", ru: "Сохранено" },
  "common.added": { uk: "Додано", en: "Added", ru: "Добавлено" },
  "common.dayBefore": { uk: "Позавчора", en: "2 days ago", ru: "Позавчера" },
  "common.chosen": { uk: "Обрано", en: "Chosen", ru: "Выбрано" },
  "form.addTitle": { uk: "Додати транзакцію", en: "Add transaction", ru: "Добавить транзакцию" },
  "form.editTitle": { uk: "Редагувати транзакцію", en: "Edit transaction", ru: "Изменить транзакцию" },
  "form.scan": { uk: "Скан", en: "Scan", ru: "Скан" },
  "form.reading": { uk: "Читаю…", en: "Reading…", ru: "Читаю…" },
  "form.receiptItems": { uk: "Позиції з чека", en: "Receipt items", ru: "Позиции из чека" },
  "form.deleteItem": { uk: "Видалити позицію", en: "Delete item", ru: "Удалить позицию" },
  "form.pickDate": { uk: "Вибрати дату", en: "Pick a date", ru: "Выбрать дату" },
  "form.namePlaceholderInc": { uk: "Назва (напр. Зарплата)", en: "Name (e.g. Salary)", ru: "Название (напр. Зарплата)" },
  "form.namePlaceholderExp": { uk: "Назва (напр. магазин)", en: "Name (e.g. store)", ru: "Название (напр. магазин)" },
  "form.saving": { uk: "Зберігаю…", en: "Saving…", ru: "Сохраняю…" },
  "form.itemDeleted": { uk: "Позицію видалено", en: "Item deleted", ru: "Позиция удалена" },
  "form.errAmount": { uk: "Введи суму більше нуля", en: "Enter an amount above zero", ru: "Введи сумму больше нуля" },
  "form.errSave": { uk: "Помилка збереження", en: "Save error", ru: "Ошибка сохранения" },
  "form.errScan": { uk: "Не вдалося прочитати чек", en: "Couldn't read the receipt", ru: "Не удалось прочитать чек" },
  "form.errDelete": { uk: "Помилка видалення", en: "Delete error", ru: "Ошибка удаления" },
} satisfies Record<string, Entry>;

export type StringKey = keyof typeof STRINGS;

export function translate(key: StringKey, lang: Lang): string {
  const e = STRINGS[key];
  if (!e) return key;
  return e[lang] || e.uk;
}

// --- Дані: відомі дефолтні назви категорій/рахунків → переклад ---
// Кастомні (свої) назви лишаються як є.
const DATA_LABELS: Record<string, Entry> = {
  "Їжа": { uk: "Їжа", en: "Food", ru: "Еда" },
  "Кафе": { uk: "Кафе", en: "Cafe", ru: "Кафе" },
  "Транспорт": { uk: "Транспорт", en: "Transport", ru: "Транспорт" },
  "Розваги": { uk: "Розваги", en: "Fun", ru: "Развлечения" },
  "Аптека": { uk: "Аптека", en: "Pharmacy", ru: "Аптека" },
  "Одяг": { uk: "Одяг", en: "Clothes", ru: "Одежда" },
  "Комунальні": { uk: "Комунальні", en: "Utilities", ru: "Коммуналка" },
  "Інше": { uk: "Інше", en: "Other", ru: "Другое" },
  "Зарплата": { uk: "Зарплата", en: "Salary", ru: "Зарплата" },
  "Фриланс": { uk: "Фриланс", en: "Freelance", ru: "Фриланс" },
  "Подарунок": { uk: "Подарунок", en: "Gift", ru: "Подарок" },
  "Готівка": { uk: "Готівка", en: "Cash", ru: "Наличные" },
  "Картка": { uk: "Картка", en: "Card", ru: "Карта" },
  "Банк": { uk: "Банк", en: "Bank", ru: "Банк" },
  "Заощадження": { uk: "Заощадження", en: "Savings", ru: "Сбережения" },
};

export function dataLabel(name: string, lang: Lang): string {
  const e = DATA_LABELS[name];
  return e ? e[lang] || e.uk : name;
}

export const MONTHS_SHORT: Record<Lang, string[]> = {
  uk: ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ru: ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
};

// Родовий відмінок (для «12 січня»). EN — без відмінків (короткий).
export const MONTHS_GEN: Record<Lang, string[]> = {
  uk: ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
};

export const MONTHS_FULL: Record<Lang, string[]> = {
  uk: ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

export const WEEKDAYS_SHORT: Record<Lang, string[]> = {
  uk: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"],
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
  ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
};

const REL: Record<Lang, { today: string; yesterday: string }> = {
  uk: { today: "Сьогодні", yesterday: "Вчора" },
  en: { today: "Today", yesterday: "Yesterday" },
  ru: { today: "Сегодня", yesterday: "Вчера" },
};

export function fmtDateL(dateStr: string, createdAt: string | undefined, lang: Lang): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - date.getTime()) / 86400000);
  let label: string;
  if (diff === 0) label = REL[lang].today;
  else if (diff === 1) label = REL[lang].yesterday;
  else label = `${date.getDate()} ${MONTHS_SHORT[lang][date.getMonth()]}`;
  if (createdAt) {
    const t = new Date(createdAt);
    label += `, ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  }
  return label;
}

export function opsLabel(n: number, lang: Lang): string {
  if (lang === "en") return n === 1 ? "operation" : "operations";
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (lang === "ru") {
    if (a > 10 && a < 20) return "операций";
    if (b > 1 && b < 5) return "операции";
    if (b === 1) return "операция";
    return "операций";
  }
  if (a > 10 && a < 20) return "операцій";
  if (b > 1 && b < 5) return "операції";
  if (b === 1) return "операція";
  return "операцій";
}
