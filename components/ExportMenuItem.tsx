"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import ExportSheet from "@/components/ExportSheet";

export default function ExportMenuItem() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={styles.menuItem} onClick={() => setOpen(true)} style={{ textAlign: "left" }}>
        <span className={styles.menuIco} style={{ background: "rgba(245,180,90,0.16)", color: "#f5c87c" }}>
          <Icon id="i-download" />
        </span>
        <span className={styles.menuMid}>
          <span className={styles.menuName}>Експорт даних</span>
          <span className={styles.menuSub}>CSV для Excel / Sheets</span>
        </span>
        <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
      </button>
      {open && <ExportSheet onClose={() => setOpen(false)} />}
    </>
  );
}
