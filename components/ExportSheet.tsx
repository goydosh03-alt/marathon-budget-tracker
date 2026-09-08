"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import ds from "@/app/dashboard/ds.module.css";
import { Icon } from "@/components/IconSprite";
import DsIcon from "@/components/ds/Icon";
import CalendarSheet from "@/components/CalendarSheet";
import { useT } from "@/components/SettingsProvider";
import SheetPortal from "@/components/ui/SheetPortal";

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
  const t = useT();
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

  const scope = scopeLabel ?? (cat ? `${t("det.category")} «${cat}»` : t("exp.scopeAll"));
  const periodText =
    period === "all" ? t("exp.allTime") :
    period === "month" ? t("exp.thisMonth") :
    period === "year" ? t("exp.thisYear") :
    cFrom && cTo ? `${dm(cFrom)} – ${dm(cTo)}` : t("exp.pickDates");

  return (
    <SheetPortal>
      <div className={styles.sheetWrap}>
        <div data-sheet-back className={styles.sheetBack} onClick={onClose} />
        <div data-sheet className={styles.sheet}>
          <div data-vfade className={styles.sheetBody}>
            <div className={styles.sheetTitle}>{t("common.export")}</div>

            <div className={styles.sheetSub}>
              <b>{scope}</b> · <b>{periodText}</b> → {t("exp.hintTail")}
            </div>

            {!fixedType && (
              <>
                <div className={styles.fieldLabel} style={{ marginTop: 16 }}>{t("exp.what")}</div>
                <div className={`${ds.seg} ${ds.segScroll}`}>
                  <button className={`${ds.segItem} ${type === "all" ? ds.segOn : ""}`} onClick={() => setType("all")}>{t("exp.all")}</button>
                  <button className={`${ds.segItem} ${type === "expense" ? ds.segOn : ""}`} onClick={() => setType("expense")}>{t("common.expenses")}</button>
                  <button className={`${ds.segItem} ${type === "income" ? ds.segOn : ""}`} onClick={() => setType("income")}>{t("common.incomes")}</button>
                </div>
              </>
            )}

            <div className={styles.fieldLabel} style={{ marginTop: 16 }}>{t("common.period")}</div>
            <div className={`${ds.seg} ${ds.segScroll}`}>
              <button className={`${ds.segItem} ${period === "all" ? ds.segOn : ""}`} onClick={() => setPeriod("all")}>{t("exp.allTime")}</button>
              <button className={`${ds.segItem} ${period === "month" ? ds.segOn : ""}`} onClick={() => setPeriod("month")}>{t("period.month")}</button>
              <button className={`${ds.segItem} ${period === "year" ? ds.segOn : ""}`} onClick={() => setPeriod("year")}>{t("period.year")}</button>
              <span className={ds.segDiv} />
              <button className={`${ds.segIcon} ${period === "custom" ? ds.segIconOn : ""}`} aria-label={t("exp.pickDates")} onClick={() => setCalOpen(true)}>
                <DsIcon name="BoldCalendar" size={18} />
              </button>
            </div>
          </div>

          <div className={styles.sheetActions}>
            <button className={styles.btnPrimary} onClick={download} disabled={busy}>
              {busy ? t("exp.preparing") : t("exp.downloadCsv")}
            </button>
          </div>
        </div>

        {calOpen && (
          <CalendarSheet
            initialFrom={cFrom}
            initialTo={cTo}
            title={t("exp.periodTitle")}
            onApply={(f, t) => { setCFrom(f); setCTo(t); setPeriod("custom"); setCalOpen(false); }}
            onReset={() => { setCFrom(null); setCTo(null); setPeriod("all"); setCalOpen(false); }}
            onClose={() => setCalOpen(false)}
          />
        )}
      </div>
    </SheetPortal>
  );
}
