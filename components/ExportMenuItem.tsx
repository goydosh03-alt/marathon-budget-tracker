"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { useT } from "@/components/SettingsProvider";
import ExportSheet from "@/components/ExportSheet";

export default function ExportMenuItem() {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <>
      <button type="button" className={styles.menuItem} onClick={() => setOpen(true)} style={{ textAlign: "left" }}>
        <span className={styles.menuIco} style={{ background: "rgba(245,180,90,0.16)", color: "#f5c87c" }}>
          <Icon id="i-download" />
        </span>
        <span className={styles.menuMid}>
          <span className={styles.menuName}>{t("menu.export")}</span>
          <span className={styles.menuSub}>{t("menu.export.sub")}</span>
        </span>
        <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
      </button>
      {open && <ExportSheet onClose={() => setOpen(false)} />}
    </>
  );
}
