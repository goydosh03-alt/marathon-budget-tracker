"use client";

import { useState, useTransition } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { usd, pln } from "@/lib/currency";
import { catEmoji, catBg, fmtDate } from "@/lib/txui";
import { updateTransactionItems } from "@/app/dashboard/actions";

type Item = { name: string; price: number };

type Tx = {
  id: string;
  type: string;
  amount_home: number;
  category: string | null;
  merchant: string | null;
  account_id: string | null;
  tx_date: string;
  created_at: string;
  note: string | null;
  items: Item[] | null;
  image_url: string | null;
};

export default function TransactionDetail({
  tx,
  accountName,
  photoUrl,
  onClose,
  onEdit,
  onDelete,
}: {
  tx: Tx;
  accountName: string;
  photoUrl: string | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isIncome = tx.type === "income";
  const cat = tx.category ?? "Інше";

  const [items, setItems] = useState<Item[]>(Array.isArray(tx.items) ? tx.items : []);
  const [amount, setAmount] = useState(Number(tx.amount_home));
  const [pending, startTransition] = useTransition();

  function removeItem(idx: number) {
    const removed = items[idx];
    const next = items.filter((_, i) => i !== idx);
    const newAmount = Math.max(0, Number((amount - (removed?.price ?? 0)).toFixed(2)));
    // оптимістично оновлюємо UI
    setItems(next);
    setAmount(newAmount);
    startTransition(async () => {
      const res = await updateTransactionItems(tx.id, next, newAmount);
      if (!res.ok) {
        // відкат при помилці
        setItems(items);
        setAmount(amount);
      }
    });
  }

  return (
    <div className={styles.sheetWrap}>
      <div className={styles.sheetBack} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetBody}>
          <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{tx.merchant || cat}</span>
            <button className={styles.iconBtn} onClick={onClose} aria-label="Закрити">
              <Icon id="i-x" />
            </button>
          </div>

          <div className={`${styles.detAmt} ${isIncome ? styles.inc : ""}`}>
            {isIncome ? "+" : "−"}{usd(amount, 2)}
          </div>
          <div className={styles.detSub}>≈ {pln(amount, 2)}</div>

          <div>
            <div className={styles.detRow}>
              <span className={styles.detK}>Категорія</span>
              <span className={styles.detV}>
                <span style={{ background: catBg(cat), borderRadius: 8, padding: "2px 6px" }}>
                  {catEmoji(cat, isIncome)}
                </span>
                {cat}
              </span>
            </div>
            <div className={styles.detRow}>
              <span className={styles.detK}>Дата</span>
              <span className={styles.detV}>{fmtDate(tx.tx_date, tx.created_at)}</span>
            </div>
            <div className={styles.detRow}>
              <span className={styles.detK}>Рахунок</span>
              <span className={styles.detV}>{accountName}</span>
            </div>
            <div className={styles.detRow}>
              <span className={styles.detK}>Тип</span>
              <span className={styles.detV}>{isIncome ? "Дохід" : "Витрата"}</span>
            </div>
            {tx.note && (
              <div className={styles.detRow}>
                <span className={styles.detK}>Нотатка</span>
                <span className={styles.detV}>{tx.note}</span>
              </div>
            )}
          </div>

          {items.length > 0 && (
            <>
              <div className={styles.fieldLabel} style={{ marginTop: 16 }}>Позиції чека</div>
              <div className={styles.itemsEdit}>
                {items.map((it, i) => (
                  <div className={styles.itemRow} key={i}>
                    <span className={styles.itemName}>{it.name}</span>
                    <span className={styles.itemPrice}>{it.price.toFixed(2)} zł</span>
                    <button
                      className={styles.itemDel}
                      type="button"
                      onClick={() => removeItem(i)}
                      disabled={pending}
                      aria-label="Видалити позицію"
                    >
                      <Icon id="i-trash" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {photoUrl && (
            <>
              <div className={styles.fieldLabel} style={{ marginTop: 16 }}>Чек</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.detPhoto} src={photoUrl} alt="Чек" />
            </>
          )}
        </div>

        <div className={styles.sheetActions}>
          <button className={styles.btnDanger} onClick={onDelete}>Видалити</button>
          <button className={styles.btnPrimary} onClick={onEdit}>Редагувати</button>
        </div>
      </div>
    </div>
  );
}
