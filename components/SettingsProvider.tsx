"use client";

import { createContext, useContext } from "react";
import type { UserCategory } from "@/app/dashboard/actions";

const Ctx = createContext<{ hideCents: boolean; categories: UserCategory[] }>({
  hideCents: false,
  categories: [],
});

export function SettingsProvider({
  hideCents,
  categories,
  children,
}: {
  hideCents: boolean;
  categories: UserCategory[];
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ hideCents, categories }}>{children}</Ctx.Provider>;
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
