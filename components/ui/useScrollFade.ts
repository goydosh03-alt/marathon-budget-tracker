"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Живе затемнення краю смуги, що гортається горизонтально.
 *
 * ПРАВИЛО: смуга ніколи не ріжеться — вона тане в градієнт з того боку,
 * куди ще можна прокрутити. Помістилось усе — затемнення немає.
 *
 * Слухаємо три різні джерела змін, бо кожне ловить свій випадок:
 *   scroll            — користувач гортає
 *   ResizeObserver    — змінився розмір контейнера або самого вмісту
 *   MutationObserver  — список перемалювався (категорії довантажились,
 *                       перемкнули витрата/дохід, рахунок додали)
 * Без останнього стан лишався від попереднього списку, і затемнення
 * або не з'являлось, або висіло без потреби.
 */
export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edge, setEdge] = useState({ left: false, right: false });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const scrollable = max > 1;
    setEdge((prev) => {
      const next = {
        left: scrollable && el.scrollLeft > 1,
        right: scrollable && el.scrollLeft < max - 1,
      };
      return prev.left === next.left && prev.right === next.right ? prev : next;
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };

    schedule();
    el.addEventListener("scroll", sync, { passive: true });

    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    // вміст може змінювати ширину, не змінюючи контейнер
    Array.from(el.children).forEach((c) => ro.observe(c));

    const mo = new MutationObserver(() => {
      Array.from(el.children).forEach((c) => ro.observe(c));
      schedule();
    });
    mo.observe(el, { childList: true, subtree: true, characterData: true });

    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", sync);
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [sync]);

  return { ref, ...edge };
}
