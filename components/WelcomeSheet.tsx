"use client";

// Онбординг: показується ОДИН раз новому користувачу (нема транзакцій + нема
// прапорця в localStorage). Три кроки — сканування, валюта, бюджет.
import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { useT } from "@/components/SettingsProvider";

const FLAG = "sc_onboarded";

export default function WelcomeSheet({ txCount }: { txCount: number }) {
  const t = useT();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (txCount === 0 && localStorage.getItem(FLAG) !== "1") setOpen(true);
    } catch {}
  }, [txCount]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function close() {
    try { localStorage.setItem(FLAG, "1"); } catch {}
    setOpen(false);
  }

  if (!open) return null;

  const steps = [
    { icon: "i-scan", bg: "rgba(59,180,245,0.16)", color: "#7cc8f5", title: t("onb.step1"), sub: t("onb.step1.sub") },
    { icon: "i-wallet", bg: "rgba(74,222,180,0.16)", color: "#6ee7b7", title: t("onb.step2"), sub: t("onb.step2.sub") },
    { icon: "i-bars", bg: "rgba(124,92,255,0.16)", color: "#b9a8ff", title: t("onb.step3"), sub: t("onb.step3.sub") },
  ];

  return (
    <div className={styles.sheetWrap}>
      <div className={styles.sheetBack} onClick={close} />
      <div className={styles.sheet}>
        <div className={styles.sheetBody}>
          <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{t("onb.welcome")}</span>
            <button className={styles.iconBtn} onClick={close} aria-label={t("common.close")}>
              <Icon id="i-x" />
            </button>
          </div>

          <div className={styles.setHint} style={{ marginTop: 2 }}>{t("onb.sub")}</div>

          <div className={styles.setCard} style={{ marginTop: 10 }}>
            {steps.map((s, i) => (
              <div className={styles.catRow2} key={i}>
                <span className={styles.catDot} style={{ background: s.bg, color: s.color }}>
                  <Icon id={s.icon} />
                </span>
                <div className={styles.catMid2}>
                  <span className={styles.catName2}>{i + 1}. {s.title}</span>
                  <span className={styles.catType2}>{s.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sheetActions}>
          <button className={styles.btnPrimary} onClick={close}>
            {t("onb.start")}
          </button>
        </div>
      </div>
    </div>
  );
}
