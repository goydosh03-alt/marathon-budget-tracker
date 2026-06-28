"use client";

import { createContext, useContext } from "react";
import type { UserCategory } from "@/app/dashboard/actions";
import {
  type CurrencyCode,
  DEFAULT_CURRENCY,
  convert,
  formatMoney,
} from "@/lib/currency";

const Ctx = createContext<{
  hideCents: boolean;
  categories: UserCategory[];
  currency: CurrencyCode;
  convertCurrency: CurrencyCode;
}>({
  hideCents: false,
  categories: [],
  currency: DEFAULT_CURRENCY,
  convertCurrency: "USD",
});

export function SettingsProvider({
  hideCents,
  categories,
  currency,
  convertCurrency,
  children,
}: {
  hideCents: boolean;
  categories: UserCategory[];
  currency: CurrencyCode;
  convertCurrency: CurrencyCode;
  children: React.ReactNode;
}) {
  return (
    <Ctx.Provider value={{ hideCents, categories, currency, convertCurrency }}>
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

// Форматер суми в ОСНОВНІЙ валюті користувача.
// from — валюта, в якій збережена сума (за замовч. = основна, тобто без конвертації).
export function useMoney() {
  const code = useContext(Ctx).currency;
  return (amountHome: number, dp = 2, from: CurrencyCode = code) =>
    formatMoney(convert(amountHome, from, code), code, dp);
}

// Форматер суми в КОНВЕРТОВАНІЙ (другій) валюті — для рядка "≈ ...".
export function useConv() {
  const { currency, convertCurrency } = useContext(Ctx);
  return (amountHome: number, dp = 2, from: CurrencyCode = currency) =>
    formatMoney(convert(amountHome, from, convertCurrency), convertCurrency, dp);
}
