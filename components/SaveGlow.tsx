"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";

// Глобальне світіння-фідбек: слухає подію "snapcost:saved" і на ~2с
// підсвічує верхній градієнт. Анімується лише opacity (GPU, дешево).
export default function SaveGlow() {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function trigger() {
      setOn(false);
      requestAnimationFrame(() => setOn(true));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setOn(false), 3300);
    }
    window.addEventListener("snapcost:saved", trigger);
    return () => {
      window.removeEventListener("snapcost:saved", trigger);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return <div className={`${styles.saveGlow} ${on ? styles.saveGlowOn : ""}`} aria-hidden="true" />;
}
