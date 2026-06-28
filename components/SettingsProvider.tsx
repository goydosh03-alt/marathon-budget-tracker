"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { UserCategory } from "@/app/dashboard/actions";
import {
  type CurrencyCode,
  DEFAULT_CURRENCY,
  USD_PER,
  convert,
  formatMoney,
  maskMoney,
} from "@/lib/currency";

type Rates = Record<CurrencyCode, number>;

const Ctx = createContext<{
  hideCents: boolean;
  categories: UserCategory[];
  currency: CurrencyCode;
  convertCurrency: CurrencyCode;
  rates: Rates;
  hidden: boolean;
  toggleHidden: () => void;
}>({
  hideCents: false,
  categories: [],
  currency: DEFAULT_CURRENCY,
  convertCurrency: "USD",
  rates: USD_PER,
  hidden: false,
  toggleHidden: () => {},
});

export function SettingsProvider({
  hideCents,
  categories,
  currency,
  convertCurrency,
  rates,
  children,
}: {
  hideCents: boolean;
  categories: UserCategory[];
  currency: CurrencyCode;
  convertCurrency: CurrencyCode;
  rates: Rates;
  children: React.ReactNode;
}) {
  // Приватність: ховати всі суми (зберігається на пристрої).
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try {
      setHidden(localStorage.getItem("sc_hide_amounts") === "1");
    } catch {}
  }, []);
  const toggleHidden = useCallback(() => {
    setHidden((h) => {
      const n = !h;
      try {
        localStorage.setItem("sc_hide_amounts", n ? "1" : "0");
      } catch {}
      return n;
    });
  }, []);

  return (
    <Ctx.Provider value={{ hideCents, categories, currency, convertCurrency, rates, hidden, toggleHidden }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDec(): number {
  return useContext(Ctx).hideCents ? 0 : 2;
}

export function useHideCents(): boolean {
  return useContext(Ctx).hideCents;
}

export function useCategories(): UserCategory[] {
  return useContext(Ctx).categories;
}

export function useCurrency(): CurrencyCode {
  return useContext(Ctx).currency;
}

export function useConvertCurrency(): CurrencyCode {
  return useContext(Ctx).convertCurrency;
}

export function useRates(): Rates {
  return useContext(Ctx).rates;
}

export function useAmountsHidden(): boolean {
  return useContext(Ctx).hidden;
}

export function useToggleAmounts(): () => void {
  return useContext(Ctx).toggleHidden;
}

// Форматер суми в ОСНОВНІЙ валюті користувача.
// from — валюта, в якій збережена сума (за замовч. = основна, тобто без конвертації).
export function useMoney() {
  const { currency: code, rates, hidden } = useContext(Ctx);
  return (amountHome: number, dp = 2, from: CurrencyCode = code) =>
    hidden ? maskMoney(code) : formatMoney(convert(amountHome, from, code, rates), code, dp);
}

// Форматер суми в КОНВЕРТОВАНІЙ (другій) валюті — для рядка "≈ ...".
export function useConv() {
  const { currency, convertCurrency, rates, hidden } = useContext(Ctx);
  return (amountHome: number, dp = 2, from: CurrencyCode = currency) =>
    hidden ? maskMoney(convertCurrency) : formatMoney(convert(amountHome, from, convertCurrency, rates), convertCurrency, dp);
}
