"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import { CURRENCIES, type CurrencyCode } from "@/lib/currency";
import { setMainCurrency } from "@/app/dashboard/actions";

export default function CurrencyClient({ current }: { current: CurrencyCode }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [sel, setSel] = useState<CurrencyCode>(current);

  function pick(code: CurrencyCode) {
    if (code === sel) return;
    setSel(code);
    start(async () => {
      await setMainCurrency(code);
      router.refresh();
    });
  }

  return (
    <div className={styles.screen}>
      <IconSprite />
      <SubHeader title="Основна валюта" back="/menu" />

      <div className={styles.notice}>
        <Icon id="i-wallet" />
        <div>
          Усі суми показуються в обраній валюті. Курси наразі приблизні — живий курс під'єднаємо згодом.
        </div>
      </div>

      <div className={styles.setCard}>
        {CURRENCIES.map((c) => (
          <button
            key={c.code}
            type="button"
            className={styles.remRow}
            onClick={() => pick(c.code)}
            style={{ width: "100%", background: "none", border: "none", cursor: "pointer" }}
          >
            <span className={styles.curBadge}>{c.symbol}</span>
            <div className={styles.catMid2} style={{ textAlign: "left" }}>
              <span className={styles.catName2}>{c.label}</span>
              <span className={styles.catType2}>{c.code}</span>
            </div>
            {sel === c.code && <span className={styles.curCheck}>✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
