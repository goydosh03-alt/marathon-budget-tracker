"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import TransactionViewer from "@/components/TransactionViewer";
import CalendarSheet from "@/components/CalendarSheet";
import EmptyState from "@/components/EmptyState";
import { periods, inPeriod, catEmoji, catBg } from "@/lib/txui";
import { useDec, useMoney, useConv, useT, useLang } from "@/components/SettingsProvider";
import { dataLabel, fmtDateL, opsLabel, type StringKey } from "@/lib/i18n";

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
  items?: string[];
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
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const searchResults = searching
    ? txs
        .filter((t) => (tab === "expenses" ? t.type === "expense" : t.type === "income"))
        .filter(
          (t) =>
            t.merchant.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            (t.items ?? []).some((n) => n.toLowerCase().includes(q))
        )
    : [];
  const searchTotal = searchResults.reduce((s, t) => s + t.amountHome, 0);

  const dec = useDec();
  const money = useMoney();
  const conv = useConv();
  const t = useT();
  const lang = useLang();
  const isExpenses = tab === "expenses";
  const filtered = txs.filter((t) => {
    if (isExpenses ? t.type !== "expense" : t.type !== "income") return false;
    return range ? t.date >= range.from && t.date <= range.to : inPeriod(t.date, period);
  });
  const periodText = range ? `${dmShort(range.from)} – ${dmShort(range.to)}` : t(`period.short.${period}` as StringKey);
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

      <TopBar><span className={styles.barTitle}>{t("nav.history")}</span></TopBar>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${isExpenses ? styles.tabOnExp : ""}`} onClick={() => reset(() => setTab("expenses"))}>
          {t("common.expenses")}
        </button>
        <button className={`${styles.tab} ${!isExpenses ? styles.tabOnInc : ""}`} onClick={() => reset(() => setTab("income"))}>
          {t("common.income")}
        </button>
      </div>

      <section className={styles.periodcard}>
        <div className={styles.searchInline}>
          <Icon id="i-search" />
          <input
            placeholder={t("hist.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className={styles.searchClear} onClick={() => setQuery("")} aria-label={t("common.clear")}>
              <Icon id="i-x" />
            </button>
          )}
        </div>
        <div className={styles.fulldiv} />

        {searching ? (
          <>
            <div className={styles.searchSum}>
              <span className={styles.searchSumLabel}>
                {t("hist.found")} {searchResults.length} {opsLabel(searchResults.length, lang)}
              </span>
              <span className={styles.searchSumAmt}>{money(searchTotal, dec)}</span>
            </div>
            {searchResults.length === 0 ? (
              <EmptyState
                icon="i-search"
                title={t("hist.notFound")}
                hint={`${t("hist.noTxFor")} «${query}»`}
              />
            ) : (
              searchResults.map((t) => (
                <div className={`${styles.tx} ${styles.clickable}`} key={t.id} onClick={() => setViewId(t.id)}>
                  <div className={styles.emo} style={{ background: catBg(t.category) }}>
                    {catEmoji(t.category, !isExpenses)}
                  </div>
                  <div>
                    <span className={styles.txName}>{t.merchant || dataLabel(t.category, lang)}</span>
                    <span className={styles.txMeta}>{dataLabel(t.category, lang)} · {fmtDateL(t.date, t.createdAt, lang)}</span>
                  </div>
                  <div className={styles.amt}>
                    <span className={`${styles.amtVal} ${!isExpenses ? styles.inc : ""}`}>
                      {isExpenses ? "−" : "+"}{money(t.amountHome, dec)}
                    </span>
                    <span className={styles.amtSub}>≈ {conv(t.amountHome, dec)}</span>
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          <>
        <div className={styles.pfilter}>
          {periods.map((p) => (
            <button
              key={p.id}
              className={`${styles.pf} ${!range && period === p.id ? styles.pfOn : ""}`}
              onClick={() => reset(() => setPeriod(p.id))}
            >
              {t(`period.${p.id}` as StringKey)}
            </button>
          ))}
          <span className={styles.vdiv} />
          <button
            className={`${styles.cal} ${range ? styles.calActive : ""}`}
            aria-label={t("common.period")}
            onClick={() => setCalOpen(true)}
          >
            <Icon id="i-cal" />
          </button>
        </div>

        <div className={styles.psum}>
          <span className={styles.psumLabel}>
            {isExpenses ? t("common.expenses") : t("common.income")} · {periodText}
          </span>
          <div className={styles.psumRow}>
            <span className={styles.psumAmt}>{money(total, 0)}</span>
            <span className={styles.pr}>≈ {conv(total, 0)}</span>
          </div>
        </div>

        <div className={styles.fulldiv} />

        {filtered.length === 0 ? (
          <EmptyState
            icon="i-cal"
            title={t("hist.emptyPeriod")}
            hint={t("hist.emptyPeriodHint")}
          />
        ) : (
          <>
            <div className={styles.sec}>
              <h3 className={styles.secTitle}>{t("hist.categories")}</h3>
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
                        <span className={styles.catName}>{dataLabel(c.cat, lang)}</span>
                        <span className={`${styles.catSum} ${!isExpenses ? styles.inc : ""}`}>{money(c.sum, 0)}</span>
                      </div>
                      <div className={styles.catBar}>
                        <span className={styles.catBarFill} style={{ width: `${share}%` }} />
                      </div>
                      <div className={styles.catSub}>
                        <span>{c.count} {opsLabel(c.count, lang)} · {Math.round(share)}%</span>
                        <span>≈ {conv(c.sum, 0)}</span>
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
                            <span className={styles.treeName}>{t.merchant || dataLabel(t.category, lang)}</span>
                            <span className={styles.treeDate}>{fmtDateL(t.date, t.createdAt, lang)}</span>
                          </div>
                          <div className={styles.treeAmt}>
                            <span className={`${styles.treeVal} ${!isExpenses ? styles.inc : ""}`}>
                              {isExpenses ? "−" : "+"}{money(t.amountHome, dec)}
                            </span>
                            <span className={styles.treeSub}>≈ {conv(t.amountHome, dec)}</span>
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
