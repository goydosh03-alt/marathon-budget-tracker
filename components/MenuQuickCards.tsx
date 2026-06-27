"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { setHideCents } from "@/app/dashboard/actions";
import { currencyMeta, type CurrencyCode } from "@/lib/currency";

export default function MenuQuickCards({ hideCents, currency }: { hideCents: boolean; currency: CurrencyCode }) {
  const cur = currencyMeta(currency);
  const [on, setOn] = useState(hideCents);
  const [, start] = useTransition();
  const router = useRouter();

  function toggle() {
    const v = !on;
    setOn(v);
    start(async () => {
      await setHideCents(v);
      router.refresh();
    });
  }

  return (
    <div className={styles.quickCards}>
      <div className={styles.quickCard}>
        <div className={styles.quickTop}>
          <span className={styles.quickIco} style={{ background: "rgba(59,180,245,0.14)", color: "#7cc8f5" }}>
            <Icon id="i-card" />
          </span>
          <button
            type="button"
            className={`${styles.toggle} ${on ? styles.toggleOn : ""}`}
            onClick={toggle}
            aria-label="Приховати копійки"
          >
            <span className={styles.toggleKnob} />
          </button>
        </div>
        <div className={styles.quickName}>Приховати копійки</div>
        <div className={styles.quickSub}>{on ? "Без копійок" : "Показувати"}</div>
      </div>

      <Link href="/currency" className={styles.quickCard}>
        <div className={styles.quickTop}>
          <span className={styles.quickIco} style={{ background: "rgba(74,222,180,0.14)", color: "#6ee7b7" }}>
            <Icon id="i-wallet" />
          </span>
          <span className={styles.quickCur}>{cur.symbol}</span>
        </div>
        <div className={styles.quickName}>Основна валюта</div>
        <div className={styles.quickSub}>{cur.label}</div>
      </Link>
    </div>
  );
}
