"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { setHideCents } from "@/app/dashboard/actions";
import { currencyMeta, type CurrencyCode } from "@/lib/currency";
import CurrencySheet from "@/components/CurrencySheet";

export default function MenuQuickCards({ hideCents, currency }: { hideCents: boolean; currency: CurrencyCode }) {
  const cur = currencyMeta(currency);
  const [on, setOn] = useState(hideCents);
  const [curOpen, setCurOpen] = useState(false);
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

      <button type="button" className={styles.quickCard} onClick={() => setCurOpen(true)} style={{ textAlign: "left" }}>
        <div className={styles.quickTop}>
          <span className={styles.quickIco} style={{ background: "rgba(74,222,180,0.14)", color: "#6ee7b7" }}>
            <Icon id="i-wallet" />
          </span>
          <span className={styles.quickCur}>{cur.symbol}</span>
        </div>
        <div className={styles.quickName}>Валюта</div>
        <div className={styles.quickSub}>{cur.label}</div>
      </button>

      <CurrencySheet open={curOpen} onClose={() => setCurOpen(false)} />
    </div>
  );
}
