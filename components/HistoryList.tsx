"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { usd, pln } from "@/lib/currency";
import { Icon, IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import TransactionViewer from "@/components/TransactionViewer";
import CalendarSheet from "@/components/CalendarSheet";
import EmptyState from "@/components/EmptyState";
import { periods, PERIOD_LABEL, inPeriod, catEmoji, catBg, fmtDate, pluralOps } from "@/lib/txui";

function dmShort(isoStr: string): string {
  const [, m, d] = isoStr.split("-");
  return `${d}.${m}`;
}

type Tx = {
  id: string;
  accountId: string;
  type: string;
  amountHome: number;
  category: string;
  merchant: string;
  date: string;
  createdAt: string;
};

export default function HistoryList({
  accounts,
  txs,
}: {
  accounts: { id: string; name: string; type: string }[];
  txs: Tx[];
}) {
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [period, setPeriod] = useState("month");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [viewId, setViewId] = useState<string | null>(null);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [calOpen, setCalOpen] = useState(false);

  const isExpenses = tab === "expenses";
  const filtered = txs.filter((t) => {
    if (isExpenses ? t.type !== "expense" : t.type !== "income") return false;
    return range ? t.date >= range.from && t.date <= range.to : inPeriod(t.date, period);
  });
  const periodText = range ? `${dmShort(range.from)} – ${dmShort(range.to)}` : PERIOD_LABEL[period];
  const total = filtered.reduce((s, t) => s + t.amountHome, 0);

  const catMap = new Map<string, { sum: number; count: number }>();
  for (const t of filtered) {
    const c = t.category || "Інше";
    const e = catMap.get(c) ?? { sum: 0, count: 0 };
    e.sum += t.amountHome;
    e.count++;
    catMap.set(c, e);
  }
  const cats = Array.from(catMap.entries())
    .map(([cat, v]) => ({ cat, ...v }))
    .sort((a, b) => b.sum - a.sum);

  function reset(setter: () => void) {
    setOpen(new Set());
    setRange(null);
    setter();
  }

  function toggle(cat: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className={styles.screen}>
      <IconSprite />

      <TopBar><span className={styles.barTitle}>Історія</span></TopBar>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${isExpenses ? styles.tabOnExp : ""}`} onClick={() => reset(() => setTab("expenses"))}>
          Витрати
        </button>
        <button className={`${styles.tab} ${!isExpenses ? styles.tabOnInc : ""}`} onClick={() => reset(() => setTab("income"))}>
          Дохід
        </button>
      </div>

      <section className={styles.periodcard}>
        <div className={styles.pfilter}>
          {periods.map((p) => (
            <button
              key={p.id}
              className={`${styles.pf} ${!range && period === p.id ? styles.pfOn : ""}`}
              onClick={() => reset(() => setPeriod(p.id))}
            >
              {p.label}
            </button>
          ))}
          <span className={styles.vdiv} />
          <button
            className={`${styles.cal} ${range ? styles.calActive : ""}`}
            aria-label="Період"
            onClick={() => setCalOpen(true)}
          >
            <Icon id="i-cal" />
          </button>
        </div>

        <div className={styles.psum}>
          <span className={styles.psumLabel}>
            {isExpenses ? "Витрачено" : "Зароблено"} · {periodText}
          </span>
          <div className={styles.psumRow}>
            <span className={styles.psumAmt}>{usd(total, 0)}</span>
            <span className={styles.pr}>≈ {pln(total, 0)}</span>
          </div>
        </div>

        <div className={styles.fulldiv} />

        {filtered.length === 0 ? (
          <EmptyState
            icon="i-cal"
            title="Нічого за цей період"
            hint="Спробуй інший період чи діапазон, або додай транзакцію кнопкою + унизу."
          />
        ) : (
          <>
            <div className={styles.sec}>
              <h3 className={styles.secTitle}>Категорії</h3>
            </div>
            {cats.map((c, i) => {
              const isOpen = open.has(c.cat);
              const share = total > 0 ? (c.sum / total) * 100 : 0;
              const items = filtered.filter((t) => (t.category || "Інше") === c.cat);
              return (
                <div key={c.cat}>
                  <div className={styles.catRow} onClick={() => toggle(c.cat)}>
                    <div className={styles.emo} style={{ background: catBg(c.cat) }}>
                      {catEmoji(c.cat, !isExpenses)}
                    </div>
                    <div className={styles.catMid}>
                      <div className={styles.catHead}>
                        <span className={styles.catName}>{c.cat}</span>
                        <span className={`${styles.catSum} ${!isExpenses ? styles.inc : ""}`}>{usd(c.sum, 0)}</span>
                      </div>
                      <div className={styles.catBar}>
                        <span className={styles.catBarFill} style={{ width: `${share}%` }} />
                      </div>
                      <div className={styles.catSub}>
                        <span>{c.count} {pluralOps(c.count)} · {Math.round(share)}%</span>
                        <span>≈ {pln(c.sum, 0)}</span>
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className={styles.tree}>
                      {items.map((t, idx) => (
                        <div
                          className={`${styles.treeItem} ${idx === items.length - 1 ? styles.treeLast : ""}`}
                          key={t.id}
                          onClick={() => setViewId(t.id)}
                        >
                          <div className={styles.treeMid}>
                            <span className={styles.treeName}>{t.merchant || t.category}</span>
                            <span className={styles.treeDate}>{fmtDate(t.date, t.createdAt)}</span>
                          </div>
                          <div className={styles.treeAmt}>
                            <span className={`${styles.treeVal} ${!isExpenses ? styles.inc : ""}`}>
                              {isExpenses ? "−" : "+"}{usd(t.amountHome, 2)}
                            </span>
                            <span className={styles.treeSub}>{pln(t.amountHome, 2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {i < cats.length - 1 && <div className={styles.catDiv} />}
                </div>
              );
            })}
          </>
        )}
      </section>

      <BottomNav active="history" accounts={accounts} />

      {viewId && (
        <TransactionViewer id={viewId} accounts={accounts} onClose={() => setViewId(null)} />
      )}

      {calOpen && (
        <CalendarSheet
          initialFrom={range?.from ?? null}
          initialTo={range?.to ?? null}
          onApply={(from, to) => {
            setRange({ from, to });
            setOpen(new Set());
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
