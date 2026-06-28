"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { LANGS } from "@/lib/i18n";
import { useLang, useT } from "@/components/SettingsProvider";
import LangSheet from "@/components/LangSheet";

export default function LangMenuItem() {
  const [open, setOpen] = useState(false);
  const lang = useLang();
  const t = useT();
  const cur = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <>
      <button type="button" className={styles.menuItem} onClick={() => setOpen(true)} style={{ textAlign: "left" }}>
        <span className={styles.menuIco} style={{ background: "rgba(59,180,245,0.14)", color: "#7cc8f5" }}>
          <Icon id="i-globe" />
        </span>
        <span className={styles.menuMid}>
          <span className={styles.menuName}>{t("menu.language")}</span>
          <span className={styles.menuSub}>{cur.flag} {cur.label}</span>
        </span>
        <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
      </button>
      <LangSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
