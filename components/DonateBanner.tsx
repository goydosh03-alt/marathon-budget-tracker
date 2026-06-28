"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import DonateSheet from "@/components/DonateSheet";

export default function DonateBanner() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={styles.donateBanner} onClick={() => setOpen(true)}>
        <span className={styles.donateEmoji}>💛</span>
        <span className={styles.donateBmid}>
          <span className={styles.donateBname}>Підтримати автора</span>
          <span className={styles.donateBsub}>Безкоштовно, без реклами — на свій розсуд</span>
        </span>
        <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
      </button>
      <DonateSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
