"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";

type Row = { id: string; title: string; value: string; badge?: string; badgeBg?: string };

const CRYPTO: Row[] = [
  { id: "usdc", title: "USDC · Ethereum (ERC-20)", value: "0x55fa6F6cC8156B3AD3E0DDBc6A2A0cF7eF8319dd", badge: "$", badgeBg: "#2775ca" },
  { id: "usdt", title: "USDT · TRON (TRC-20)", value: "TUkNL2TRBfJ4zsDdjTrXMW9rn8K2359zFH", badge: "₮", badgeBg: "#26a17b" },
];

const BANK: Row[] = [
  { id: "name", title: "Отримувач", value: "Sandor Gajdos" },
  { id: "iban", title: "IBAN", value: "BE85 9674 0671 5306" },
  { id: "bic", title: "SWIFT / BIC", value: "TRWIBEB1XXX" },
  { id: "addr", title: "Адреса банку", value: "Wise, Rue du Trône 100, 3rd floor, Brussels, 1050, Belgium" },
];

export default function DonateSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {}
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1800);
  }

  const row = (r: Row) => (
    <button key={r.id} type="button" className={styles.donateItem} onClick={() => copy(r.id, r.value)}>
      {r.badge && (
        <span className={styles.donateBadge} style={{ background: r.badgeBg }}>{r.badge}</span>
      )}
      <div className={styles.curMid}>
        <span className={styles.donateItemTitle}>{r.title}</span>
        <span className={styles.donateAddr}>{r.value}</span>
      </div>
      <span className={styles.donateCopyIco}>
        {copied === r.id ? "✓" : <Icon id="i-copy" />}
      </span>
    </button>
  );

  return (
    <div className={styles.sheetWrap}>
      <div className={styles.sheetBack} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetBody}>
          <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Підтримати автора 💛</span>
            <button className={styles.iconBtn} onClick={onClose} aria-label="Закрити">
              <Icon id="i-x" />
            </button>
          </div>

          <div className={styles.donateHint}>
            Snapcost безкоштовний, без реклами й підписок. Якщо хочеш віддячити — будь-яка сума на свій розсуд. Тапни рядок, щоб скопіювати. Дякую 🙏
          </div>

          <div className={styles.fieldLabel}>Крипто</div>
          <div className={styles.setCard}>{CRYPTO.map(row)}</div>

          <div className={styles.fieldLabel}>Банк · EUR (Wise)</div>
          <div className={styles.setCard}>{BANK.map(row)}</div>
        </div>
      </div>
    </div>
  );
}
