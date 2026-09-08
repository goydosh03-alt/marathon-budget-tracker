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
    const st = getComputedStyle(el);
    if ((st.overflowY === "auto" || st.overflowY === "scroll") && el.scrollHeight > el.clientHeight + 2) return true;
    // горизонтальні смуги (категорії, рахунки, дати) теж «свої»:
    // жест по них не має закривати шит
    if ((st.overflowX === "auto" || st.overflowX === "scroll") && el.scrollWidth > el.clientWidth + 2) return true;
    el = el.parentElement;
  }
  return false;
}

/**
 * Після протягування браузер усе одно шле click по елементу, на якому палець
 * зупинився. На смузі категорій це відкривало чужий попап. Глушимо click,
 * якщо палець проїхав більше порога — тобто це був драг, а не тап.
 */
function useTapGuard() {
  useEffect(() => {
    let x = 0, y = 0, moved = false;
    const down = (e: TouchEvent) => { x = e.touches[0].clientX; y = e.touches[0].clientY; moved = false; };
    const move = (e: TouchEvent) => {
      const t = e.touches[0];
      if (Math.abs(t.clientX - x) > 8 || Math.abs(t.clientY - y) > 8) moved = true;
    };
    const click = (e: MouseEvent) => {
      if (!moved) return;
      moved = false;
      e.stopPropagation();
      e.preventDefault();
    };
    document.addEventListener("touchstart", down, { passive: true, capture: true });
    document.addEventListener("touchmove", move, { passive: true, capture: true });
    document.addEventListener("click", click, true);
    return () => {
      document.removeEventListener("touchstart", down, true);
      document.removeEventListener("touchmove", move, true);
      document.removeEventListener("click", click, true);
    };
  }, []);
}

export default function SheetSwipe() {
  useTapGuard();

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
        // Клавіатура забрала помітну частину вікна. Тоді home indicator нею
        // перекритий, і нижня safe-area стає зайвою смугою під шитом.
        const kb = window.innerHeight - vv.height > 120;
        root.toggleAttribute("data-kb", kb);
        if (kb) {
          root.style.setProperty("--sc-safe-b", "0px");
          root.style.setProperty("--sc-sheet-pad-bottom", "var(--sc-sheet-pad-bottom-kb)");
        } else {
          root.style.removeProperty("--sc-safe-b");
          root.style.removeProperty("--sc-sheet-pad-bottom");
        }
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
      root.style.removeProperty("--sc-safe-b");
      root.style.removeProperty("--sc-sheet-pad-bottom");
      root.removeAttribute("data-kb");
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

  // Коли клавіатура відкривається, у зоні видимості має лишитись ПОЛЕ,
  // яке заповнюють, а не те, що вгорі шита. Прокручуємо .sheetBody до нього
  // після того, як вікно вже перерахувалось.
  useEffect(() => {
    let t1 = 0, t2 = 0;

    function bring(el: HTMLElement) {
      const box = el.closest("[data-vfade]") as HTMLElement | null;
      if (!box) return;
      const b = box.getBoundingClientRect();
      const e = el.getBoundingClientRect();
      const target = box.scrollTop + (e.bottom - b.bottom) + 24;
      if (target > box.scrollTop) box.scrollTo({ top: target, behavior: "smooth" });
    }

    function onFocus(e: FocusEvent) {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)) return;
      if (!el.closest("[data-sheet]")) return;
      // двічі: одразу і після того, як клавіатура доїхала
      window.clearTimeout(t1); window.clearTimeout(t2);
      t1 = window.setTimeout(() => bring(el), 60);
      t2 = window.setTimeout(() => bring(el), 340);
    }

    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("focusin", onFocus);
      window.clearTimeout(t1); window.clearTimeout(t2);
    };
  }, []);

  // У нативній збірці (Capacitor, iPhone) системну панель над клавіатурою
  // можна прибрати одним викликом. У браузері/PWA вона системна: зі сторінки
  // не ховається — це не наш елемент.
  // Звертаємось через глобальний Capacitor.Plugins, щоб не тягнути залежність
  // у веб-збірку: якщо плагіна немає, просто нічого не станеться.
  useEffect(() => {
    type KB = { setAccessoryBarVisible?: (o: { isVisible: boolean }) => Promise<void> };
    const cap = (window as unknown as {
      Capacitor?: { isNativePlatform?: () => boolean; Plugins?: { Keyboard?: KB } };
    }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    cap.Plugins?.Keyboard?.setAccessoryBarVisible?.({ isVisible: false })?.catch(() => {});
  }, []);

  return null;
}
