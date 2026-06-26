"use client";

import { useState, useRef } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { usd, pln } from "@/lib/currency";
import { Icon, IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import CalendarSheet from "@/components/CalendarSheet";
import EmptyState from "@/components/EmptyState";
import { periods, catEmoji } from "@/lib/txui";

type Tx = { type: string; amountHome: number; category: string; date: string };

const COLORS = ["#4ade9f", "#3bb4f5", "#b9a8ff", "#f5c87c", "#ff8a8a", "#6ee7b7", "#7cc8f5", "#f5a3d0", "#9ad17a", "#c0c0c0"];
const MONTHS_SHORT = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"];
const MONTHS_FULL = ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"];
const MAX_BACK = 5;

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
    .map((c, i) => ({ ...c, color: COLORS[i % COLORS.length] }));
}

function Donut({ data }: { data: { sum: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.sum, 0) || 1;
  const r = 56;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg viewBox="0 0 140 140" className={styles.donutSvg}>
      <g transform="rotate(-90 70 70)">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="15" />
        {data.map((d, i) => {
          const len = (d.sum / total) * c;
          const seg = (
            <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={d.color} strokeWidth="15"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} />
          );
          acc += len;
          return seg;
        })}
      </g>
    </svg>
  );
}

export default function ReportsView({
  accounts,
  txs,
}: {
  accounts: { id: string; name: string; type: string }[];
  txs: Tx[];
}) {
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [view, setView] = useState<"cats" | "months">("cats");
  const [period, setPeriod] = useState("month");
  const [offset, setOffset] = useState(0);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const touchX = useRef(0);

  const isExpenses = tab === "expenses";
  const ofTab = txs.filter((t) => (isExpenses ? t.type === "expense" : t.type === "income"));

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  function inInstance(dateStr: string): boolean {
    if (range) return dateStr >= range.from && dateStr <= range.to;
    if (period === "day") {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      return dateStr === iso(d);
    }
    if (period === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - offset * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return dateStr >= iso(start) && dateStr <= iso(end);
    }
    if (period === "month") {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return dateStr.startsWith(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return dateStr.startsWith(`${now.getFullYear() - offset}`);
  }

  function instanceLabel(): string {
    if (range) return `${dmShort(range.from)} – ${dmShort(range.to)}`;
    if (period === "day") {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      if (offset === 0) return "Сьогодні";
      if (offset === 1) return "Вчора";
      return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
    }
    if (period === "week") {
      const start = new Date(now);
      start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - offset * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.getDate()}–${end.getDate()} ${MONTHS_SHORT[end.getMonth()]}`;
    }
    if (period === "month") {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      return `${MONTHS_FULL[d.getMonth()]}${d.getFullYear() !== now.getFullYear() ? " " + d.getFullYear() : ""}`;
    }
    return `${now.getFullYear() - offset}`;
  }

  const filtered = ofTab.filter((t) => inInstance(t.date));
  const total = filtered.reduce((s, t) => s + t.amountHome, 0);
  const cats = catList(filtered);

  const monthsData = Array.from({ length: 6 }, (_, idx) => {
    const back = 5 - idx + offset;
    const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const sum = ofTab.filter((t) => t.date.startsWith(prefix)).reduce((s, t) => s + t.amountHome, 0);
    return { label: MONTHS_SHORT[d.getMonth()], sum, prefix };
  });
  const months6 = ofTab.filter((t) => monthsData.some((md) => t.date.startsWith(md.prefix)));
  const total6 = monthsData.reduce((s, d) => s + d.sum, 0);
  const activeMonths = monthsData.filter((d) => d.sum > 0).length || 1;
  const avg = total6 / activeMonths;
  const maxBar = Math.max(...monthsData.map((d) => d.sum), 1);
  const catsMonths = catList(months6);
  const barsLabel = `${monthsData[0].label}–${monthsData[5].label}`;

  const big = view === "months" ? total6 : total;
  const legendCats = view === "months" ? catsMonths : cats;
  const isEmpty = view === "months" ? total6 === 0 : cats.length === 0;
  const canNewer = !range && offset > 0;
  const canOlder = !range && offset < MAX_BACK;

  const older = () => canOlder && setOffset((o) => Math.min(MAX_BACK, o + 1));
  const newer = () => canNewer && setOffset((o) => Math.max(0, o - 1));

  function swipeStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function swipeEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx < -45) older();
    else if (dx > 45) newer();
  }
  function changePeriod(id: string) {
    setRange(null);
    setOffset(0);
    setPeriod(id);
  }

  const Dots = () => (
    <div className={styles.monthDots}>
      {Array.from({ length: MAX_BACK + 1 }, (_, i) => (
        <button
          key={i}
          className={`${styles.mDot} ${!range && offset === MAX_BACK - i ? styles.mDotOn : ""}`}
          onClick={() => { setRange(null); setOffset(MAX_BACK - i); }}
          aria-label={`Період -${MAX_BACK - i}`}
        />
      ))}
    </div>
  );

  return (
    <div className={styles.screen}>
      <IconSprite />
      <TopBar><span className={styles.barTitle}>Звіти</span></TopBar>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${isExpenses ? styles.tabOnExp : ""}`} onClick={() => setTab("expenses")}>
          Витрати
        </button>
        <button className={`${styles.tab} ${!isExpenses ? styles.tabOnInc : ""}`} onClick={() => setTab("income")}>
          Дохід
        </button>
      </div>

      <div className={styles.viewIcons}>
        <div className={styles.viewIconsSeg}>
          <button className={`${styles.viewIcon} ${view === "cats" ? styles.viewIconOn : ""}`} onClick={() => setView("cats")} aria-label="Кругова">
            <Icon id="i-pie" />
          </button>
          <button className={`${styles.viewIcon} ${view === "months" ? styles.viewIconOn : ""}`} onClick={() => setView("months")} aria-label="Стовпчики">
            <Icon id="i-bars" />
          </button>
        </div>
      </div>

      <section className={styles.periodcard} onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
        {view === "cats" && (
          <>
            <div className={styles.pfilter}>
              {periods.map((p) => (
                <button
                  key={p.id}
                  className={`${styles.pf} ${!range && period === p.id ? styles.pfOn : ""}`}
                  onClick={() => changePeriod(p.id)}
                >
                  {p.label}
                </button>
              ))}
              <span className={styles.vdiv} />
              <button className={`${styles.cal} ${range ? styles.calActive : ""}`} aria-label="Період" onClick={() => setCalOpen(true)}>
                <Icon id="i-cal" />
              </button>
            </div>
            {!range && <Dots />}
          </>
        )}

        {isEmpty ? (
          <EmptyState icon="i-bars" title="Немає даних" hint={`За цей період ${isExpenses ? "витрат" : "доходів"} немає.`} />
        ) : view === "cats" ? (
          <>
            <div className={styles.donutRow}>
              <button className={styles.navArrow} onClick={older} disabled={!canOlder} aria-label="Назад">
                <Icon id="i-back" />
              </button>
              <div className={styles.donutWrap}>
                <Donut data={cats} />
                <div className={styles.donutCenter}>
                  <span className={styles.donutSum}>{usd(big, 0)}</span>
                  <span className={styles.donutLbl}>≈ {pln(big, 0)}</span>
                </div>
              </div>
              <button className={styles.navArrow} onClick={newer} disabled={!canNewer} aria-label="Вперед">
                <Icon id="i-fwd" />
              </button>
            </div>
            <div className={styles.donutPeriod}>{instanceLabel()}</div>
            <div className={styles.fulldiv} />
          </>
        ) : (
          <>
            <div className={styles.donutRow}>
              <button className={styles.navArrow} onClick={older} disabled={!canOlder} aria-label="Назад">
                <Icon id="i-back" />
              </button>
              <div className={styles.repHead}>
                <span className={styles.repBig}>{usd(total6, 0)}</span>
                <span className={styles.repSub}>{barsLabel} · в сер. {usd(avg, 0)}/міс</span>
              </div>
              <button className={styles.navArrow} onClick={newer} disabled={!canNewer} aria-label="Вперед">
                <Icon id="i-fwd" />
              </button>
            </div>
            <div className={styles.bars}>
              {monthsData.map((d, i) => (
                <div className={styles.barCol} key={i}>
                  <div className={styles.barWrap}>
                    <div className={styles.barFill} style={{ height: `${(d.sum / maxBar) * 100}%` }} />
                  </div>
                  <span className={styles.barLbl}>{d.label}</span>
                </div>
              ))}
            </div>
            <Dots />
            <div className={styles.fulldiv} />
          </>
        )}

        {!isEmpty && (
          <div className={styles.legend}>
            {legendCats.map((c) => {
              const share = big > 0 ? Math.round((c.sum / big) * 100) : 0;
              return (
                <div className={styles.legRow} key={c.cat}>
                  <span className={styles.legDot} style={{ background: c.color }} />
                  <span className={styles.legName}>{catEmoji(c.cat, !isExpenses)} {c.cat}</span>
                  <span className={styles.legPct}>{share}%</span>
                  <span className={styles.legSum}>{usd(c.sum, 0)}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
