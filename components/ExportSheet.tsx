"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";

const PERIODS = [
  { id: "current", label: "Поточний" },
  { id: "month", label: "Місяць" },
  { id: "year", label: "Рік" },
  { id: "all", label: "Весь час" },
];

export default function ExportSheet({ onClose }: { onClose: () => void }) {
  const [fmt, setFmt] = useState<"pdf" | "excel">("pdf");
  const [period, setPeriod] = useState("current");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className={styles.sheetWrap}>
      <div className={styles.sheetBack} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetBody}>
          <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Експорт</span>
            <button className={styles.iconBtn} onClick={onClose} aria-label="Закрити">
              <Icon id="i-x" />
            </button>
          </div>

          <div className={styles.fieldLabel}>Формат</div>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${fmt === "pdf" ? styles.tabOnExp : ""}`} onClick={() => setFmt("pdf")}>
              PDF
            </button>
            <button className={`${styles.tab} ${fmt === "excel" ? styles.tabOnExp : ""}`} onClick={() => setFmt("excel")}>
              Excel
            </button>
          </div>

          <div className={styles.fieldLabel}>Період</div>
          <div className={styles.chips2}>
            {PERIODS.map((p) => (
              <button
                key={p.id}
                className={`${styles.chip2} ${period === p.id ? styles.chip2On : ""}`}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {done && (
            <div className={styles.setHint} style={{ color: "#6ee7b7" }}>
              Експорт скоро зʼявиться 🚧 Готуємо PDF та Excel.
            </div>
          )}
        </div>

        <div className={styles.sheetActions}>
          <button className={styles.btnPrimary} onClick={() => setDone(true)}>
            Завантажити {fmt === "pdf" ? "PDF" : "Excel"}
          </button>
        </div>
      </div>
    </div>
  );
}
