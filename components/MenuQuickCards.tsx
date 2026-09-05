"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/menu/menu.module.css";
import DsIcon from "@/components/ds/Icon";
import { setHideCents } from "@/app/dashboard/actions";
import { currencyMeta, type CurrencyCode } from "@/lib/currency";
import { useT, useLang } from "@/components/SettingsProvider";
import { currencyName } from "@/lib/i18n";
import CurrencySheet from "@/components/CurrencySheet";

export default function MenuQuickCards({ hideCents, currency }: { hideCents: boolean; currency: CurrencyCode }) {
  const cur = currencyMeta(currency);
  const t = useT();
  const lang = useLang();
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
    <div className={styles.quick}>
      <div className={styles.quickCard}>
        <div className={styles.quickTop}>
          <span className={styles.tile}>
            <DsIcon name="BoldSecurityEye" size={20} />
          </span>
          <button
            type="button"
            className={`${styles.toggle} ${on ? styles.toggleOn : ""}`}
            onClick={toggle}
            aria-label={t("menu.hideCents")}
            aria-pressed={on}
          >
            <span className={styles.knob} />
          </button>
        </div>
        <span className={styles.quickName}>{t("menu.hideCents")}</span>
        <span className={styles.quickSub}>{on ? t("menu.hideCents.on") : t("menu.hideCents.off")}</span>
      </div>

      <button type="button" className={styles.quickCard} onClick={() => setCurOpen(true)}>
        <div className={styles.quickTop}>
          <span className={styles.tile}>
            <DsIcon name="BoldMoneyWallet" size={20} />
          </span>
        </div>
        <span className={styles.quickName}>{t("menu.currency")}</span>
        <span className={styles.quickSub}>{currencyName(cur.code, lang)}</span>
      </button>

      <CurrencySheet open={curOpen} onClose={() => setCurOpen(false)} />
    </div>
  );
}
