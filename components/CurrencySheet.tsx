"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import ds from "@/app/dashboard/ds.module.css";
import c from "@/app/currency/currency.module.css";
import DsIcon from "@/components/ds/Icon";
import SheetPortal from "@/components/ui/SheetPortal";
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
  const same = main === conv;

  function apply() {
    if (!changed) { onClose(); return; }
    start(async () => {
      if (main !== ctxMain) await setMainCurrency(main);
      if (conv !== ctxConv) await setConvertCurrency(conv);
      router.refresh();
      onClose();
    });
  }

  // Рівно три валюти, набір фіксований і завжди влазить -> первинний сегмент
  // (ділять ширину порівну). Див. DESIGN-SYSTEM.md §7.4.
  const pick = (active: CurrencyCode, on: (v: CurrencyCode) => void) => (
    <div className={`${ds.seg} ${ds.segPrimary}`}>
      {CURRENCIES.map((cur) => (
        <button
          key={cur.code}
          type="button"
          className={`${ds.segItem} ${active === cur.code ? ds.segOn : ""}`}
          onClick={() => on(cur.code)}
        >
          <span className={c.sym}>{cur.symbol}</span>
          <span className={c.code}>{cur.code}</span>
        </button>
      ))}
    </div>
  );

  return (
    <SheetPortal>
      <div className={styles.sheetWrap}>
        <div data-sheet-back className={styles.sheetBack} onClick={onClose} />
        <div data-sheet className={styles.sheet}>
          <div data-vfade className={styles.sheetBody}>
            <div className={styles.sheetTitle}>{t("menu.currency")}</div>
            <div className={styles.sheetSub}>{t("cur.sheetSub")}</div>

            <div className={styles.fieldLabel}>{t("menu.mainCurrency")}</div>
            {pick(main, setMain)}

            <div className={styles.fieldLabel}>{t("cur.convTo")}</div>
            {pick(conv, setConv)}

            <div className={`${c.rate} ${same ? c.same : ""}`} style={{ marginTop: "var(--sc-sheet-stack)" }}>
              <span className={c.rateIco}>
                <DsIcon name={same ? "BoldEyeClosed" : "BoldArrowsTransferHorizontal"} size={20} />
              </span>
              <span className={c.rateMid}>
                {same ? (
                  <>
                    <span className={c.rateVal}>{t("cur.sameTitle")}</span>
                    <span className={c.rateSub}>{t("cur.sameSub")}</span>
                  </>
                ) : (
                  <>
                    <span className={c.rateVal}>
                      1 {currencyMeta(main).symbol} ≈ {formatMoney(convert(1, main, conv, rates), conv, 2)}
                    </span>
                    <span className={c.rateSub}>{t("cur.rateSub")}</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className={styles.sheetActions}>
            <button className={styles.btnPrimary} onClick={apply} disabled={saving}>
              {saving ? t("form.saving") : changed ? t("common.apply") : t("common.done")}
            </button>
          </div>
        </div>
      </div>
    </SheetPortal>
  );
}
