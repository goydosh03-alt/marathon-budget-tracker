"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import styles from "@/app/dashboard/ds.module.css";
import DsIcon from "@/components/ds/Icon";
import { IconSprite } from "@/components/IconSprite";
import { useDec, useMoney, useConv, useT, useLang } from "@/components/SettingsProvider";
import BottomNav from "@/components/BottomNav";
import AmountsEyeButton from "@/components/AmountsEyeButton";
import NotificationsBell from "@/components/NotificationsBell";
import CalendarSheet from "@/components/CalendarSheet";
import { periods, catEmoji } from "@/lib/txui";
import { catVisual } from "@/lib/catIcon";
import { dataLabel, MONTHS_SHORT, MONTHS_FULL, MONTHS_GEN, type StringKey } from "@/lib/i18n";

type Tx = { type: string; amountHome: number; category: string; date: string };

// Кольори сегментів — тільки з палітри категорій у tokens.css.
// Донат і легенда беруть колір з ОДНОГО місця, тому вони завжди збігаються.
const SEG_COLORS = [
  "var(--sc-cat-orange)",
  "var(--sc-cat-blue)",
  "var(--sc-cat-green)",
  "var(--sc-cat-purple)",
  "var(--sc-cat-teal)",
  "var(--sc-cat-red)",
];

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dmShort(s: string): string {
  const [, m, d] = s.split("-");
  return `${d}.${m}`;
}

function catList(txs: Tx[]) {
  const map = new Map<string, { sum: number; count: number }>();
  for (const t of txs) {
    const e = map.get(t.category) ?? { sum: 0, count: 0 };
    e.sum += t.amountHome;
    e.count++;
    map.set(t.category, e);
  }
  return Array.from(map.entries())
    .map(([cat, v]) => ({ cat, ...v }))
    .sort((a, b) => b.sum - a.sum)
    .map((c, i) => ({ ...c, color: SEG_COLORS[i % SEG_COLORS.length] }));
}

function Donut({ data }: { data: { sum: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.sum, 0) || 1;
  const r = 56;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 140 140" className={styles.repDonutSvg}>
      <g transform="rotate(-90 70 70)">
        <circle cx="70" cy="70" r={r} fill="none" strokeWidth="15" style={{ stroke: "var(--sc-hairline)" }} />
        {data.map((d, i) => {
          const len = (d.sum / total) * c;
          const seg = (
            <circle
              key={i}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              strokeWidth="15"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-acc}
              style={{ stroke: d.color }}
            />
          );
          acc += len;
          return seg;
        })}
      </g>
    </svg>
  );
}

/* Гліфи, яких немає в наборі Solar Bold. Малюємо інлайн — так само,
   як Dashboard.tsx малює стрілки. Заливка, currentColor. */
const PieGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
    <path d="M11 2.05A10 10 0 1021.95 13H11z" />
    <path opacity="0.5" d="M13 2.05V11h8.95A10 10 0 0013 2.05z" />
  </svg>
);
const CalGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: "block" }}>
    <path d="M8 2v2H6a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-2V2h-2v2H10V2zm12 8H4v9a2 2 0 002 2h12a2 2 0 002-2z" />
  </svg>
);
const ChevGlyph = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ display: "block" }}
  >
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export default function ReportsView({
  accounts,
  txs,
}: {
  accounts: { id: string; name: string; type: string }[];
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
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [view, setView] = useState<"cats" | "months">("cats");
  const [period, setPeriod] = useState("month");
  const [navIdx, setNavIdx] = useState(0);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const touch = useRef({ x: 0, y: 0 });

  const isExpenses = tab === "expenses";
  const ofTab = txs.filter((t) => (isExpenses ? t.type === "expense" : t.type === "income"));

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // діапазон одного «інстансу» гранулярності за зсувом
  function rangeOf(off: number): { start: string; end: string; short: string } {
    if (period === "day") {
      const d = new Date(now); d.setDate(now.getDate() - off);
      return { start: iso(d), end: iso(d), short: `${d.getDate()}` };
    }
    if (period === "week") {
      const s = new Date(now); s.setDate(now.getDate() - ((now.getDay() + 6) % 7) - off * 7);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return { start: iso(s), end: iso(e), short: `${s.getDate()}.${String(s.getMonth() + 1).padStart(2, "0")}` };
    }
    if (period === "month") {
      const d = new Date(now.getFullYear(), now.getMonth() - off, 1);
      const e = new Date(now.getFullYear(), now.getMonth() - off + 1, 0);
      return { start: iso(d), end: iso(e), short: mShort[d.getMonth()] };
    }
    const y = now.getFullYear() - off;
    return { start: `${y}-01-01`, end: `${y}-12-31`, short: `${y}` };
  }

  // доступні (непорожні) періоди цієї гранулярності, від найновішого (offset 0)
  const SCAN = period === "day" ? 60 : period === "week" ? 53 : period === "month" ? 24 : 10;
  const avail: number[] = [];
  for (let o = 0; o <= SCAN; o++) {
    const r = rangeOf(o);
    if (ofTab.some((t) => t.date >= r.start && t.date <= r.end)) avail.push(o);
  }
  const idx = avail.length ? Math.min(navIdx, avail.length - 1) : 0;
  const offset = avail[idx] ?? 0;

  function instanceLabel(): string {
    if (range) return `${dmShort(range.from)} – ${dmShort(range.to)}`;
    if (period === "day") {
      const d = new Date(now); d.setDate(now.getDate() - offset);
      if (offset === 0) return t("rel.today");
      if (offset === 1) return t("rel.yesterday");
      return `${d.getDate()} ${mGen[d.getMonth()]}`;
    }
    if (period === "week") {
      const s = new Date(now); s.setDate(now.getDate() - ((now.getDay() + 6) % 7) - offset * 7);
      const e = new Date(s); e.setDate(s.getDate() + 6);
      return `${s.getDate()}–${e.getDate()} ${mGen[e.getMonth()]}`;
    }
    if (period === "month") {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return `${mFull[d.getMonth()]}${d.getFullYear() !== now.getFullYear() ? " " + d.getFullYear() : ""}`;
    }
    return `${now.getFullYear() - offset}`;
  }

  // --- По категоріях (поточний інстанс) ---
  const curRange: { start: string; end: string } = range
    ? { start: range.from, end: range.to }
    : rangeOf(offset);
  const filtered = ofTab.filter((t) => t.date >= curRange.start && t.date <= curRange.end);
  const total = filtered.reduce((s, t) => s + t.amountHome, 0);
  const cats = catList(filtered);

  // --- По періодах (6 інстансів гранулярності) ---
  const barsData = Array.from({ length: 6 }, (_, idx) => {
    const r = rangeOf(5 - idx + offset);
    const sum = ofTab.filter((t) => t.date >= r.start && t.date <= r.end).reduce((s, t) => s + t.amountHome, 0);
    return { label: r.short, sum, start: r.start, end: r.end };
  });
  const all6 = ofTab.filter((t) => t.date >= barsData[0].start && t.date <= barsData[5].end);
  const total6 = barsData.reduce((s, d) => s + d.sum, 0);
  const maxBar = Math.max(...barsData.map((d) => d.sum), 1);
  const catsBars = catList(all6);
  const barsLabel = `${barsData[0].label}–${barsData[5].label}`;

  const big = view === "months" ? total6 : total;
  const legendCats = view === "months" ? catsBars : cats;
  const drillFrom = view === "months" ? barsData[0].start : curRange.start;
  const drillTo = view === "months" ? barsData[5].end : curRange.end;
  const isEmpty = view === "months" ? total6 === 0 : cats.length === 0;
  const canOlder = !range && idx < avail.length - 1; // є старіший непорожній період
  const canNewer = !range && idx > 0; // є новіший непорожній період

  const older = () => canOlder && setNavIdx(idx + 1);
  const newer = () => canNewer && setNavIdx(idx - 1);

  function swipeStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  }
  function swipeEnd(e: React.TouchEvent) {
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy)) return; // тільки явний горизонтальний свайп
    if (dx < 0) older(); else newer();
  }
  function changePeriod(id: string) { setRange(null); setNavIdx(0); setPeriod(id); }

  const showDots = !range && avail.length > 1 && avail.length <= 12;
  const dots = showDots ? (
    <div className={styles.repDots}>
      {avail.map((_, i) => {
        const di = avail.length - 1 - i; // праворуч — найновіший (idx 0)
        return (
          <button
            key={i}
            className={`${styles.repDot} ${idx === di ? styles.repDotOn : ""}`}
            onClick={() => setNavIdx(di)}
            aria-label={`${t("common.period")} ${di + 1}`}
          />
        );
      })}
    </div>
  ) : null;

  return (
    <div className={styles.screen}>
      <IconSprite />

      <div className={styles.content}>
        <header className={styles.headerbar}>
          <h1 className={styles.repTitle}>{t("nav.reports")}</h1>
          <div className={`${styles.actions} ${styles.glass}`}>
            <AmountsEyeButton />
            <NotificationsBell />
          </div>
        </header>

        <div className={`${styles.repSeg} ${styles.glass}`}>
          <button
            className={`${styles.repSegBtn} ${isExpenses ? styles.repSegOn : ""}`}
            onClick={() => { setTab("expenses"); setNavIdx(0); }}
          >
            {t("common.expenses")}
          </button>
          <button
            className={`${styles.repSegBtn} ${!isExpenses ? styles.repSegOn : ""}`}
            onClick={() => { setTab("income"); setNavIdx(0); }}
          >
            {t("common.income")}
          </button>
        </div>

        <section className={styles.repSheet}>
          <div className={`${styles.repCtl} ${styles.glass}`}>
            {periods.map((p) => (
              <button
                key={p.id}
                className={`${styles.repPf} ${!range && period === p.id ? styles.repPfOn : ""}`}
                onClick={() => changePeriod(p.id)}
              >
                {t(`period.${p.id}` as StringKey)}
              </button>
            ))}
            <span className={styles.repVdiv} />
            <button
              className={`${styles.repCal} ${range ? styles.repCalOn : ""}`}
              aria-label={t("common.period")}
              onClick={() => setCalOpen(true)}
            >
              <CalGlyph />
            </button>
          </div>

          <div className={styles.repLegendHead}>
            <span className={styles.repDate}>{view === "months" ? barsLabel : instanceLabel()}</span>
            <div className={styles.repViewSeg}>
              <button
                className={`${styles.repViewBtn} ${view === "cats" ? styles.repViewOn : ""}`}
                onClick={() => setView("cats")}
                aria-label={t("rep.donut")}
              >
                <PieGlyph />
              </button>
              <button
                className={`${styles.repViewBtn} ${view === "months" ? styles.repViewOn : ""}`}
                onClick={() => setView("months")}
                aria-label={t("rep.bars")}
              >
                <DsIcon name="BoldBusinessStatisticChart2" size={18} />
              </button>
            </div>
          </div>

          {isEmpty ? (
            <div className={styles.empty}>
              <span className={styles.emptyTitle}>{t("rep.noData")}</span>
              <span className={styles.emptyHint}>{isExpenses ? t("rep.noDataExp") : t("rep.noDataInc")}</span>
            </div>
          ) : (
            <>
              <div className={styles.repCard} onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
                {view === "cats" ? (
                  <div className={styles.repDonutWrap}>
                    <Donut data={cats} />
                    <div className={styles.repDonutCenter}>
                      <span className={styles.repDonutSum}>{money(big, dec)}</span>
                      <span className={styles.repDonutSub}>≈ {conv(big, dec)}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.repBarsHead}>
                      <span className={styles.repBarsBig}>{money(total6, dec)}</span>
                      <span className={styles.repBarsSub}>≈ {conv(total6, dec)}</span>
                    </div>
                    <div className={styles.repBars}>
                      {barsData.map((d, i) => (
                        <div className={styles.repBarCol} key={i}>
                          <div className={styles.repBarWrap}>
                            <div className={styles.repBarFill} style={{ height: `${(d.sum / maxBar) * 100}%` }} />
                          </div>
                          <span className={styles.repBarLbl}>{d.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {dots}
              </div>

              <div className={styles.repLegendHead}>
                <span>{isExpenses ? t("common.expenses") : t("common.income")}</span>
                <span>{money(big, dec)}</span>
              </div>

              <div className={`${styles.repLegend} ${legendCats.length === 1 ? styles.repLegendSingle : ""}`}>
                {legendCats.map((c, i) => {
                  const share = big > 0 ? Math.round((c.sum / big) * 100) : 0;
                  const vis = catVisual(c.cat, !isExpenses);
                  return (
                    <div key={c.cat}>
                      {i > 0 && <div className={styles.hair} />}
                      <Link
                        className={styles.repLegRow}
                        href={`/category?cat=${encodeURIComponent(c.cat)}&from=${drillFrom}&to=${drillTo}&type=${isExpenses ? "expense" : "income"}`}
                      >
                        <span className={styles.repLegDisc} style={{ background: c.color }}>
                          {vis.icon ? <DsIcon name={vis.icon} size={20} /> : catEmoji(c.cat, !isExpenses)}
                        </span>
                        <span className={styles.repLegMid}>
                          <span className={styles.repLegName}>{dataLabel(c.cat, lang)}</span>
                          <span className={styles.repLegMeta}>{share}%</span>
                        </span>
                        <span className={styles.repLegRight}>
                          <span className={styles.repLegSum}>{money(c.sum, dec)}</span>
                          <span className={styles.repLegSub}>≈ {conv(c.sum, dec)}</span>
                        </span>
                        <span className={styles.repLegChev}><ChevGlyph /></span>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      <div className={styles.scrimbar} />
      <BottomNav active="reports" accounts={accounts} />

      {calOpen && (
        <CalendarSheet
          initialFrom={range?.from ?? null}
          initialTo={range?.to ?? null}
          onApply={(from, to) => { setRange({ from, to }); setCalOpen(false); }}
          onReset={() => { setRange(null); setCalOpen(false); }}
          onClose={() => setCalOpen(false)}
        />
      )}
    </div>
  );
}
