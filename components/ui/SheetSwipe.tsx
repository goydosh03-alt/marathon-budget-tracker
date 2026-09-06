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

  // --sc-vvh / --sc-vvt = розмір і зсув visualViewport.
  // Шит живе рівно на видимій частині вікна: клавіатура його не піднімає
  // і не з'їдає фон — він просто стає нижчим, а контент гортається.
  useEffect(() => {
    const vv = window.visualViewport;
    const root = document.documentElement;
    if (!vv) return;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--sc-vvh", `${Math.round(vv.height)}px`);
        root.style.setProperty("--sc-vvt", `${Math.round(vv.offsetTop)}px`);
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
      root.style.removeProperty("--sc-vvt");
    };
  }, []);

  // Вертикальний фейд для скрол-контейнерів у шитах ([data-vfade]):
  // контент тане в градієнт з того боку, куди ще є куди гортати.
  useEffect(() => {
    const seen = new WeakSet<Element>();

    function paint(el: HTMLElement) {
      const over = el.scrollHeight - el.clientHeight;
      const canT = over > 2 && el.scrollTop > 2;
      const canB = over > 2 && el.scrollTop < over - 2;
      el.setAttribute("data-fade-t", canT ? "1" : "0");
      el.setAttribute("data-fade-b", canB ? "1" : "0");
    }

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) paint(e.target as HTMLElement);
    });

    function scan() {
      document.querySelectorAll<HTMLElement>("[data-vfade]").forEach((el) => {
        paint(el);
        if (!seen.has(el)) {
          seen.add(el);
          ro.observe(el);
        }
      });
    }

    function onScroll(e: Event) {
      const el = e.target;
      if (el instanceof HTMLElement && el.hasAttribute("data-vfade")) paint(el);
    }

    scan();
    document.addEventListener("scroll", onScroll, true);
    const mo = new MutationObserver(() => requestAnimationFrame(scan));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      document.removeEventListener("scroll", onScroll, true);
      mo.disconnect();
      ro.disconnect();
    };
  }, []);

  return null;
}
