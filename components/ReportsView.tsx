"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { usd, pln } from "@/lib/currency";
import { Icon, IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import CalendarSheet from "@/components/CalendarSheet";
import EmptyState from "@/components/EmptyState";
import { periods, PERIOD_LABEL, inPeriod, catEmoji } from "@/lib/txui";

type Tx = { type: string; amountHome: number; category: string; date: string };

const COLORS = ["#4ade9f", "#3bb4f5", "#b9a8ff", "#f5c87c", "#ff8a8a", "#6ee7b7", "#7cc8f5", "#f5a3d0", "#9ad17a", "#c0c0c0"];
const MONTHS_SHORT = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"];

function dmShort(isoStr: string): string {
  const [, m, d] = isoStr.split("-");
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
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [calOpen, setCalOpen] = useState(false);

  const isExpenses = tab === "expenses";
  const ofTab = txs.filter((t) => (isExpenses ? t.type === "expense" : t.type === "income"));

  // --- режим «За категоріями» (період) ---
  const filtered = ofTab.filter((t) =>
    range ? t.date >= range.from && t.date <= range.to : inPeriod(t.date, period)
  );
  const total = filtered.reduce((s, t) => s + t.amountHome, 0);
  const periodText = range ? `${dmShort(range.from)} – ${dmShort(range.to)}` : PERIOD_LABEL[period];
  const cats = catList(filtered);

  // --- режим «По місяцях» (останні 6) ---
  const now = new Date();
  const monthsKeys: { y: number; m: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthsKeys.push({ y: d.getFullYear(), m: d.getMonth() });
  }
  const monthsData = monthsKeys.map(({ y, m }) => {
    const prefix = `${y}-${String(m + 1).padStart(2, "0")}`;
    const sum = ofTab.filter((t) => t.date.startsWith(prefix)).reduce((s, t) => s + t.amountHome, 0);
    return { label: MONTHS_SHORT[m], sum };
  });
  const months6 = ofTab.filter((t) => {
    const first = monthsKeys[0];
    const start = `${first.y}-${String(first.m + 1).padStart(2, "0")}`;
    return t.date >= `${start}-01`;
  });
  const total6 = monthsData.reduce((s, d) => s + d.sum, 0);
  const activeMonths = monthsData.filter((d) => d.sum > 0).length || 1;
  const avg = total6 / activeMonths;
  const maxBar = Math.max(...monthsData.map((d) => d.sum), 1);
  const catsMonths = catList(months6);

  const big = view === "months" ? total6 : total;
  const legendCats = view === "months" ? catsMonths : cats;
  const isEmpty = view === "months" ? total6 === 0 : cats.length === 0;

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

      <div className={styles.viewToggle}>
        <button className={`${styles.viewBtn} ${view === "cats" ? styles.viewBtnOn : ""}`} onClick={() => setView("cats")}>
          За категоріями
        </button>
        <button className={`${styles.viewBtn} ${view === "months" ? styles.viewBtnOn : ""}`} onClick={() => setView("months")}>
          По місяцях
        </button>
      </div>

      <section className={styles.periodcard}>
        {view === "cats" && (
          <div className={styles.pfilter}>
            {periods.map((p) => (
              <button
                key={p.id}
                className={`${styles.pf} ${!range && period === p.id ? styles.pfOn : ""}`}
                onClick={() => { setRange(null); setPeriod(p.id); }}
              >
                {p.label}
              </button>
            ))}
            <span className={styles.vdiv} />
            <button className={`${styles.cal} ${range ? styles.calActive : ""}`} aria-label="Період" onClick={() => setCalOpen(true)}>
              <Icon id="i-cal" />
            </button>
          </div>
        )}

        {isEmpty ? (
          <EmptyState icon="i-bars" title="Немає даних" hint={`За цей період ${isExpenses ? "витрат" : "доходів"} немає.`} />
        ) : view === "cats" ? (
          <>
            <div className={styles.donutWrap}>
              <Donut data={cats} />
              <div className={styles.donutCenter}>
                <span className={styles.donutSum}>{usd(big, 0)}</span>
                <span className={styles.donutLbl}>≈ {pln(big, 0)}</span>
              </div>
            </div>
            <div className={styles.donutPeriod}>за {periodText}</div>
            <div className={styles.fulldiv} />
          </>
        ) : (
          <>
            <div className={styles.repHead}>
              <span className={styles.repBig}>{usd(total6, 0)}</span>
              <span className={styles.repSub}>≈ {pln(total6, 0)} · в середньому {usd(avg, 0)}/міс</span>
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
