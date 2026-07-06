"use client";

// Онбординг v3: три слайди зі свайпом; мокапи = РЕАЛЬНІ скріншоти застосунку
// з public/onboarding/step1..3.png. Показується один раз новому користувачу.
import { useState, useEffect, useRef } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { useT } from "@/components/SettingsProvider";

const FLAG = "sc_onboarded";
const SHOTS = ["/onboarding/step1.png", "/onboarding/step2.png", "/onboarding/step3.png"];

export default function WelcomeSheet({ txCount }: { txCount: number }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const touch = useRef({ x: 0, y: 0 });

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

  function swipeStart(e: React.TouchEvent) {
    const p = e.touches[0];
    touch.current = { x: p.clientX, y: p.clientY };
  }
  function swipeEnd(e: React.TouchEvent) {
    const p = e.changedTouches[0];
    const dx = p.clientX - touch.current.x;
    const dy = p.clientY - touch.current.y;
    if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) setIdx((i) => Math.min(2, i + 1));
    else setIdx((i) => Math.max(0, i - 1));
  }

  if (!open) return null;

  const titles = [t("onb.s1.title"), t("onb.s2.title"), t("onb.s3.title")];
  const subs = [t("onb.s1.sub"), t("onb.s2.sub"), t("onb.s3.sub")];

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

          <div className={styles.onbView} onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
            <div className={styles.onbTrack} style={{ transform: `translateX(-${idx * 100}%)` }}>
              {SHOTS.map((src, i) => (
                <div className={styles.onbSlide} key={src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.onbShot}
                    src={src}
                    alt={titles[i]}
                    loading="eager"
                    onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.onbTitle}>{titles[idx]}</div>
          <div className={styles.onbText}>{subs[idx]}</div>

          <div className={styles.onbDots}>
            {[0, 1, 2].map((i) => (
              <button key={i} className={`${styles.onbDot} ${idx === i ? styles.onbDotOn : ""}`} onClick={() => setIdx(i)} aria-label={`${i + 1}`} />
            ))}
          </div>
        </div>

        <div className={styles.sheetActions}>
          {idx < 2 ? (
            <>
              <button className={styles.btnGhost} onClick={close}>{t("onb.skip")}</button>
              <button className={styles.btnPrimary} onClick={() => setIdx((i) => i + 1)}>{t("onb.next")}</button>
            </>
          ) : (
            <button className={styles.btnPrimary} onClick={close}>{t("onb.start")}</button>
          )}
        </div>
      </div>
    </div>
  );
}
