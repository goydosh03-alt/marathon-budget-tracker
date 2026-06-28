"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { LANGS, type Lang } from "@/lib/i18n";
import { useLang, useT } from "@/components/SettingsProvider";
import { setLanguage } from "@/app/dashboard/actions";

export default function LangSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [, start] = useTransition();
  const t = useT();
  const current = useLang();
  const [sel, setSel] = useState<Lang>(current);

  useEffect(() => setSel(current), [current]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  function pick(code: Lang) {
    if (code === sel) { onClose(); return; }
    setSel(code);
    start(async () => {
      await setLanguage(code);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className={styles.sheetWrap}>
      <div className={styles.sheetBack} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetBody}>
          <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{t("lang.title")}</span>
            <button className={styles.iconBtn} onClick={onClose} aria-label={t("common.close")}>
              <Icon id="i-x" />
            </button>
          </div>

          <div className={styles.donateHint}>{t("lang.hint")}</div>

          <div className={styles.setCard}>
            {LANGS.map((l) => (
              <button key={l.code} type="button" className={styles.curRow} onClick={() => pick(l.code)}>
                <span className={styles.langFlag}>{l.flag}</span>
                <div className={styles.curMid}>
                  <span className={styles.catName2}>{l.label}</span>
                </div>
                {sel === l.code && <span className={styles.curCheck}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
