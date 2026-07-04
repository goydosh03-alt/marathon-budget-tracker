"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { currencyMeta } from "@/lib/currency";
import { useCurrency, useT } from "@/components/SettingsProvider";
import CurrencySheet from "@/components/CurrencySheet";

export default function CurrencyChip() {
  const cur = currencyMeta(useCurrency());
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className={styles.curChip} onClick={() => setOpen(true)} aria-label={t("menu.currency")}>
        <span className={styles.dollar}>{cur.symbol}</span>
        {cur.code}
        <Icon id="i-chev" />
      </button>
      <CurrencySheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
