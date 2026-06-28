// Навігація періодами (день/тиждень/місяць/рік) за зсувом — спільна для
// Головної, Історії та Звітів. Мовно-залежні підписи через i18n.
import { MONTHS_GEN, MONTHS_FULL, translate, type Lang } from "@/lib/i18n";

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Межі одного «інстансу» гранулярності за зсувом (0 = поточний).
export function periodRange(period: string, off: number, now: Date): { start: string; end: string } {
  if (period === "day") {
    const d = new Date(now);
    d.setDate(now.getDate() - off);
    return { start: iso(d), end: iso(d) };
  }
  if (period === "week") {
    const s = new Date(now);
    s.setDate(now.getDate() - ((now.getDay() + 6) % 7) - off * 7);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return { start: iso(s), end: iso(e) };
  }
  if (period === "month") {
    const d = new Date(now.getFullYear(), now.getMonth() - off, 1);
    const e = new Date(now.getFullYear(), now.getMonth() - off + 1, 0);
    return { start: iso(d), end: iso(e) };
  }
  const y = now.getFullYear() - off;
  return { start: `${y}-01-01`, end: `${y}-12-31` };
}

// Підпис інстансу: «Сьогодні», «12–18 червня», «Червень», «2024».
export function periodLabel(period: string, off: number, now: Date, lang: Lang): string {
  if (period === "day") {
    const d = new Date(now);
    d.setDate(now.getDate() - off);
    if (off === 0) return translate("rel.today", lang);
    if (off === 1) return translate("rel.yesterday", lang);
    return `${d.getDate()} ${MONTHS_GEN[lang][d.getMonth()]}`;
  }
  if (period === "week") {
    const s = new Date(now);
    s.setDate(now.getDate() - ((now.getDay() + 6) % 7) - off * 7);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return `${s.getDate()}–${e.getDate()} ${MONTHS_GEN[lang][e.getMonth()]}`;
  }
  if (period === "month") {
    const d = new Date(now.getFullYear(), now.getMonth() - off, 1);
    return `${MONTHS_FULL[lang][d.getMonth()]}${d.getFullYear() !== now.getFullYear() ? " " + d.getFullYear() : ""}`;
  }
  return `${now.getFullYear() - off}`;
}

// Непорожні зсуви цієї гранулярності (від найновішого, 0).
export function availOffsets(period: string, dates: string[], now: Date): number[] {
  const SCAN = period === "day" ? 60 : period === "week" ? 53 : period === "month" ? 24 : 10;
  const out: number[] = [];
  for (let o = 0; o <= SCAN; o++) {
    const r = periodRange(period, o, now);
    if (dates.some((d) => d >= r.start && d <= r.end)) out.push(o);
  }
  return out.length ? out : [0];
}
