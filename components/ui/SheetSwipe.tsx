"use client";

import { useEffect } from "react";

/**
 * Свайп вниз закриває будь-який bottom sheet — один слухач на весь застосунок.
 * Не потребує правок у компонентах: шукає найближчий [data-sheet] і «натискає»
 * його підкладку [data-sheet-back], яка вже вміє закривати.
 *
 * Жест ігнорується, якщо він почався всередині елемента, що прокручується —
 * інакше свайп по списку закривав би шит замість гортання.
 */
function startedInScrollable(target: HTMLElement, sheet: HTMLElement) {
  let el: HTMLElement | null = target;
  while (el && el !== sheet) {
    const oy = getComputedStyle(el).overflowY;
    if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight + 2) return true;
    el = el.parentElement;
  }
  return false;
}

export default function SheetSwipe() {
  useEffect(() => {
    let sheet: HTMLElement | null = null;
    let startY = 0;

    function onStart(e: TouchEvent) {
      sheet = null;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const found = target.closest("[data-sheet]") as HTMLElement | null;
      if (!found) return;
      if (startedInScrollable(target, found)) return;
      sheet = found;
      startY = e.touches[0].clientY;
    }

    function onEnd(e: TouchEvent) {
      const el = sheet;
      sheet = null;
      if (!el) return;
      if (e.changedTouches[0].clientY - startY < 70) return;
      const back = el.parentElement?.querySelector("[data-sheet-back]") as HTMLElement | null;
      back?.click();
    }

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchend", onEnd);
    };
  }, []);

  // --sc-vvh = висота visualViewport. Коли відкривається клавіатура, шит більше
  // не «злітає» вгору всім тілом: стеля обмежена реальним вікном, грабер лишається
  // на місці, а контент скролиться всередині.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const root = document.documentElement;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--sc-vvh", `${Math.round(vv.height)}px`);
      });
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
      root.style.removeProperty("--sc-vvh");
    };
  }, []);

  return null;
}
