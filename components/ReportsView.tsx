"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import styles from "@/app/dashboard/ds.module.css";
import DsIcon from "@/components/ds/Icon";
import { IconSprite } from "@/components/IconSprite";
import { useDec, useMoney, useConv, useT, useLang } from "@/components/SettingsProvider";
import AmountsEyeButton from "@/components/AmountsEyeButton";
import NotificationsBell from "@/components/NotificationsBell";
import AddTransactionForm from "@/components/AddTransactionForm";
import CalendarSheet from "@/components/CalendarSheet";
import { periods } from "@/lib/txui";
import { catVisual, ACCOUNT_ICON, ACCOUNT_COLOR } from "@/lib/catIcon";
import {
  dataLabel,
  MONTHS_SHORT,
  MONTHS_FULL,
  MONTHS_GEN,
  opsLabel,
  type StringKey,
  type Lang,
} from "@/lib/i18n";

type Tx = {
  type: string;
  amountHome: number;
  category: string;
  date: string;
  accountId: string;
  createdAt: string;
};
type Account = { id: string; name: string; type: string };

/* ---------- дрібні гліфи, яких немає в наборі Solar Bold ----------
   Малюємо інлайн, як це вже робить Dashboard.tsx для стрілок. */
const CalGlyph = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
    <path d="M8 2v2H6a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-2V2h-2v2H10V2zm12 8H4v9a2 2 0 002 2h12a2 2 0 002-2z" />
  </svg>
);
const ChevDown = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block" }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block" }}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const TrendGlyph = ({ down }: { down: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: "block" }}>
    {down ? <path d="M7 7l10 10M15 17H7V9" /> : <path d="M7 17L17 7M9 7h8v8" />}
  </svg>
);
const CheckGlyph = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

/* ---------- дати ---------- */
function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dmShort(s: string): string {
  const [, m, d] = s.split("-");
  return `${d}.${m}`;
}
function dayOf(s: string): Date {
  return new Date(s + "T00:00:00");
}
/** Довільний період: «03.09 – 17.09», а якщо це одна доба — просто «03.09». */
function rangeLabel(r: { from: string; to: string }): string {
  return r.from === r.to ? dmShort(r.from) : `${dmShort(r.from)} – ${dmShort(r.to)}`;
}

const DAY_HOURS = ["00:00", "06:00", "12:00", "18:00", "23:00"];

/* Форма графіка. Підпис осі описує РІВНО свою групу штрихів, тому
   кількість груп підбираємо під період:
   тиждень — 7 груп (одна доба = одна група), місяць — 4 (тиждень),
   рік — 4 (квартал), доба — 5 (позначки годин).
   Довільний діапазон коротший за 4 доби дає стільки груп, скільки в
   ньому діб, інакше підпис описував би порожнечу.
   Штрихів завжди кратно групам. */
function shapeOf(kind: "day" | "week" | "month" | "year" | "range", dayCount: number) {
  if (kind === "day") return { ticks: 30, groups: 5 };
  if (kind === "week") return { ticks: 28, groups: 7 };
  if (kind === "year") return { ticks: 24, groups: 4 };
  if (kind === "range") {
    const g = Math.max(1, Math.min(4, dayCount));
    return { ticks: g * 7, groups: g };
  }
  return { ticks: 28, groups: 4 };
}

