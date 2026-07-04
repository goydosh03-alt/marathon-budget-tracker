// Спільна логіка/хелпери для головної та історії — щоб усе було консистентне.

// Підписи періодів беруться з i18n (ключі period.*) — тут лише id.
export const periods = [
  { id: "day" },
  { id: "week" },
  { id: "month" },
  { id: "year" },
];

export function inPeriod(dateStr: string, period: string): boolean {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (period === "day") return d.getTime() === now.getTime();
  if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return d >= start;
  }
  if (period === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (period === "year") return d.getFullYear() === now.getFullYear();
  return true;
}

const CAT_EMOJI: Record<string, string> = {
  Їжа: "🛒", Кафе: "☕", Транспорт: "🚌", Розваги: "🎉", Аптека: "💊",
  Одяг: "👕", Комунальні: "🏠", Зарплата: "💰", Фриланс: "💸", Подарунок: "🎁", Інше: "📦",
};
const CAT_BG: Record<string, string> = {
  Їжа: "rgba(124,92,255,0.16)", Кафе: "rgba(74,222,180,0.16)", Транспорт: "rgba(59,180,245,0.16)",
};

export function catEmoji(cat: string, isIncome: boolean): string {
  return CAT_EMOJI[cat] ?? (isIncome ? "💰" : "💸");
}
export function catBg(cat: string): string {
  return CAT_BG[cat] ?? "rgba(255,255,255,0.06)";
}

// Дата/множина операцій — див. fmtDateL() та opsLabel() у lib/i18n.ts (мультимовні).
