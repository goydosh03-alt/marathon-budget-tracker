"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";

export default function ExportSheet({
  onClose,
  cat,
  type: fixedType,
  from,
  to,
  scopeLabel,
}: {
  onClose: () => void;
  cat?: string;
  type?: "expense" | "income";
  from?: string;
  to?: string;
  scopeLabel?: string;
}) {
  // якщо тип не зафіксований (експорт усього) — даємо вибір
  const [type, setType] = useState<"all" | "expense" | "income">(fixedType ?? "all");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function download() {
    setBusy(true);
    const p = new URLSearchParams();
    const t = fixedType ?? (type === "all" ? "" : type);
    if (t) p.set("type", t);
    if (cat) p.set("cat", cat);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    const url = "/api/export" + (p.toString() ? `?${p.toString()}` : "");
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => { setBusy(false); onClose(); }, 600);
  }

  const scope = scopeLabel ?? (cat ? `Категорія «${cat}»` : "Усі транзакції");

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

          <div className={styles.donateHint}>
            Вивантажуємо <b>{scope}</b> у файл <b>CSV</b> — відкриється в Excel, Google Sheets чи Numbers.
          </div>

          {!fixedType && (
            <>
              <div className={styles.fieldLabel}>Що експортувати</div>
              <div className={styles.pfilter}>
                <button className={`${styles.pf} ${type === "all" ? styles.pfOn : ""}`} onClick={() => setType("all")}>Усе</button>
                <button className={`${styles.pf} ${type === "expense" ? styles.pfOn : ""}`} onClick={() => setType("expense")}>Витрати</button>
                <button className={`${styles.pf} ${type === "income" ? styles.pfOn : ""}`} onClick={() => setType("income")}>Доходи</button>
              </div>
            </>
          )}
        </div>

        <div className={styles.sheetActions}>
          <button className={styles.btnPrimary} onClick={download} disabled={busy}>
            {busy ? "Готую файл…" : "Завантажити CSV"}
          </button>
        </div>
      </div>
    </div>
  );
}
