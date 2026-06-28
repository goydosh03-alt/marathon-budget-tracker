import { CURRENCIES, USD_PER, type CurrencyCode } from "@/lib/currency";

// Тягне живі курси з безкоштовного API (без ключа, є UAH).
// Повертає мапу "USD за 1 одиницю валюти" — той самий формат, що USD_PER.
// Кеш — 1 година (Next fetch revalidate). За будь-якої помилки → статичний стаб.
export async function fetchRates(): Promise<Record<CurrencyCode, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return USD_PER;
    const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
    if (data.result !== "success" || !data.rates) return USD_PER;

    // API дає "одиниць валюти за 1 USD"; нам треба "USD за 1 одиницю" = 1 / rate.
    const out = { ...USD_PER };
    for (const c of CURRENCIES) {
      const perUsd = data.rates[c.code];
      if (typeof perUsd === "number" && perUsd > 0) out[c.code] = 1 / perUsd;
    }
    return out;
  } catch {
    return USD_PER;
  }
}
