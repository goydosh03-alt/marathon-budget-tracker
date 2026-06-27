"use client";

import { useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { catEmoji, catBg, fmtDate } from "@/lib/txui";
import { useDec, useMoney } from "@/components/SettingsProvider";

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
  const amount = Number(tx.amount_home);
  const items = Array.isArray(tx.items) ? tx.items : [];
  const dec = useDec();
  const money = useMoney();

  // блокуємо скрол фону, поки відкритий попап
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

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
            {isIncome ? "+" : "−"}{money(amount, dec)}
          </div>

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
                    <span className={styles.itemPrice}>{money(it.price, 2)}</span>
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
          <button className={styles.btnDanger} onClick={onDelete} aria-label="Видалити">
            <Icon id="i-trash" />
          </button>
          <button className={styles.btnPrimary} onClick={onEdit}>Редагувати</button>
        </div>
      </div>
    </div>
  );
}
