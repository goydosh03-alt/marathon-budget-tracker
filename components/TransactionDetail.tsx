"use client";

import { useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { catEmoji, catBg } from "@/lib/txui";
import { dataLabel, fmtDateL } from "@/lib/i18n";
import { useDec, useMoney, useConv, useT, useLang } from "@/components/SettingsProvider";
import SheetPortal from "@/components/ui/SheetPortal";

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
  const conv = useConv();
  const t = useT();
  const lang = useLang();

  // блокуємо скрол фону, поки відкритий попап
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <SheetPortal>
      <div className={styles.sheetWrap}>
        <div data-sheet-back className={styles.sheetBack} onClick={onClose} />
        <div data-sheet className={styles.sheet}>
          <div data-vfade className={styles.sheetBody}>
            <div className={styles.sheetTitle}>{tx.merchant || dataLabel(cat, lang)}</div>

            <div className={`${styles.detAmt} ${isIncome ? styles.inc : ""}`}>
              {isIncome ? "+" : "−"}{money(amount, dec)}
            </div>
            <div className={styles.detSub}>≈ {conv(amount, dec)}</div>

            <div>
              <div className={styles.detRow}>
                <span className={styles.detK}>{t("det.category")}</span>
                <span className={styles.detV}>
                  <span style={{ background: catBg(cat), borderRadius: 8, padding: "2px 6px" }}>
                    {catEmoji(cat, isIncome)}
                  </span>
                  {dataLabel(cat, lang)}
                </span>
              </div>
              <div className={styles.detRow}>
                <span className={styles.detK}>{t("det.date")}</span>
                <span className={styles.detV}>{fmtDateL(tx.tx_date, tx.created_at, lang)}</span>
              </div>
              <div className={styles.detRow}>
                <span className={styles.detK}>{t("det.account")}</span>
                <span className={styles.detV}>{dataLabel(accountName, lang)}</span>
              </div>
              <div className={styles.detRow}>
                <span className={styles.detK}>{t("det.type")}</span>
                <span className={styles.detV}>{isIncome ? t("common.income") : t("common.expense")}</span>
              </div>
              {tx.note && (
                <div className={styles.detRow}>
                  <span className={styles.detK}>{t("det.note")}</span>
                  <span className={styles.detV}>{tx.note}</span>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <>
                <div className={styles.fieldLabel} style={{ marginTop: 16 }}>{t("det.items")}</div>
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
                <div className={styles.fieldLabel} style={{ marginTop: 16 }}>{t("det.receipt")}</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.detPhoto} src={photoUrl} alt={t("det.receipt")} />
              </>
            )}
          </div>

          <div className={styles.sheetActions}>
            <button className={styles.btnDanger} onClick={onDelete} aria-label={t("common.delete")}>
              <Icon id="i-trash" />
            </button>
            <button className={styles.btnPrimary} onClick={onEdit}>{t("common.edit")}</button>
          </div>
        </div>
      </div>
    </SheetPortal>
  );
}
