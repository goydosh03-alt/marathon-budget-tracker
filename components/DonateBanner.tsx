"use client";

import { useState } from "react";
import styles from "@/app/menu/menu.module.css";
import DsIcon from "@/components/ds/Icon";
import { useT } from "@/components/SettingsProvider";
import DonateSheet from "@/components/DonateSheet";

export default function DonateBanner() {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <>
      <button type="button" className={styles.donate} onClick={() => setOpen(true)}>
        <span className={`${styles.tile} ${styles.donateTile}`}>
          <DsIcon name="BoldMoneyMoneyBag" size={20} />
        </span>
        <span className={styles.mid}>
          <span className={styles.name}>{t("menu.donate")}</span>
          <span className={styles.sub}>{t("menu.donate.sub")}</span>
        </span>
        <span className={styles.chev}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
      <DonateSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
