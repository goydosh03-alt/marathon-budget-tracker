"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { CURRENCIES, currencyMeta, convert, formatMoney, type CurrencyCode } from "@/lib/currency";
import { useCurrency, useConvertCurrency, useRates, useT } from "@/components/SettingsProvider";
import { setMainCurrency, setConvertCurrency } from "@/app/dashboard/actions";

export default function CurrencySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const t = useT();
  const [saving, start] = useTransition();
  const ctxMain = useCurrency();
  const ctxConv = useConvertCurrency();
  const rates = useRates();

  const [main, setMain] = useState<CurrencyCode>(ctxMain);
  const [conv, setConv] = useState<CurrencyCode>(ctxConv);

  // синхронізуємо з контекстом щоразу при відкритті
  useEffect(() => { if (open) { setMain(ctxMain); setConv(ctxConv); } }, [open, ctxMain, ctxConv]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  const changed = main !== ctxMain || conv !== ctxConv;
  const rateText = `1 ${currencyMeta(main).symbol} ≈ ${formatMoney(convert(1, main, conv, rates), conv, 2)}`;

  function apply() {
    if (!changed) { onClose(); return; }
    start(async () => {
      if (main !== ctxMain) await setMainCurrency(main);
      if (conv !== ctxConv) await setConvertCurrency(conv);
      router.refresh();
      onClose();
    });
  }

  const pick = (active: CurrencyCode, on: (c: CurrencyCode) => void) => (
    <div className={styles.curPick}>
      {CURRENCIES.map((c) => (
        <button
          key={c.code}
          type="button"
          className={`${styles.curPickBtn} ${active === c.code ? styles.curPickOn : ""}`}
          onClick={() => on(c.code)}
        >
          <span className={styles.curPickSym}>{c.symbol}</span>
          <span className={styles.curPickCode}>{c.code}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className={styles.sheetWrap}>
      <div data-sheet-back className={styles.sheetBack} onClick={onClose} />
      <div data-sheet className={styles.sheet}>
        <div data-vfade className={styles.sheetBody}>
          <div className={styles.sheetTitle}>{t("menu.currency")}</div>

          <div className={styles.fieldLabel}>{t("menu.mainCurrency")}</div>
          {pick(main, setMain)}

          <div className={styles.curSwap}>
            <span className={styles.curSwapArrow}>↓</span>
            <span className={styles.curSwapRate}>{rateText}</span>
          </div>

          <div className={styles.fieldLabel}>{t("cur.convTo")}</div>
          {pick(conv, setConv)}
        </div>

        <div className={styles.sheetActions}>
          <button className={styles.btnPrimary} onClick={apply} disabled={saving}>
            {saving ? t("form.saving") : changed ? t("common.apply") : t("common.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
