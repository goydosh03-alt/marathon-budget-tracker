"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";
import { usd, pln } from "@/lib/currency";
import { Icon, IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import TransactionViewer from "@/components/TransactionViewer";
import EmptyState from "@/components/EmptyState";
import { catEmoji, catBg, fmtDate } from "@/lib/txui";

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

export default function CategoryView({
  accounts,
  txs,
  cat,
  isIncome,
}: {
  accounts: { id: string; name: string; type: string }[];
  txs: Tx[];
  cat: string;
  isIncome: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"date" | "amount">("date");
  const [viewId, setViewId] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = txs
    .filter(
      (t) =>
        !q ||
        t.merchant.toLowerCase().includes(q) ||
        (t.items ?? []).some((n) => n.toLowerCase().includes(q))
    )
    .sort((a, b) => (sort === "amount" ? b.amountHome - a.amountHome : 0));

  const total = txs.reduce((s, t) => s + t.amountHome, 0);

  return (
    <div className={styles.screen}>
      <IconSprite />

      <header className={styles.topbar}>
        <Link href="/reports" className={styles.iconBtn} aria-label="Назад">
          <Icon id="i-back" />
        </Link>
        <span className={styles.barTitle} style={{ marginLeft: 12 }}>
          {catEmoji(cat, isIncome)} {cat}
        </span>
      </header>

      <div className={styles.catHead}>
        <span className={styles.catHeadEmoji} style={{ background: catBg(cat) }}>
          {catEmoji(cat, isIncome)}
        </span>
        <div>
          <span className={styles.catHeadSum}>{usd(total, 2)}</span>
          <span className={styles.catHeadSub}>≈ {pln(total, 2)} · {txs.length} {txs.length === 1 ? "операція" : "операцій"}</span>
        </div>
      </div>

      <div className={styles.searchBar}>
        <Icon id="i-search" />
        <input placeholder="Пошук по назві або позиції…" value={query} onChange={(e) => setQuery(e.target.value)} />
        {query && (
          <button className={styles.searchClear} onClick={() => setQuery("")} aria-label="Очистити">
            <Icon id="i-x" />
          </button>
        )}
      </div>

      <div className={styles.viewToggleRow}>
        <button className={`${styles.sortChip} ${sort === "date" ? styles.sortChipOn : ""}`} onClick={() => setSort("date")}>
          За датою
        </button>
        <button className={`${styles.sortChip} ${sort === "amount" ? styles.sortChipOn : ""}`} onClick={() => setSort("amount")}>
          За сумою
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="i-search" title="Нічого не знайдено" hint="Спробуй інший запит." />
      ) : (
        <div className={styles.catList}>
          {filtered.map((t) => (
            <div className={`${styles.tx} ${styles.clickable}`} key={t.id} onClick={() => setViewId(t.id)}>
              <div className={styles.emo} style={{ background: catBg(t.category) }}>
                {catEmoji(t.category, isIncome)}
              </div>
              <div>
                <span className={styles.txName}>{t.merchant || t.category}</span>
                <span className={styles.txMeta}>{fmtDate(t.date, t.createdAt)}</span>
              </div>
              <div className={styles.amt}>
                <span className={`${styles.amtVal} ${isIncome ? styles.inc : ""}`}>
                  {isIncome ? "+" : "−"}{usd(t.amountHome, 2)}
                </span>
                <span className={styles.amtSub}>{pln(t.amountHome, 2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <BottomNav active="reports" accounts={accounts} />

      {viewId && (
        <TransactionViewer id={viewId} accounts={accounts} onClose={() => setViewId(null)} />
      )}
    </div>
  );
}
