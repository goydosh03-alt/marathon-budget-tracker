"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { usd, pln } from "@/lib/currency";
import { useRouter } from "next/navigation";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import TransactionViewer from "@/components/TransactionViewer";
import AddTransactionForm from "@/components/AddTransactionForm";
import ExportSheet from "@/components/ExportSheet";
import EmptyState from "@/components/EmptyState";
import { catEmoji, catBg, fmtDate } from "@/lib/txui";
import { useDec } from "@/components/SettingsProvider";

type Item = { name: string; price: number };
type Tx = {
  id: string;
  accountId: string;
  type: string;
  amountHome: number;
  category: string;
  merchant: string;
  date: string;
  createdAt: string;
  items?: Item[];
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
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [showExport, setShowExport] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const router = useRouter();
  const dec = useDec();

  function toggle(id: string) {
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  const q = query.trim().toLowerCase();
  const filtered = txs
    .filter(
      (t) =>
        !q ||
        t.merchant.toLowerCase().includes(q) ||
        (t.items ?? []).some((it) => it.name.toLowerCase().includes(q))
    )
    .sort((a, b) => (sort === "amount" ? b.amountHome - a.amountHome : 0));

  const total = txs.reduce((s, t) => s + t.amountHome, 0);

  return (
    <div className={styles.screen}>
      <IconSprite />

      <SubHeader
        title={cat}
        back="/reports"
        right={
          <button className={styles.exportBtn} onClick={() => setShowExport(true)} aria-label="Експорт">
            <Icon id="i-download" />
          </button>
        }
      />

      <section className={styles.periodcard}>
        <div className={styles.catBoxHead}>
          <span className={styles.catBoxLabel}>{isIncome ? "Зароблено" : "Витрачено"}</span>
          <span className={styles.catBoxSum}>{usd(total, 0)}</span>
          <span className={styles.catBoxSub}>
            ≈ {pln(total, 0)} · {txs.length} {txs.length === 1 ? "операція" : "операцій"}
          </span>
        </div>

        <div className={styles.fulldiv} />

        <div className={styles.searchInline}>
          <Icon id="i-search" />
          <input placeholder="Пошук по назві або позиції…" value={query} onChange={(e) => setQuery(e.target.value)} />
          {query && (
            <button className={styles.searchClear} onClick={() => setQuery("")} aria-label="Очистити">
              <Icon id="i-x" />
            </button>
          )}
        </div>

        <div className={styles.fulldiv} />

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
          filtered.map((t) => {
            const hasItems = (t.items?.length ?? 0) > 0;
            const isOpen = open.has(t.id);
            return (
              <div key={t.id}>
                <div className={`${styles.tx} ${styles.clickable}`} onClick={() => setViewId(t.id)}>
                  <div className={styles.emo} style={{ background: catBg(t.category) }}>
                    {catEmoji(t.category, isIncome)}
                  </div>
                  <div>
                    <span className={styles.txName}>{t.merchant || t.category}</span>
                    <span className={styles.txMeta}>{fmtDate(t.date, t.createdAt)}</span>
                  </div>
                  <div className={styles.amt}>
                    <span className={`${styles.amtVal} ${isIncome ? styles.inc : ""}`}>
                      {isIncome ? "+" : "−"}{usd(t.amountHome, dec)}
                    </span>
                    <span className={styles.amtSub}>{pln(t.amountHome, dec)}</span>
                  </div>
                  {hasItems && (
                    <button
                      className={`${styles.txExpand} ${isOpen ? styles.txExpandOn : ""}`}
                      onClick={(e) => { e.stopPropagation(); toggle(t.id); }}
                      aria-label="Позиції"
                    >
                      <Icon id="i-chev" />
                    </button>
                  )}
                </div>
                {hasItems && isOpen && (
                  <div className={styles.txItems}>
                    {t.items!.map((it, i) => (
                      <div
                        className={`${styles.txItemRow} ${i === t.items!.length - 1 ? styles.txItemRowLast : ""}`}
                        key={i}
                      >
                        <span className={styles.txItemName}>{it.name}</span>
                        <span className={styles.txItemPrice}>{it.price.toFixed(2)} zł</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      <button className={`${styles.cam} ${styles.floatAdd}`} onClick={() => setAddOpen(true)} aria-label="Додати">
        <Icon id="i-plus" />
      </button>

      {viewId && (
        <TransactionViewer id={viewId} accounts={accounts} onClose={() => setViewId(null)} />
      )}

      {addOpen && (
        <AddTransactionForm
          initialType={isIncome ? "income" : "expense"}
          initialCategory={cat}
          accounts={accounts}
          onClose={() => {
            setAddOpen(false);
            router.refresh();
          }}
        />
      )}

      {showExport && <ExportSheet onClose={() => setShowExport(false)} />}
    </div>
  );
}
