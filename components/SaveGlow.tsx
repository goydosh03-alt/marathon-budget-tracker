"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";

// Глобальний фідбек: слухає "snapcost:saved" (шлеться ПІСЛЯ закриття попапа)
// і показує світіння верхнього градієнта + тост «Додано ✓» на чистому екрані.
export default function SaveGlow() {
  const [on, setOn] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const glowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function trigger(e: Event) {
      const label = (e as CustomEvent).detail?.label ?? "Готово";
      setOn(false);
      requestAnimationFrame(() => setOn(true));
      if (glowTimer.current) clearTimeout(glowTimer.current);
      glowTimer.current = setTimeout(() => setOn(false), 3300);
      setToast(label);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2200);
    }
    window.addEventListener("snapcost:saved", trigger as EventListener);
    return () => {
      window.removeEventListener("snapcost:saved", trigger as EventListener);
      if (glowTimer.current) clearTimeout(glowTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  return (
    <>
      <div className={`${styles.saveGlow} ${on ? styles.saveGlowOn : ""}`} aria-hidden="true" />
      {toast && (
        <div className={styles.toast}>
          <span className={styles.toastCheck}>✓</span>
          <span className={styles.toastTxt}>{toast}</span>
        </div>
      )}
    </>
  );
}
