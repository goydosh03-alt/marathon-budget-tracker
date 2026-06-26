"use client";

import { createContext, useContext } from "react";

const Ctx = createContext<{ hideCents: boolean }>({ hideCents: false });

export function SettingsProvider({
  hideCents,
  children,
}: {
  hideCents: boolean;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ hideCents }}>{children}</Ctx.Provider>;
}

// Скільки десяткових показувати: 0 якщо «приховати копійки», інакше 2.
export function useDec(): number {
  return useContext(Ctx).hideCents ? 0 : 2;
}

export function useHideCents(): boolean {
  return useContext(Ctx).hideCents;
}
