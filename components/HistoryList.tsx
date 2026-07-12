"use client";

import { useState, useRef } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import TransactionViewer from "@/components/TransactionViewer";
import CalendarSheet from "@/components/CalendarSheet";
import EmptyState from "@/components/EmptyState";
import { periods, catEmoji, catBg } from "@/lib/txui";
import { useDec, useMoney, useConv, useT, useLang } from "@/components/SettingsProvider";
import { dataLabel, fmtDateL, opsLabel, type StringKey } from "@/lib/i18n";
import { periodRange, periodLabel, availOffsets } from "@/lib/periodNav";

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
  const [navIdx, setNavIdx] = useState(0);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [viewId, setViewId] = useState<string | null>(null);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const touch = useRef({ x: 0, y: 0 });

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const dec = useDec();
  const money = useMoney();
  const conv = useConv();
  const t = useT();
  const lang = useLang();
  const isExpenses = tab === "expenses";

  // пошук: збігаємось і з сирою назвою категорії (у базі укр.),
  // і з ПЕРЕКЛАДЕНОЮ — щоб EN/RU користувач знаходив "food"/"еда"
  const searchResults = searching
    ? txs
        .filter((x) => (tab === "expenses" ? x.type === "expense" : x.type === "income"))
        .filter(
          (x) =>
            x.merchant.toLowerCase().includes(q) ||
            x.category.toLowerCase().includes(q) ||
            dataLabel(x.category, lang).toLowerCase().includes(q) ||
            (x.items ?? []).some((n) => n.toLowerCase().includes(q))
        )
    : [];
  const searchTotal = searchResults.reduce((s, x) => s + x.amountHome, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const ofTab = txs.filter((x) => (isExpenses ? x.type === "expense" : x.type === "income"));
  // зсуви по ВСІХ транзакціях — свайп назад працює незалежно від вкладки
  const avail = availOffsets(period, txs.map((x) => x.date), now);
  const idx = Math.min(navIdx, avail.length - 1);
  const offset = avail[idx] ?? 0;
  const curRange = range ? { start: range.from, end: range.to } : periodRange(period, offset, now);

  const filtered = ofTab.filter((x) => x.date >= curRange.start && x.date <= curRange.end);
  const periodText = range ? `${dmShort(range.from)} – ${dmShort(range.to)}` : periodLabel(period, offset, now, lang);
  const total = filtered.reduce((s, x) => s + x.amountHome, 0);

  const canOlder = !range && idx < avail.length - 1;
  const canNewer = !range && idx > 0;
  function swipeStart(e: React.TouchEvent) { const p = e.touches[0]; touch.current = { x: p.clientX, y: p.clientY }; }
  function swipeEnd(e: React.TouchEvent) {
    if (searching) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - touch.current.x;
    const dy = p.clientY - touch.current.y;
    if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) { if (canOlder) setNavIdx(idx + 1); } else { if (canNewer) setNavIdx(idx - 1); }
  }

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
    setNavIdx(0);
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

      <section className={styles.periodcard} onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
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
                  <div className={styles.txMid}>
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

        <div className={styles.psumHead}>
          <div className={styles.psum}>
            <span className={styles.psumLabel}>
              {isExpenses ? t("common.expenses") : t("common.income")} · {periodText}
            </span>
            <div className={styles.psumRow}>
              <span className={styles.psumAmt}>{money(total, dec)}</span>
              <span className={styles.pr}>≈ {conv(total, dec)}</span>
            </div>
          </div>
          {!range && avail.length > 1 && avail.length <= 12 && (
            <div className={styles.psumDots}>
              {avail.map((_, i) => {
                const di = avail.length - 1 - i;
                return <button key={i} className={`${styles.mDot} ${idx === di ? styles.mDotOn : ""}`} onClick={() => setNavIdx(di)} aria-label={`${di}`} />;
              })}
            </div>
          )}
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
                        <span className={`${styles.catSum} ${!isExpenses ? styles.inc : ""}`}>{money(c.sum, dec)}</span>
                      </div>
                      <div className={styles.catBar}>
                        <span className={styles.catBarFill} style={{ width: `${share}%` }} />
                      </div>
                      <div className={styles.catSub}>
                        <span>{c.count} {opsLabel(c.count, lang)} · {Math.round(share)}%</span>
                        <span>≈ {conv(c.sum, dec)}</span>
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
