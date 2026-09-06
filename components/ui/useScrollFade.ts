"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Живе затемнення країв смуги, що горизонтально скролиться.
 * Показуємо його ЛИШЕ з того боку, куди ще можна прокрутити.
 * Якщо все й так помістилось — жодного затемнення.
 */
export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edge, setEdge] = useState({ left: false, right: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => {
      const max = el.scrollWidth - el.clientWidth;
      const scrollable = max > 1;
      setEdge({
        left: scrollable && el.scrollLeft > 1,
        right: scrollable && el.scrollLeft < max - 1,
      });
    };
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, []);

  return { ref, ...edge };
}
