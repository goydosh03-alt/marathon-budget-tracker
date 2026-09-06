"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { useT, useLang } from "@/components/SettingsProvider";
import { MONTHS_FULL, WEEKDAYS_SHORT } from "@/lib/i18n";

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function dm(isoStr: string): string {
  const [, m, d] = isoStr.split("-");
  return `${d}.${m}`;
}

export default function CalendarSheet({
  initialFrom,
  initialTo,
  onApply,
  onReset,
  onClose,
  single = false,
  title,
}: {
  initialFrom: string | null;
  initialTo: string | null;
  onApply: (from: string, to: string) => void;
  onReset: () => void;
  onClose: () => void;
  single?: boolean;
  title?: string;
}) {
  const t = useT();
  const lang = useLang();
  const sheetTitle = title ?? t("common.period");
  const base = initialFrom ? new Date(initialFrom + "T00:00:00") : new Date();
  const [year, setYear] = useState(base.getFullYear());
  const [month, setMonth] = useState(base.getMonth());
  const [from, setFrom] = useState<string | null>(initialFrom);
  const [to, setTo] = useState<string | null>(initialTo);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function pick(dateStr: string) {
    if (single) {
      setFrom(dateStr);
      setTo(dateStr);
      return;
    }
    if (!from || (from && to)) {
      setFrom(dateStr);
      setTo(null);
    } else {
      if (dateStr >= from) setTo(dateStr);
      else {
        setTo(from);
        setFrom(dateStr);
      }
    }
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Пн=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(iso(year, month, d));

  const label = single
    ? from
      ? dm(from)
      : ""
    : from && to
      ? `${dm(from)} – ${dm(to)}`
      : from
        ? `${dm(from)} – …`
        : "";

  return (
    <div className={styles.sheetWrap}>
      <div data-sheet-back className={styles.sheetBack} onClick={onClose} />
      <div data-sheet className={styles.sheet}>
        <div data-vfade className={styles.sheetBody}>
          <div className={styles.sheetTitle}>
            {sheetTitle}{label ? ` (${label})` : ""}
          </div>

          <div className={styles.calSheetHead}>
            <button className={styles.calNav} onClick={prevMonth} aria-label={t("cal.prev")}>
              <Icon id="i-arrow-left" />
            </button>
            <span className={styles.calMonth}>{MONTHS_FULL[lang][month]} {year}</span>
            <button className={styles.calNav} onClick={nextMonth} aria-label={t("cal.next")}>
              <Icon id="i-arrow-right" />
            </button>
          </div>

          <div className={styles.calWeek}>
            {WEEKDAYS_SHORT[lang].map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className={styles.calGrid}>
            {cells.map((c, i) => {
              if (!c) return <span key={`e${i}`} />;
              const isEdge = c === from || c === to;
              const isIn = from && to && c > from && c < to;
              return (
                <button
                  key={c}
                  className={`${styles.calCell} ${isEdge ? styles.calCellEdge : ""} ${isIn ? styles.calCellIn : ""}`}
                  onClick={() => pick(c)}
                >
                  {Number(c.split("-")[2])}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.sheetActions}>
          <button
            className={styles.calReset}
            onClick={() => {
              setFrom(null);
              setTo(null);
              onReset();
            }}
          >
            <Icon id="i-refresh" /> {t("cal.reset")}
          </button>
          <button
            className={styles.btnPrimary}
            disabled={!from}
            onClick={() => from && onApply(from, to ?? from)}
          >
            {t("common.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
