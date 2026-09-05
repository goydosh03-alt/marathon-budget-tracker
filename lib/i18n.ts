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

  // спільне (нове)
  "common.error": { uk: "Помилка", en: "Error", ru: "Ошибка" },
  "common.create": { uk: "Створити", en: "Create", ru: "Создать" },
  "common.creating": { uk: "Створюю…", en: "Creating…", ru: "Создаю…" },
  "common.deleting": { uk: "Видаляю…", en: "Deleting…", ru: "Удаляю…" },
  "common.type": { uk: "Тип", en: "Type", ru: "Тип" },
  "common.incomes": { uk: "Доходи", en: "Income", ru: "Доходы" },
  "confirm.yes": { uk: "так", en: "yes", ru: "да" },
  "confirm.deleteWord": { uk: "видалити", en: "delete", ru: "удалить" },
  "confirm.typeWord": { uk: "Щоб підтвердити, напиши слово", en: "To confirm, type the word", ru: "Чтобы подтвердить, напиши слово" },

  // типи рахунків
  "acc.cash": { uk: "Готівка", en: "Cash", ru: "Наличные" },
  "acc.card": { uk: "Картка", en: "Card", ru: "Карта" },
  "acc.savings": { uk: "Заощадження", en: "Savings", ru: "Сбережения" },

  // налаштування
  "set.accounts": { uk: "Рахунки", en: "Accounts", ru: "Счета" },
  "set.addAccount": { uk: "Додати рахунок", en: "Add account", ru: "Добавить счёт" },
  "set.data": { uk: "Дані", en: "Data", ru: "Данные" },
  "set.total": { uk: "Усього транзакцій", en: "Total transactions", ru: "Всего транзакций" },
  "set.irreversible": { uk: "Видалення безповоротне.", en: "Deletion is permanent.", ru: "Удаление необратимо." },
  "set.deleteAll": { uk: "Видалити всі транзакції", en: "Delete all transactions", ru: "Удалить все транзакции" },
  "set.clearTitle": { uk: "Видалити всі транзакції?", en: "Delete all transactions?", ru: "Удалить все транзакции?" },
  "set.allWord": { uk: "Усі", en: "All", ru: "Все" },
  "set.clearBody": { uk: "транзакцій буде видалено безповоротно. Рахунки залишаться.", en: "transactions will be permanently deleted. Accounts will remain.", ru: "транзакций будет удалено безвозвратно. Счета останутся." },
  "set.newAccount": { uk: "Новий рахунок", en: "New account", ru: "Новый счёт" },
  "set.accNamePh": { uk: "Назва (напр. Картка mBank)", en: "Name (e.g. mBank card)", ru: "Название (напр. карта mBank)" },
  "set.delAccTitle": { uk: "Видалити рахунок?", en: "Delete account?", ru: "Удалить счёт?" },
  "set.delAccPre": { uk: "Рахунок", en: "The account", ru: "Счёт" },
  "set.delAccPost": { uk: "буде видалено. Транзакції залишаться, але без рахунку.", en: "will be deleted. Transactions will remain, but without an account.", ru: "будет удалён. Транзакции останутся, но без счёта." },

  // нагадування
  "rem.noticeTitle": { uk: "Зверни увагу:", en: "Note:", ru: "Обрати внимание:" },
  "rem.noticeBody": { uk: "сповіщення дзвонять лише коли Snapcost встановлений як застосунок (PWA) на телефоні. У браузері — лише як налаштування.", en: "notifications only ring when Snapcost is installed as an app (PWA) on your phone. In the browser it's just a setting.", ru: "уведомления звонят только когда Snapcost установлен как приложение (PWA) на телефоне. В браузере — только как настройка." },
  "rem.allow": { uk: "Дозволити сповіщення", en: "Allow notifications", ru: "Разрешить уведомления" },
  "rem.blocked": { uk: "Сповіщення заблоковані. Увімкни їх у налаштуваннях браузера/телефону.", en: "Notifications are blocked. Enable them in your browser/phone settings.", ru: "Уведомления заблокированы. Включи их в настройках браузера/телефона." },
  "rem.emptyTitle": { uk: "Ще немає нагадувань", en: "No reminders yet", ru: "Пока нет напоминаний" },
  "rem.emptyHint": { uk: "Додай нагадування, щоб не забувати записувати витрати.", en: "Add a reminder so you don't forget to log expenses.", ru: "Добавь напоминание, чтобы не забывать записывать расходы." },
  "rem.add": { uk: "Додати нагадування", en: "Add reminder", ru: "Добавить напоминание" },
  "rem.editTitle": { uk: "Редагувати нагадування", en: "Edit reminder", ru: "Изменить напоминание" },
  "rem.newTitle": { uk: "Нове нагадування", en: "New reminder", ru: "Новое напоминание" },
  "rem.namePh": { uk: "Назва (напр. Записати витрати)", en: "Name (e.g. Log expenses)", ru: "Название (напр. Записать расходы)" },
  "rem.time": { uk: "Час", en: "Time", ru: "Время" },
  "rem.freq": { uk: "Частота", en: "Frequency", ru: "Частота" },
  "freq.daily": { uk: "Щодня", en: "Daily", ru: "Ежедневно" },
  "freq.weekdays": { uk: "Будні", en: "Weekdays", ru: "Будни" },
  "freq.weekends": { uk: "Вихідні", en: "Weekends", ru: "Выходные" },
  "freq.weekly": { uk: "Щотижня", en: "Weekly", ru: "Еженедельно" },
  "freqL.daily": { uk: "Щодня", en: "Daily", ru: "Ежедневно" },
  "freqL.weekdays": { uk: "По буднях", en: "On weekdays", ru: "По будням" },
  "freqL.weekends": { uk: "У вихідні", en: "On weekends", ru: "По выходным" },
  "freqL.weekly": { uk: "Щотижня", en: "Weekly", ru: "Еженедельно" },
  "rem.enabled": { uk: "Увімкнено", en: "Enabled", ru: "Включено" },
  "rem.activeSub": { uk: "Нагадування активне", en: "Reminder is active", ru: "Напоминание активно" },
  "rem.offSub": { uk: "Вимкнено", en: "Off", ru: "Выключено" },
  "rem.notifOn": { uk: "Сповіщення увімкнено ✓", en: "Notifications enabled ✓", ru: "Уведомления включены ✓" },
  "rem.defaultName": { uk: "Записати витрати", en: "Log expenses", ru: "Записать расходы" },

  // регулярні платежі
  "rec.emptyTitle": { uk: "Ще немає регулярних", en: "No recurring yet", ru: "Пока нет регулярных" },
  "rec.emptyHint": { uk: "Додай підписку чи рахунок — додаватиметься сам щомісяця.", en: "Add a subscription or bill — it will be added automatically every month.", ru: "Добавь подписку или счёт — будет добавляться сам каждый месяц." },
  "rec.add": { uk: "Додати регулярний платіж", en: "Add recurring payment", ru: "Добавить регулярный платёж" },
  "rec.editTitle": { uk: "Редагувати платіж", en: "Edit payment", ru: "Изменить платёж" },
  "rec.newTitle": { uk: "Новий платіж", en: "New payment", ru: "Новый платёж" },
  "rec.namePh": { uk: "Назва (напр. Netflix)", en: "Name (e.g. Netflix)", ru: "Название (напр. Netflix)" },
  "rec.freqDay": { uk: "Частота · число", en: "Frequency · day", ru: "Частота · число" },
  "rec.monthly": { uk: "Щомісяця", en: "Monthly", ru: "Ежемесячно" },
  "rec.dayPre": { uk: "", en: "Day ", ru: "" },
  "rec.dayPost": { uk: "-го числа", en: " of the month", ru: "-го числа" },
  "rec.auto": { uk: "авто", en: "auto", ru: "авто" },
  "rec.autoAdd": { uk: "Додати автоматично", en: "Add automatically", ru: "Добавлять автоматически" },
  "rec.autoOn": { uk: "Транзакція створюється сама", en: "Transaction is created automatically", ru: "Транзакция создаётся сама" },
  "rec.autoOff": { uk: "Лише нагадування", en: "Reminder only", ru: "Только напоминание" },
  "rec.startDate": { uk: "Дата початку", en: "Start date", ru: "Дата начала" },

  // профіль
  "prof.title": { uk: "Профіль", en: "Profile", ru: "Профиль" },
  "prof.name": { uk: "Імʼя", en: "Name", ru: "Имя" },
  "prof.namePh": { uk: "Твоє імʼя", en: "Your name", ru: "Твоё имя" },
  "prof.account": { uk: "Акаунт", en: "Account", ru: "Аккаунт" },
  "prof.connected": { uk: "Підключено", en: "Connected", ru: "Подключено" },
  "prof.viaGoogle": { uk: "Вхід через Google", en: "Signed in with Google", ru: "Вход через Google" },
  "prof.viaApple": { uk: "Вхід через Apple", en: "Signed in with Apple", ru: "Вход через Apple" },
  "prof.viaEmail": { uk: "Вхід через пошту", en: "Signed in with email", ru: "Вход через почту" },
  "prof.signout": { uk: "Вийти з акаунта", en: "Sign out", ru: "Выйти из аккаунта" },
  "prof.danger": { uk: "Небезпечна зона", en: "Danger zone", ru: "Опасная зона" },
  "prof.deleteWarn": { uk: "Видалення акаунта стирає всі дані безповоротно.", en: "Deleting your account erases all data permanently.", ru: "Удаление аккаунта стирает все данные безвозвратно." },
  "prof.deleteBtn": { uk: "Видалити акаунт", en: "Delete account", ru: "Удалить аккаунт" },
  "prof.delTitle": { uk: "Видалити акаунт?", en: "Delete account?", ru: "Удалить аккаунт?" },
  "prof.delBody": { uk: "Усі транзакції, рахунки й категорії будуть видалені", en: "All transactions, accounts and categories will be deleted", ru: "Все транзакции, счета и категории будут удалены" },
  "prof.forever": { uk: "назавжди", en: "forever", ru: "навсегда" },
  "prof.friend": { uk: "Друже", en: "Friend", ru: "Друг" },

  // експорт
  "exp.what": { uk: "Що експортувати", en: "What to export", ru: "Что экспортировать" },
  "exp.all": { uk: "Усе", en: "All", ru: "Всё" },
  "exp.allTime": { uk: "Весь час", en: "All time", ru: "Всё время" },
  "exp.thisMonth": { uk: "Цей місяць", en: "This month", ru: "Этот месяц" },
  "exp.thisYear": { uk: "Цей рік", en: "This year", ru: "Этот год" },
  "exp.pickDates": { uk: "Обрати дати", en: "Pick dates", ru: "Выбрать даты" },
  "exp.scopeAll": { uk: "Усі транзакції", en: "All transactions", ru: "Все транзакции" },
  "exp.hintTail": { uk: "файл CSV (Excel / Google Sheets / Numbers).", en: "CSV file (Excel / Google Sheets / Numbers).", ru: "файл CSV (Excel / Google Sheets / Numbers)." },
  "exp.preparing": { uk: "Готую файл…", en: "Preparing file…", ru: "Готовлю файл…" },
  "exp.downloadCsv": { uk: "Завантажити CSV", en: "Download CSV", ru: "Скачать CSV" },
  "exp.periodTitle": { uk: "Період експорту", en: "Export period", ru: "Период экспорта" },

  // категорії (свої)
  "cats.emptyTitle": { uk: "Своїх категорій ще нема", en: "No custom categories yet", ru: "Своих категорий пока нет" },
  "cats.emptyHint": { uk: "Додай першу — назва, колір та іконка.", en: "Add the first one — name, color and icon.", ru: "Добавь первую — название, цвет и иконка." },
  "cats.add": { uk: "Додати категорію", en: "Add category", ru: "Добавить категорию" },
  "cats.newTitle": { uk: "Нова категорія", en: "New category", ru: "Новая категория" },
  "cats.editTitle": { uk: "Редагувати категорію", en: "Edit category", ru: "Изменить категорию" },
  "cats.namePh": { uk: "Назва (напр. Кава)", en: "Name (e.g. Coffee)", ru: "Название (напр. Кофе)" },
  "cats.nameDefault": { uk: "Назва категорії", en: "Category name", ru: "Название категории" },
  "cats.icon": { uk: "Іконка", en: "Icon", ru: "Иконка" },
  "cats.color": { uk: "Колір", en: "Color", ru: "Цвет" },
  "cats.confirmDel": { uk: "Видалити категорію?", en: "Delete category?", ru: "Удалить категорию?" },

  // валюта
  "cur.info": { uk: "В основній валюті ти вводиш і бачиш суми. Валюта конвертації показується поряд як «≈» — перерахована з основної за курсом. Курс оновлюється автоматично щогодини.", en: "You enter and see amounts in the main currency. The conversion currency is shown next to it as “≈” — converted from the main at the current rate. The rate updates automatically every hour.", ru: "В основной валюте ты вводишь и видишь суммы. Валюта конвертации показывается рядом как «≈» — пересчитанная из основной по курсу. Курс обновляется автоматически каждый час." },
  "cur.mainSub": { uk: "У ній вводиш і бачиш суми", en: "You enter and see amounts in it", ru: "В ней вводишь и видишь суммы" },
  "cur.convLabel": { uk: "Валюта конвертації · ≈", en: "Conversion currency · ≈", ru: "Валюта конвертации · ≈" },
  "cur.convSub": { uk: "Показується поряд, перерахована з основної", en: "Shown next to it, converted from the main", ru: "Показывается рядом, пересчитанная из основной" },
  "cur.convTo": { uk: "Конвертується в", en: "Converts to", ru: "Конвертируется в" },

  // калькулятор
  "calc.sum": { uk: "Сума", en: "Amount", ru: "Сумма" },
  "calc.erase": { uk: "Стерти", en: "Erase", ru: "Стереть" },

  // сповіщення (дзвіночок)
  "notif.title": { uk: "Сповіщення", en: "Notifications", ru: "Уведомления" },
  "notif.emptyTitle": { uk: "Сповіщень поки немає", en: "No notifications yet", ru: "Уведомлений пока нет" },
  "notif.emptyHint": { uk: "Тут зʼявлятимуться нагадування та записані регулярні платежі.", en: "Reminders and logged recurring payments will appear here.", ru: "Здесь будут появляться напоминания и записанные регулярные платежи." },
  "notif.markAll": { uk: "Прочитати всі", en: "Read all", ru: "Прочитать все" },

  // перегляд транзакції / тости
  "tv.deleted": { uk: "Видалено", en: "Deleted", ru: "Удалено" },
  "tv.record": { uk: "запис", en: "entry", ru: "запись" },

  // "скоро"
  "soon.title": { uk: "Скоро тут зʼявиться", en: "Coming soon", ru: "Скоро здесь появится" },
  "soon.body": { uk: "ще в розробці. Ми працюємо над цим — невдовзі буде готово.", en: "is still in development. We're working on it — it'll be ready soon.", ru: "ещё в разработке. Мы работаем над этим — скоро будет готово." },
  "soon.thisFeature": { uk: "Ця функція", en: "This feature", ru: "Эта функция" },

  // донат
  "don.title": { uk: "Підтримати автора 💛", en: "Support the author 💛", ru: "Поддержать автора 💛" },
  "don.text": { uk: "Snapcost безкоштовний, без реклами й підписок. Якщо хочеш віддячити — будь-яка сума на свій розсуд. Тапни рядок, щоб скопіювати. Дякую 🙏", en: "Snapcost is free, with no ads or subscriptions. If you'd like to say thanks — any amount you wish. Tap a row to copy. Thank you 🙏", ru: "Snapcost бесплатный, без рекламы и подписок. Если хочешь отблагодарить — любая сумма на твоё усмотрение. Тапни строку, чтобы скопировать. Спасибо 🙏" },
  "don.crypto": { uk: "Крипто", en: "Crypto", ru: "Крипто" },
  "don.bank": { uk: "Банк · EUR (Wise)", en: "Bank · EUR (Wise)", ru: "Банк · EUR (Wise)" },
  "don.recipient": { uk: "Отримувач", en: "Recipient", ru: "Получатель" },
  "don.bankAddr": { uk: "Адреса банку", en: "Bank address", ru: "Адрес банка" },

  // календар
  "cal.reset": { uk: "Скинути", en: "Reset", ru: "Сбросить" },
  "cal.prev": { uk: "Попередній місяць", en: "Previous month", ru: "Предыдущий месяц" },
  "cal.next": { uk: "Наступний місяць", en: "Next month", ru: "Следующий месяц" },

  // приховування сум
  "eye.show": { uk: "Показати суми", en: "Show amounts", ru: "Показать суммы" },
  "eye.hide": { uk: "Сховати суми", en: "Hide amounts", ru: "Скрыть суммы" },

  // навбар — меню "+"
  "qa.income": { uk: "Дохід", en: "Income", ru: "Доход" },
  "qa.expense": { uk: "Витрата", en: "Expense", ru: "Расход" },
  "qa.scan": { uk: "Сканувати", en: "Scan", ru: "Сканировать" },
  "qa.more": { uk: "Ще", en: "More", ru: "Ещё" },
  "nav.addIncome": { uk: "Додати дохід", en: "Add income", ru: "Добавить доход" },
  "nav.addExpense": { uk: "Витрата вручну", en: "Expense manually", ru: "Расход вручную" },
  "nav.scanReceipt": { uk: "Сканувати чек", en: "Scan receipt", ru: "Сканировать чек" },

  // логін
  "login.tagline": { uk: "Клац чек — бачиш витрати у своїй валюті", en: "Snap a receipt — see expenses in your currency", ru: "Щёлкни чек — видишь расходы в своей валюте" },
  "login.google": { uk: "Увійти через Google", en: "Sign in with Google", ru: "Войти через Google" },
  "login.orEmail": { uk: "або поштою", en: "or with email", ru: "или по почте" },
  "login.sentPre": { uk: "✉️ Лист із посиланням надіслано на", en: "✉️ A sign-in link has been sent to", ru: "✉️ Письмо со ссылкой отправлено на" },
  "login.sentPost": { uk: "Відкрий пошту і натисни на посилання.", en: "Open your inbox and tap the link.", ru: "Открой почту и нажми на ссылку." },
  "login.emailPh": { uk: "твій@email.com", en: "you@email.com", ru: "твой@email.com" },
  "login.sending": { uk: "Надсилаю…", en: "Sending…", ru: "Отправляю…" },
  "login.sendLink": { uk: "Надіслати посилання", en: "Send link", ru: "Отправить ссылку" },
  "login.googleErr": { uk: "Не вдалося отримати посилання Google", en: "Couldn't get the Google sign-in link", ru: "Не удалось получить ссылку Google" },

  // серверні помилки (actions)
  "err.noAuth": { uk: "Не авторизовано", en: "Not signed in", ru: "Не авторизован" },
  "err.name": { uk: "Введи назву", en: "Enter a name", ru: "Введи название" },
  "err.nameAcc": { uk: "Введи назву рахунку", en: "Enter an account name", ru: "Введи название счёта" },
  "err.nameProfile": { uk: "Введи імʼя", en: "Enter a name", ru: "Введи имя" },
  "err.noSub": { uk: "Немає підписки", en: "No subscription", ru: "Нет подписки" },
  "err.unknownCurrency": { uk: "Невідома валюта", en: "Unknown currency", ru: "Неизвестная валюта" },
  "err.unknownLang": { uk: "Невідома мова", en: "Unknown language", ru: "Неизвестный язык" },

  // push-повідомлення
  "push.recurringOne": { uk: "Регулярний платіж записано:", en: "Recurring payment logged:", ru: "Регулярный платёж записан:" },
  "push.recurringMany": { uk: "Записано регулярних платежів:", en: "Recurring payments logged:", ru: "Записано регулярных платежей:" },
  "push.reminderTitle": { uk: "Нагадування", en: "Reminder", ru: "Напоминание" },
  "push.reminderBody": { uk: "Не забудь записати витрати 💸", en: "Don't forget to log your expenses 💸", ru: "Не забудь записать расходы 💸" },

  // головна: привітання + баланс періоду
  "dash.hello": { uk: "З поверненням 👋", en: "Welcome back 👋", ru: "С возвращением 👋" },
  "dash.balance": { uk: "Баланс", en: "Balance", ru: "Баланс" },

  // профіль: аватар
  "prof.changePhoto": { uk: "Змінити фото", en: "Change photo", ru: "Изменить фото" },
  "prof.photoErr": { uk: "Не вдалося завантажити фото", en: "Couldn't upload the photo", ru: "Не удалось загрузить фото" },

  // бюджет
  "dash.setBudget": { uk: "Встановити бюджет", en: "Set a budget", ru: "Установить бюджет" },
  "dash.budgetTitle": { uk: "Місячний бюджет", en: "Monthly budget", ru: "Месячный бюджет" },

  // онбординг
  "onb.welcome": { uk: "Вітаю в Snapcost!", en: "Welcome to Snapcost!", ru: "Добро пожаловать в Snapcost!" },
  "onb.sub": { uk: "Три кроки — і все запрацює:", en: "Three steps to get going:", ru: "Три шага — и всё заработает:" },
  "onb.step1": { uk: "Сканни чек", en: "Scan a receipt", ru: "Сканируй чек" },
  "onb.step1.sub": { uk: "Кнопка «+» унизу → Сканувати чек. Суму й позиції розпізнає сам.", en: "Tap “+” below → Scan receipt. It reads the total and items itself.", ru: "Кнопка «+» внизу → Сканировать чек. Сумму и позиции распознает сам." },
  "onb.step2": { uk: "Вибери валюту", en: "Pick your currency", ru: "Выбери валюту" },
  "onb.step2.sub": { uk: "Тапни валюту вгорі — основна і конвертація «≈».", en: "Tap the currency at the top — main and “≈” conversion.", ru: "Тапни валюту вверху — основная и конвертация «≈»." },
  "onb.step3": { uk: "Дивись звіти", en: "See your reports", ru: "Смотри отчёты" },
  "onb.step3.sub": { uk: "Вкладка «Звіти» показує, куди йдуть гроші по категоріях.", en: "The Reports tab shows where your money goes by category.", ru: "Вкладка «Отчёты» показывает, куда уходят деньги по категориям." },
  "onb.start": { uk: "Почати", en: "Let's go", ru: "Начать" },
  "onb.skip": { uk: "Пропустити", en: "Skip", ru: "Пропустить" },
  "onb.next": { uk: "Далі", en: "Next", ru: "Далее" },
  "onb.s1.title": { uk: "Додай першу витрату", en: "Add your first expense", ru: "Добавь первый расход" },
  "onb.s1.sub": { uk: "Тапни «+» у правому нижньому куті та вибери дію.", en: "Tap “+” in the bottom-right corner and pick an action.", ru: "Тапни «+» в правом нижнем углу и выбери действие." },
  "onb.s2.title": { uk: "Сканни чек", en: "Scan a receipt", ru: "Сканируй чек" },
  "onb.s2.sub": { uk: "Вибери «Сканувати чек» і сфотографуй — суму, позиції та категорію розпізнає сам.", en: "Choose “Scan receipt” and take a photo — it reads the total, items and category itself.", ru: "Выбери «Сканировать чек» и сфотографируй — сумму, позиции и категорию распознает сам." },
  "onb.s3.title": { uk: "Готово — все порахувалось", en: "Done — it all adds up", ru: "Готово — всё посчиталось" },
  "onb.s3.sub": { uk: "Сума й позиції підтяглися з чека самі — лишилось «Зберегти».", en: "The total and items filled in from the receipt — just hit Save.", ru: "Сумма и позиции подтянулись из чека сами — осталось «Сохранить»." },
  "onb.scanning": { uk: "Читаю чек…", en: "Reading receipt…", ru: "Читаю чек…" },
  "onb.item1": { uk: "Молоко", en: "Milk", ru: "Молоко" },
  "onb.item2": { uk: "Хліб", en: "Bread", ru: "Хлеб" },
  "onb.moreItems": { uk: "…ще 6 позицій", en: "…6 more items", ru: "…ещё 6 позиций" },

  // офлайн
  "off.title": { uk: "Немає інтернету", en: "You're offline", ru: "Нет интернета" },
  "off.hint": { uk: "Перевір зʼєднання і спробуй ще раз.", en: "Check your connection and try again.", ru: "Проверь соединение и попробуй ещё раз." },
  "off.retry": { uk: "Спробувати ще", en: "Try again", ru: "Попробовать ещё" },

  // правові сторінки
  "legal.privacy": { uk: "Політика конфіденційності", en: "Privacy Policy", ru: "Политика конфиденциальности" },
  "legal.privacy.sub": { uk: "Як ми поводимося з даними", en: "How we handle your data", ru: "Как мы обращаемся с данными" },

  // CSV-експорт
  "csv.date": { uk: "Дата", en: "Date", ru: "Дата" },
  "csv.type": { uk: "Тип", en: "Type", ru: "Тип" },
  "csv.category": { uk: "Категорія", en: "Category", ru: "Категория" },
  "csv.place": { uk: "Місце / опис", en: "Place / description", ru: "Место / описание" },
  "csv.amount": { uk: "Сума", en: "Amount", ru: "Сумма" },
  "csv.currency": { uk: "Валюта", en: "Currency", ru: "Валюта" },
  "csv.note": { uk: "Нотатка", en: "Note", ru: "Заметка" },
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

// Назви валют трьома мовами (у lib/currency.ts label лишається укр. як fallback).
const CURRENCY_NAMES: Record<string, Entry> = {
  PLN: { uk: "Польський злотий", en: "Polish złoty", ru: "Польский злотый" },
  UAH: { uk: "Гривня", en: "Ukrainian hryvnia", ru: "Гривна" },
  USD: { uk: "Долар США", en: "US dollar", ru: "Доллар США" },
  EUR: { uk: "Євро", en: "Euro", ru: "Евро" },
  GBP: { uk: "Фунт стерлінгів", en: "British pound", ru: "Фунт стерлингов" },
};

export function currencyName(code: string, lang: Lang): string {
  const e = CURRENCY_NAMES[code];
  return e ? e[lang] || e.uk : code;
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
