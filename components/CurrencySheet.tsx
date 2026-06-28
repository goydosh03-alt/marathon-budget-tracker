"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { CURRENCIES, currencyMeta, type CurrencyCode } from "@/lib/currency";
import { useCurrency, useConvertCurrency, useConv } from "@/components/SettingsProvider";
import { setMainCurrency, setConvertCurrency } from "@/app/dashboard/actions";

export default function CurrencySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [, start] = useTransition();
  const ctxMain = useCurrency();
  const ctxConv = useConvertCurrency();
  const convFmt = useConv();

  const [main, setMain] = useState<CurrencyCode>(ctxMain);
  const [conv, setConv] = useState<CurrencyCode>(ctxConv);

  useEffect(() => setMain(ctxMain), [ctxMain]);
  useEffect(() => setConv(ctxConv), [ctxConv]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  function pickMain(code: CurrencyCode) {
    if (code === main) return;
    setMain(code);
    start(async () => { await setMainCurrency(code); router.refresh(); });
  }
  function pickConv(code: CurrencyCode) {
    if (code === conv) return;
    setConv(code);
    start(async () => { await setConvertCurrency(code); router.refresh(); });
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
      <div className={styles.sheetBack} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetBody}>
          <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Валюта</span>
            <button className={styles.iconBtn} onClick={onClose} aria-label="Закрити">
              <Icon id="i-x" />
            </button>
          </div>

          <div className={styles.fieldLabel}>Основна валюта</div>
          {pick(main, pickMain)}

          <div className={styles.curSwap}>
            <span className={styles.curSwapArrow}>↓</span>
            <span className={styles.curSwapRate}>1 {currencyMeta(main).symbol} ≈ {convFmt(1, 2)}</span>
          </div>

          <div className={styles.fieldLabel}>Конвертується в</div>
          {pick(conv, pickConv)}
        </div>
      </div>
    </div>
  );
}
