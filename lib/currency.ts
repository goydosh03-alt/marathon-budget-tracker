// Валютна модель. Зараз курси статичні (стаб) — структуровано так, щоб
// живий API курсів (ExchangeRate тощо) під'єднався в ОДНОМУ місці: USD_PER.

export type CurrencyCode = "PLN" | "UAH" | "USD" | "EUR" | "GBP";

export const CURRENCIES: {
  code: CurrencyCode;
  symbol: string;
  label: string;
  before: boolean; // символ перед числом ($5) чи після (5 zł)
}[] = [
  { code: "PLN", symbol: "zł", label: "Польський злотий", before: false },
  { code: "UAH", symbol: "₴", label: "Гривня", before: false },
  { code: "USD", symbol: "$", label: "Долар США", before: true },
  { code: "EUR", symbol: "€", label: "Євро", before: true },
  { code: "GBP", symbol: "£", label: "Фунт стерлінгів", before: true },
];

export const DEFAULT_CURRENCY: CurrencyCode = "PLN";

// Скільки USD коштує 1 одиниця валюти. Єдине місце для підключення живого API.
export const USD_PER: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  PLN: 0.25,
  UAH: 0.024,
};

export function currencyMeta(code: CurrencyCode) {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function isCurrency(v: unknown): v is CurrencyCode {
  return typeof v === "string" && CURRENCIES.some((c) => c.code === v);
}

// Конвертація між валютами через USD як проміжну базу.
export function convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
  if (from === to) return amount;
  return (amount * USD_PER[from]) / USD_PER[to];
}

// Формат суми з символом валюти.
export function formatMoney(amount: number, code: CurrencyCode, dp = 2): string {
  const m = currencyMeta(code);
  const n = amount.toLocaleString("uk-UA", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
  return m.before ? `${m.symbol}${n}` : `${n} ${m.symbol}`;
}

// --- Сумісність зі старим кодом (amount_base у транзакціях) ---
export const RATE_BASE_PER_HOME = USD_PER.PLN; // 1 zł у USD
