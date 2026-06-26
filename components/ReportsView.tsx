"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { usd, pln } from "@/lib/currency";
import { Icon, IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import CalendarSheet from "@/components/CalendarSheet";
import EmptyState from "@/components/EmptyState";
import { periods, PERIOD_LABEL, inPeriod, catEmoji, pluralOps } from "@/lib/txui";

type Tx = { type: string; amountHome: number; category: string; date: string };

const COLORS = ["#4ade9f", "#3bb4f5", "#b9a8ff", "#f5c87c", "#ff8a8a", "#6ee7b7", "#7cc8f5", "#f5a3d0", "#9ad17a", "#c0c0c0"];

function dmShort(isoStr: string): string {
  const [, m, d] = isoStr.split("-");
  return `${d}.${m}`;
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
            <circle
              key={i}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="15"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-acc}
            />
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
  const [period, setPeriod] = useState("month");
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [calOpen, setCalOpen] = useState(false);

  const isExpenses = tab === "expenses";
  const filtered = txs.filter((t) => {
    if (isExpenses ? t.type !== "expense" : t.type !== "income") return false;
    return range ? t.date >= range.from && t.date <= range.to : inPeriod(t.date, period);
  });
  const total = filtered.reduce((s, t) => s + t.amountHome, 0);
  const periodText = range ? `${dmShort(range.from)} – ${dmShort(range.to)}` : PERIOD_LABEL[period];

  const map = new Map<string, number>();
  for (const t of filtered) map.set(t.category, (map.get(t.category) ?? 0) + t.amountHome);
  const cats = Array.from(map.entries())
    .map(([cat, sum]) => ({ cat, sum }))
    .sort((a, b) => b.sum - a.sum)
    .map((c, i) => ({ ...c, color: COLORS[i % COLORS.length] }));

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

      <section className={styles.periodcard}>
        <div className={styles.pfilter}>
          {periods.map((p) => (
            <button
              key={p.id}
              className={`${styles.pf} ${!range && period === p.id ? styles.pfOn : ""}`}
              onClick={() => {
                setRange(null);
                setPeriod(p.id);
              }}
            >
              {p.label}
            </button>
          ))}
          <span className={styles.vdiv} />
          <button className={`${styles.cal} ${range ? styles.calActive : ""}`} aria-label="Період" onClick={() => setCalOpen(true)}>
            <Icon id="i-cal" />
          </button>
        </div>

        {cats.length === 0 ? (
          <EmptyState
            icon="i-bars"
            title="Немає даних"
            hint={`За ${periodText} ${isExpenses ? "витрат" : "доходів"} немає. Спробуй інший період.`}
          />
        ) : (
          <>
            <div className={styles.donutWrap}>
              <Donut data={cats} />
              <div className={styles.donutCenter}>
                <span className={styles.donutSum}>{usd(total, 0)}</span>
                <span className={styles.donutLbl}>{isExpenses ? "витрачено" : "зароблено"}</span>
              </div>
            </div>
            <div className={styles.donutPeriod}>{periodText} · ≈ {pln(total, 0)}</div>

            <div className={styles.fulldiv} />

            <div className={styles.legend}>
              {cats.map((c) => {
                const share = total > 0 ? Math.round((c.sum / total) * 100) : 0;
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
          </>
        )}
      </section>

      <BottomNav active="reports" accounts={accounts} />

      {calOpen && (
        <CalendarSheet
          initialFrom={range?.from ?? null}
          initialTo={range?.to ?? null}
          onApply={(from, to) => {
            setRange({ from, to });
            setCalOpen(false);
          }}
          onReset={() => {
            setRange(null);
            setCalOpen(false);
          }}
          onClose={() => setCalOpen(false)}
        />
      )}
    </div>
  );
}
