// Спільна логіка/хелпери для головної та історії — щоб усе було консистентне.

export const periods = [
  { id: "day", label: "День" },
  { id: "week", label: "Тиждень" },
  { id: "month", label: "Місяць" },
  { id: "year", label: "Рік" },
];

export const PERIOD_LABEL: Record<string, string> = {
  day: "сьогодні",
  week: "тиждень",
  month: "місяць",
  year: "рік",
};

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

export function fmtDate(dateStr: string, createdAt?: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - date.getTime()) / 86400000);
  let label: string;
  if (diff === 0) label = "Сьогодні";
  else if (diff === 1) label = "Вчора";
  else {
    const months = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"];
    label = `${date.getDate()} ${months[date.getMonth()]}`;
  }
  if (createdAt) {
    const t = new Date(createdAt);
    const hh = String(t.getHours()).padStart(2, "0");
    const mm = String(t.getMinutes()).padStart(2, "0");
    label += `, ${hh}:${mm}`;
  }
  return label;
}

export function pluralOps(n: number): string {
  const a = Math.abs(n) % 100;
  const b = a % 10;
  if (a > 10 && a < 20) return "операцій";
  if (b > 1 && b < 5) return "операції";
  if (b === 1) return "операція";
  return "операцій";
}
