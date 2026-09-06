"use client";

import { useMemo, useState } from "react";
import sheetStyles from "@/app/dashboard/dashboard.module.css";
import s from "@/app/dashboard/addsheet.module.css";
import DsIcon from "@/components/ds/Icon";
import { resolveCat } from "@/lib/catIcon";
import { useT, useLang, useCategories } from "@/components/SettingsProvider";
import { dataLabel } from "@/lib/i18n";

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

/** Усі категорії вертикальним списком + пошук. Відкривається з «⋯». */
export default function CategoryPickerSheet({
  cats,
  value,
  isIncome,
  onPick,
  onClose,
}: {
  cats: string[];
  value: string;
  isIncome: boolean;
  onPick: (c: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const customCats = useCategories();
  const customMap = new Map(customCats.map((c) => [c.name, c]));
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return cats;
    return cats.filter(
      (c) => c.toLowerCase().includes(needle) || dataLabel(c, lang).toLowerCase().includes(needle)
    );
  }, [cats, q, lang]);

  return (
    <div className={sheetStyles.sheetWrap}>
      <div data-sheet-back className={sheetStyles.sheetBack} onClick={onClose} />
      <div data-sheet className={sheetStyles.sheet}>
        <div className={s.search}>
          <DsIcon name="BoldSearchMagnifer" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("det.category")}
            autoFocus
          />
        </div>
        <div className={sheetStyles.sheetBody} style={{ marginTop: 12 }}>
          <div className={s.pickList}>
            {list.map((c) => {
              const look = resolveCat(c, isIncome, customMap.get(c));
              return (
                <button
                  key={c}
                  type="button"
                  className={`${s.pickRow} ${c === value ? s.pickOn : ""}`}
                  onClick={() => {
                    onPick(c);
                    onClose();
                  }}
                >
                  <span className={s.pickIco} style={{ color: look.color }}>
                    {look.icon ? <DsIcon name={look.icon} size={20} /> : look.emoji}
                  </span>
                  <span className={s.pickName}>{dataLabel(c, lang)}</span>
                  {c === value && <span className={s.pickCheck}><Check /></span>}
                </button>
              );
            })}
            {list.length === 0 && <div className={s.pickEmpty}>{t("dash.empty.exp")}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