export default function ReportsView({
  accounts,
  txs,
}: {
  accounts: Account[];
  txs: Tx[];
}) {
  const dec = useDec();
  const money = useMoney();
  const conv = useConv();
  const t = useT();
  const lang = useLang();
  const mShort = MONTHS_SHORT[lang];
  const mFull = MONTHS_FULL[lang];
  const mGen = MONTHS_GEN[lang];

  const [kind, setKind] = useState<"expenses" | "income">("expenses");
  const [period, setPeriod] = useState("month");
  const [navIdx, setNavIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1); // 1 = пішли в минуле, -1 = у майбутнє
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const [menu, setMenu] = useState<"period" | "accounts" | null>(null);
  const [offAccounts, setOffAccounts] = useState<Record<string, true>>({});
  const [addOpen, setAddOpen] = useState(false);
  const touch = useRef({ x: 0, y: 0 });

  const isExpenses = kind === "expenses";
  // Знак напрямку перед сумою: витрати — «−», дохід — «+».
  // Той самий символ (U+2212), що вже стоїть у рядках на головній
  // і в історії, тож ширина цифр не стрибає між екранами.
  const sign = isExpenses ? "−" : "+";

  // фільтр рахунків: порожній набір вимкнених = усі увімкнені
  const accountOn = (id: string) => !offAccounts[id];
  const allAccountsOn = accounts.every((a) => accountOn(a.id));
  const anyAccountOn = accounts.some((a) => accountOn(a.id));

  const ofKind = useMemo(
    () =>
      txs.filter((x) => {
        if (isExpenses ? x.type !== "expense" : x.type !== "income") return false;
        if (!x.accountId) return true; // транзакція без рахунку лишається завжди
        return accountOn(x.accountId);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [txs, isExpenses, offAccounts]
  );

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  function rangeOf(off: number): { start: string; end: string } {
    if (period === "day") {
      const d = new Date(now); d.setDate(now.getDate() - off);
      return { start: iso(d), end: iso(d) };
    }
    if (period === "week") {
      const s = new Date(now); s.setDate(now.getDate() - ((now.getDay() + 6) % 7) - off * 7);
      const e = new Date(s); e.setDate(s.getDate() + 6);
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

  // доступні (непорожні) періоди цієї гранулярності, від найновішого
  const SCAN = period === "day" ? 60 : period === "week" ? 53 : period === "month" ? 24 : 10;
  const avail: number[] = [];
  for (let o = 0; o <= SCAN; o++) {
    const r = rangeOf(o);
    if (ofKind.some((x) => x.date >= r.start && x.date <= r.end)) avail.push(o);
  }
  const idx = avail.length ? Math.min(navIdx, avail.length - 1) : 0;
  const offset = avail[idx] ?? 0;

  const cur = range ? { start: range.from, end: range.to } : rangeOf(offset);
  const prev = range ? null : rangeOf(offset + 1);

  const inRange = (x: Tx, r: { start: string; end: string }) => x.date >= r.start && x.date <= r.end;
  const filtered = ofKind.filter((x) => inRange(x, cur));
  const total = filtered.reduce((s, x) => s + x.amountHome, 0);
  const prevTotal = prev ? ofKind.filter((x) => inRange(x, prev)).reduce((s, x) => s + x.amountHome, 0) : 0;

  // бейдж зміни — з реальних даних, не намальоване число
  const deltaPct = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;

  function periodLabel(): string {
    if (range) return rangeLabel(range);
    if (period === "day") {
      const d = dayOf(cur.start);
      if (offset === 0) return t("rel.today").toLowerCase();
      if (offset === 1) return t("rel.yesterday").toLowerCase();
      return `${d.getDate()} ${mGen[d.getMonth()]}`;
    }
    if (period === "week") {
      const s = dayOf(cur.start), e = dayOf(cur.end);
      return `${s.getDate()}–${e.getDate()} ${mGen[e.getMonth()]}`;
    }
    if (period === "month") {
      const d = dayOf(cur.start);
      return `${mFull[d.getMonth()].toLowerCase()}${d.getFullYear() !== now.getFullYear() ? " " + d.getFullYear() : ""}`;
    }
    return `${dayOf(cur.start).getFullYear()}`;
  }

  /* ---------- графік: штрихи по діапазону ---------- */
  // Скільки діб у поточному діапазоні — від цього залежить і форма
  // графіка, і підписи осі.
  const dayCount = Math.max(
    1,
    Math.round((dayOf(cur.end).getTime() - dayOf(cur.start).getTime()) / 86400000) + 1
  );
  // Довільний діапазон в одну добу малюємо як «День»: за годинами.
  const shapeKind = (range ? (dayCount === 1 ? "day" : "range") : period) as
    | "day" | "week" | "month" | "year" | "range";
  const { ticks, axis, groups } = useMemo(() => {
    const { ticks: TICKS, groups: GROUPS } = shapeOf(shapeKind, dayCount);
    const startMs = dayOf(cur.start).getTime();
    const endMs = dayOf(cur.end).getTime() + 86400000 - 1;
    const span = Math.max(endMs - startMs, 1);
    const buckets = new Array(TICKS).fill(0);

    for (const x of filtered) {
      // добу розкладаємо за часом створення, решту — за датою транзакції
      let ms = dayOf(x.date).getTime();
      if (shapeKind === "day" && x.createdAt) {
        const c = new Date(x.createdAt).getTime();
        if (!isNaN(c) && c >= startMs && c <= endMs) ms = c;
      }
      const b = Math.min(TICKS - 1, Math.max(0, Math.floor(((ms - startMs) / span) * TICKS)));
      buckets[b] += x.amountHome;
    }

    /* ---------- підписи осі ----------
       Підпис описує ІНТЕРВАЛ своєї групи, а не одну точку:
       доба — година, тиждень — день, місяць і довільний діапазон —
       «1–6», рік — квартал «січ–бер». Місяць у підпису з'являється
       лише там, де він змінюється, і лише якщо діапазон його перетинає. */
    const labels: string[] = [];
    if (shapeKind === "day") {
      labels.push(...DAY_HOURS);
    } else if (shapeKind === "year") {
      const per = 12 / GROUPS;
      for (let g = 0; g < GROUPS; g++) {
        labels.push(`${mShort[g * per]}–${mShort[g * per + per - 1]}`);
      }
    } else {
      const dayAt = (i: number) => {
        const d = dayOf(cur.start);
        d.setDate(d.getDate() + i);
        return d;
      };
      const crosses = dayAt(0).getMonth() !== dayAt(dayCount - 1).getMonth();
      let printed = -1; // місяць, який уже стоїть на осі лівіше
      for (let g = 0; g < GROUPS; g++) {
        const a = dayAt(Math.floor((dayCount * g) / GROUPS));
        const b = dayAt(Math.floor((dayCount * (g + 1)) / GROUPS) - 1);
        const am = a.getMonth(), bm = b.getMonth();
        let s: string;
        if (a.getDate() === b.getDate()) {
          s = `${a.getDate()}${crosses && am !== printed ? ` ${mShort[am]}` : ""}`;
        } else if (am !== bm) {
          // група сама перетинає межу місяців — підписуємо обидва кінці
          s = `${a.getDate()} ${mShort[am]}–${b.getDate()} ${mShort[bm]}`;
        } else {
          s = `${a.getDate()}–${b.getDate()}${crosses && bm !== printed ? ` ${mShort[bm]}` : ""}`;
        }
        printed = bm;
        labels.push(s);
      }
    }
    return { ticks: buckets, axis: labels, groups: GROUPS };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, cur.start, cur.end, shapeKind, dayCount, mShort]);

  const maxTick = Math.max(...ticks, 1);

  /* ---------- категорії ---------- */
  const cats = useMemo(() => {
    const map = new Map<string, { sum: number; count: number }>();
    for (const x of filtered) {
      const hit = map.get(x.category) ?? { sum: 0, count: 0 };
      hit.sum += x.amountHome;
      hit.count += 1;
      map.set(x.category, hit);
    }
    return Array.from(map.entries())
      .map(([cat, v]) => ({ cat, sum: v.sum, count: v.count }))
      .sort((a, b) => b.sum - a.sum);
  }, [filtered]);

  const isEmpty = filtered.length === 0;

  /* ---------- навігація ---------- */
  const canOlder = !range && idx < avail.length - 1;
  const canNewer = !range && idx > 0;
  const older = () => { if (canOlder) { setDir(1); setNavIdx(idx + 1); } };
  const newer = () => { if (canNewer) { setDir(-1); setNavIdx(idx - 1); } };

  // Свайп по всьому екрану: вліво -> старіший період, вправо -> новіший.
  // Вертикальний рух не перехоплюємо, щоб не ламати прокрутку списку.
  function swipeStart(e: React.TouchEvent) {
    const p = e.touches[0];
    touch.current = { x: p.clientX, y: p.clientY };
  }
  function swipeEnd(e: React.TouchEvent) {
    if (range || menu) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - touch.current.x;
    const dy = p.clientY - touch.current.y;
    if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < 0) older(); else newer();
  }

  function changePeriod(id: string) {
    setRange(null);
    setDir(-1);
    setNavIdx(0);
    setPeriod(id);
    setMenu(null);
  }

  // Ключ перерисовки: змінюється на кожен новий період -> перезапускає анімацію.
  const slideKey = range ? `r:${range.from}:${range.to}` : `${period}:${offset}`;

  const accountsForForm = accounts.map((a) => ({ id: a.id, name: a.name, type: a.type }));

  return (
    <div className={styles.screen}>
      <IconSprite />

      {menu && <div className={styles.repBackdrop} onClick={() => setMenu(null)} />}

      <div className={styles.repScroll} onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
        {/* шапка */}
        <header className={styles.repHead}>
          <h1 className={styles.repTitle}>{t("nav.reports")}</h1>
          <div className={`${styles.repHeadActions} ${styles.glass}`}>
            <AmountsEyeButton />
            <NotificationsBell />
          </div>
        </header>

        {/* сегмент */}
        <div className={`${styles.repSeg} ${styles.glass}`}>
          <button
            className={`${styles.repSegBtn} ${isExpenses ? styles.repSegOn : ""}`}
            onClick={() => { setKind("expenses"); setNavIdx(0); }}
          >
            {t("common.expenses")}
          </button>
          <button
            className={`${styles.repSegBtn} ${!isExpenses ? styles.repSegOn : ""}`}
            onClick={() => { setKind("income"); setNavIdx(0); }}
          >
            {t("common.income")}
          </button>
        </div>

        {/* герой + графік — те, що змінюється при свайпі */}
        <div
          className={styles.repSlide}
          key={slideKey}
          style={{ ["--rep-from" as string]: dir === 1 ? "16px" : "-16px" }}
        >
        <div className={styles.repHero}>
          <div className={styles.repScope}>
            <span>
              {isExpenses ? t("common.expenses") : t("common.income")} · {periodLabel()}
            </span>
            {deltaPct !== null && (
              <span className={styles.repDelta}>
                <TrendGlyph down={deltaPct < 0} />
                {deltaPct > 0 ? "+" : ""}{deltaPct}%
              </span>
            )}
          </div>

          <div className={styles.repAmount}>
            {/* нуль без знака: «−0» читається як помилка */}
            <span className={styles.repBig}>{total > 0 ? sign : ""}{money(total, 0)}</span>
            <span className={styles.repConv}>≈ {conv(total, 0)}</span>
          </div>

          {/* фільтри */}
          <div className={styles.repFilters}>
            <span className={styles.repFilterWrap}>
              {menu === "period" && (
                <div className={styles.repMenu}>
                  {periods.map((p) => (
                    <button
                      key={p.id}
                      className={`${styles.repMenuItem} ${!range && period === p.id ? styles.repMenuItemOn : ""}`}
                      onClick={() => changePeriod(p.id)}
                    >
                      <span className={styles.repMenuLeft}>{t(`period.${p.id}` as StringKey)}</span>
                    </button>
                  ))}
                  <div className={styles.repMenuDiv} />
                  <button
                    className={`${styles.repMenuItem} ${styles.repMenuItemMuted} ${range ? styles.repMenuItemOn : ""}`}
                    onClick={() => { setMenu(null); setCalOpen(true); }}
                  >
                    <span className={styles.repMenuLeft}>{t("common.period")}</span>
                  </button>
                </div>
              )}
              <button
                className={`${styles.repPill} ${styles.glass}`}
                onClick={() => setMenu(menu === "period" ? null : "period")}
              >
                <span className={styles.repPillIcon}><CalGlyph /></span>
                {range ? rangeLabel(range) : t(`period.${period}` as StringKey)}
                <span className={styles.repPillChev}><ChevDown /></span>
              </button>
            </span>

            <span className={styles.repFilterWrap}>
              {menu === "accounts" && (
                <div className={`${styles.repMenu} ${styles.repMenuRight}`}>
                  {accounts.map((a) => (
                    <button
                      key={a.id}
                      className={styles.repMenuItem}
                      onClick={() =>
                        setOffAccounts((s) => {
                          const next = { ...s };
                          if (next[a.id]) delete next[a.id];
                          else next[a.id] = true;
                          return next;
                        })
                      }
                    >
                      <span className={styles.repMenuLeft}>
                        <span
                          className={styles.repMenuIco}
                          style={{ color: ACCOUNT_COLOR[a.type] ?? "var(--sc-cat-teal)" }}
                        >
                          <DsIcon name={ACCOUNT_ICON[a.type] ?? "BoldMoneyWallet"} size={16} />
                        </span>
                        {dataLabel(a.name, lang)}
                      </span>
                      <span className={`${styles.repCheck} ${accountOn(a.id) ? styles.repCheckOn : ""}`}>
                        {accountOn(a.id) && <CheckGlyph />}
                      </span>
                    </button>
                  ))}
                  <div className={styles.repMenuDiv} />
                  <Link href="/settings" className={`${styles.repMenuItem} ${styles.repMenuItemMuted}`}>
                    <span className={styles.repMenuLeft}>{t("set.addAccount")}</span>
                  </Link>
                </div>
              )}
              <button
                className={`${styles.repPill} ${styles.repPillWide} ${styles.glass}`}
                onClick={() => setMenu(menu === "accounts" ? null : "accounts")}
              >
                <span className={styles.repPillIconBright}><DsIcon name="BoldMoneyCard" size={16} /></span>
                {allAccountsOn ? t("rep.allAccounts") : `${accounts.filter((a) => accountOn(a.id)).length}/${accounts.length}`}
                <span className={styles.repPillChev}><ChevDown /></span>
              </button>
            </span>
          </div>

          {/* пейджер */}
          <div className={styles.repPager}>
            {[0, 1, 2, 3, 4].map((i) => {
              const size = [4, 6, 8, 6, 4][i];
              const isCenter = i === 2;
              const isNear = i === 1 || i === 3;
              const goesOlder = i < 2;
              const enabled = !range && (goesOlder ? canOlder : isCenter ? false : canNewer);
              return (
                <button
                  key={i}
                  className={`${styles.repPagerDot} ${isCenter ? styles.repPagerOn : isNear ? styles.repPagerNear : ""} ${enabled ? styles.repPagerTap : ""}`}
                  style={{ width: size, height: size, opacity: !isCenter && !enabled ? 0.4 : 1 }}
                  onClick={() => { if (enabled) { goesOlder ? older() : newer(); } }}
                  aria-label={goesOlder ? t("common.back") : t("common.period")}
                  disabled={!enabled}
                />
              );
            })}
          </div>
        </div>

        {/* графік + вісь */}
        <div className={styles.repChart}>
          <div className={styles.repTicks}>
            {Array.from({ length: groups }, (_, g) => g).map((g) => (
              <div className={styles.repTickGroup} key={g}>
                {ticks
                  .slice((g * ticks.length) / groups, ((g + 1) * ticks.length) / groups)
                  .map((v, i) => (
                    <span
                      key={i}
                      className={styles.repTick}
                      style={{ height: `${Math.round((v / maxTick) * 100)}%` }}
                    />
                  ))}
              </div>
            ))}
          </div>
          <div className={styles.repAxis}>
            {axis.map((l, i) => (
              <span className={styles.repAxisLbl} key={i}>{l}</span>
            ))}
          </div>
        </div>
        </div>

        {/* блок категорій */}
        <section className={styles.repList}>
          <div className={styles.repListHead}>
            <span className={styles.repListTitle}>
              {isExpenses ? t("common.expenses") : t("common.income")}
            </span>
            <Link href="/history" className={styles.repListLink}>
              {t("dash.all")}
              <ArrowRight />
            </Link>
          </div>

          {isEmpty || !anyAccountOn ? (
            <div className={styles.repEmpty}>
              <span className={styles.repEmptyTitle}>{t("rep.noData")}</span>
              <span className={styles.repEmptyHint}>
                {isExpenses ? t("rep.noDataExp") : t("rep.noDataInc")}
              </span>
            </div>
          ) : (
            cats.map((c, i) => {
              const vis = catVisual(c.cat, !isExpenses);
              const shareRaw = total > 0 ? (c.sum / total) * 100 : 0;
              const share = Math.round(shareRaw);
              return (
                <div key={c.cat}>
                  <div className={`${styles.repRowDiv} ${i === 0 ? styles.repRowDivFirst : ""}`} />
                  <Link
                    className={styles.repRow}
                    href={`/category?cat=${encodeURIComponent(c.cat)}&from=${cur.start}&to=${cur.end}&type=${isExpenses ? "expense" : "income"}`}
                  >
                    <span className={styles.repDisc} style={{ background: vis.color }}>
                      <DsIcon name={vis.icon ?? "BoldMoneyMoneyBag"} size={18} />
                    </span>
                    <span className={styles.repRowMid}>
                      <span className={styles.repRowHead}>
                        <span className={styles.repRowName}>{dataLabel(c.cat, lang)}</span>
                        <span className={styles.repRowSum}>{sign}{money(c.sum, dec)}</span>
                      </span>
                      {/* смуга частки — як у категоріях історії */}
                      <span className={styles.repBar}>
                        <span
                          className={styles.repBarFill}
                          style={{ width: `${Math.max(shareRaw, 1.5)}%` }}
                        />
                      </span>
                      <span className={styles.repRowSub}>
                        <span>{c.count} {opsLabel(c.count, lang)} · {share}%</span>
                        <span className={styles.repRowConv}>≈ {conv(c.sum, dec)}</span>
                      </span>
                    </span>
                  </Link>
                </div>
              );
            })
          )}
        </section>
      </div>

      {/* низ */}
      <div className={styles.repScrim} />
      <nav className={styles.repDock}>
        <div className={`${styles.repNavPill} ${styles.glass}`}>
          <Link href="/dashboard" className={styles.repNavTab} aria-label={t("nav.home")}>
            <DsIcon name="BoldEssentionalUIHome2" size={23} />
          </Link>
          <Link href="/history" className={styles.repNavTab} aria-label={t("nav.history")}>
            <DsIcon name="BoldTimeHistory" size={23} />
          </Link>
          <Link
            href="/reports"
            className={`${styles.repNavTab} ${styles.repNavTabOn}`}
            aria-current="page"
            aria-label={t("nav.reports")}
          >
            <DsIcon name="BoldBusinessStatisticChart2" size={23} />
          </Link>
          <Link href="/menu" className={styles.repNavTab} aria-label={t("nav.menu")}>
            <DsIcon name="BoldEssentionalUIHamburgerMenu" size={23} />
          </Link>
        </div>
        <button className={styles.repFab} onClick={() => setAddOpen(true)} aria-label={t("nav.add")}>
          <DsIcon name="BoldEssentionalUIAddCircle" size={28} />
        </button>
      </nav>

      {addOpen && (
        <AddTransactionForm
          initialType={isExpenses ? "expense" : "income"}
          accounts={accountsForForm}
          onClose={() => setAddOpen(false)}
        />
      )}

      {calOpen && (
        <CalendarSheet
          initialFrom={range?.from ?? null}
          initialTo={range?.to ?? null}
          onApply={(from, to) => { setRange({ from, to }); setNavIdx(0); setCalOpen(false); }}
          onReset={() => { setRange(null); setCalOpen(false); }}
          onClose={() => setCalOpen(false)}
        />
      )}
    </div>
  );
}
