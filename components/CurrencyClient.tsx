"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { setMainCurrency, setConvertCurrency } from "@/app/dashboard/actions";

export default function CurrencyClient({
  current,
  convert,
}: {
  current: CurrencyCode;
  convert: CurrencyCode;
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const [main, setMain] = useState<CurrencyCode>(current);
  const [conv, setConv] = useState<CurrencyCode>(convert);

  function pickMain(code: CurrencyCode) {
    if (code === main) return;
    setMain(code);
    start(async () => {
      await setMainCurrency(code);
      router.refresh();
    });
  }
  function pickConv(code: CurrencyCode) {
    if (code === conv) return;
    setConv(code);
    start(async () => {
      await setConvertCurrency(code);
      router.refresh();
    });
  }

  const row = (c: (typeof CURRENCIES)[number], active: boolean, on: () => void) => (
    <button
      key={c.code}
      type="button"
      className={styles.curRow}
      onClick={on}
    >
      <span className={styles.curBadge}>{c.symbol}</span>
      <div className={styles.curMid}>
        <span className={styles.catName2}>{c.label}</span>
        <span className={styles.catType2}>{c.code}</span>
      </div>
      {active && <span className={styles.curCheck}>✓</span>}
    </button>
  );

  return (
    <div className={styles.screen}>
      <IconSprite />
      <SubHeader title="Валюта" back="/menu" />

      <div className={styles.notice}>
        <Icon id="i-wallet" />
        <div>
          Основна — у ній вводиш і бачиш суми. Друга показується поряд як «≈». Курси наразі приблизні — живий курс під'єднаємо згодом.
        </div>
      </div>

      <div className={styles.curGroupLabel}>Основна валюта</div>
      <div className={styles.setCard}>
        {CURRENCIES.map((c) => row(c, main === c.code, () => pickMain(c.code)))}
      </div>

      <div className={styles.curGroupLabel}>Друга валюта (≈)</div>
      <div className={styles.setCard}>
        {CURRENCIES.map((c) => row(c, conv === c.code, () => pickConv(c.code)))}
      </div>
    </div>
  );
}
