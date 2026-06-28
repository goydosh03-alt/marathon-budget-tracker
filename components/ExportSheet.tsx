"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import CalendarSheet from "@/components/CalendarSheet";

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dm(s: string): string {
  const [, m, d] = s.split("-");
  return `${d}.${m}`;
}

type Period = "all" | "month" | "year" | "custom";

export default function ExportSheet({
  onClose,
  cat,
  type: fixedType,
  scopeLabel,
}: {
  onClose: () => void;
  cat?: string;
  type?: "expense" | "income";
  scopeLabel?: string;
}) {
  const [type, setType] = useState<"all" | "expense" | "income">(fixedType ?? "all");
  const [period, setPeriod] = useState<Period>("all");
  const [cFrom, setCFrom] = useState<string | null>(null);
  const [cTo, setCTo] = useState<string | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  function range(): { from: string; to: string } {
    const now = new Date();
    if (period === "month") return { from: iso(new Date(now.getFullYear(), now.getMonth(), 1)), to: iso(now) };
    if (period === "year") return { from: iso(new Date(now.getFullYear(), 0, 1)), to: iso(now) };
    if (period === "custom") return { from: cFrom ?? "", to: cTo ?? "" };
    return { from: "", to: "" };
  }

  function download() {
    setBusy(true);
    const { from, to } = range();
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
  const periodText =
    period === "all" ? "Весь час" :
    period === "month" ? "Цей місяць" :
    period === "year" ? "Цей рік" :
    cFrom && cTo ? `${dm(cFrom)} – ${dm(cTo)}` : "Обрати дати";

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
            <b>{scope}</b> · <b>{periodText}</b> → файл <b>CSV</b> (Excel / Google Sheets / Numbers).
          </div>

          {!fixedType && (
            <>
              <div className={styles.fieldLabel} style={{ marginTop: 14 }}>Що експортувати</div>
              <div className={styles.pfilter}>
                <button className={`${styles.pf} ${type === "all" ? styles.pfOn : ""}`} onClick={() => setType("all")}>Усе</button>
                <button className={`${styles.pf} ${type === "expense" ? styles.pfOn : ""}`} onClick={() => setType("expense")}>Витрати</button>
                <button className={`${styles.pf} ${type === "income" ? styles.pfOn : ""}`} onClick={() => setType("income")}>Доходи</button>
              </div>
            </>
          )}

          <div className={styles.fieldLabel} style={{ marginTop: 14 }}>Період</div>
          <div className={styles.pfilter}>
            <button className={`${styles.pf} ${period === "all" ? styles.pfOn : ""}`} onClick={() => setPeriod("all")}>Весь час</button>
            <button className={`${styles.pf} ${period === "month" ? styles.pfOn : ""}`} onClick={() => setPeriod("month")}>Місяць</button>
            <button className={`${styles.pf} ${period === "year" ? styles.pfOn : ""}`} onClick={() => setPeriod("year")}>Рік</button>
            <span className={styles.vdiv} />
            <button className={`${styles.cal} ${period === "custom" ? styles.calActive : ""}`} aria-label="Обрати дати" onClick={() => setCalOpen(true)}>
              <Icon id="i-cal" />
            </button>
          </div>
        </div>

        <div className={styles.sheetActions}>
          <button className={styles.btnPrimary} onClick={download} disabled={busy}>
            {busy ? "Готую файл…" : "Завантажити CSV"}
          </button>
        </div>
      </div>

      {calOpen && (
        <CalendarSheet
          initialFrom={cFrom}
          initialTo={cTo}
          title="Період експорту"
          onApply={(f, t) => { setCFrom(f); setCTo(t); setPeriod("custom"); setCalOpen(false); }}
          onReset={() => { setCFrom(null); setCTo(null); setPeriod("all"); setCalOpen(false); }}
          onClose={() => setCalOpen(false)}
        />
      )}
    </div>
  );
}
