"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { evalExpr, trimNum } from "@/lib/calc";
import { useT, useCurrency } from "@/components/SettingsProvider";
import { currencyMeta } from "@/lib/currency";
import SheetPortal from "@/components/ui/SheetPortal";

export default function CalcSheet({
  title,
  initial,
  onApply,
  onClose,
  showSplit = true,
}: {
  title: string;
  initial: number;
  onApply: (value: number) => void;
  onClose: () => void;
  showSplit?: boolean;
}) {
  const t = useT();
  const sym = currencyMeta(useCurrency()).symbol;
  const [expr, setExpr] = useState(initial ? trimNum(initial) : "");

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const result = evalExpr(expr);
  const press = (t: string) => setExpr((e) => e + t);
  const backspace = () => setExpr((e) => e.slice(0, -1));
  const clear = () => setExpr("");
  const split = (n: number) => setExpr(`${trimNum(result ?? 0)}/${n}`);

  const digits = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];

  return (
    <SheetPortal>
      <div className={styles.sheetWrap}>
        <div data-sheet-back className={styles.sheetBack} onClick={onClose} />
        <div data-sheet className={styles.sheet}>
          <div data-vfade className={styles.sheetBody}>
            <div className={styles.sheetTitle}>{title || t("calc.sum")}</div>

            <div className={styles.calcDisp}>
              <div className={styles.calcExpr}>{expr || "0"}</div>
              <div className={styles.calcRes}>{result !== null ? trimNum(result) : "—"} {sym}</div>
            </div>

            <div className={styles.calcGrid}>
              {showSplit ? (
                <>
                  <button className={`${styles.calcKey} ${styles.calcSplit}`} onClick={() => split(2)}>÷2</button>
                  <button className={`${styles.calcKey} ${styles.calcSplit}`} onClick={() => split(3)}>÷3</button>
                  <button className={`${styles.calcKey} ${styles.calcSplit}`} onClick={() => split(4)}>÷4</button>
                  <button className={styles.calcKey} onClick={clear} aria-label={t("common.clear")}>C</button>
                </>
              ) : (
                <button className={styles.calcKey} style={{ gridColumn: "1 / -1" }} onClick={clear}>
                  {t("common.clear")}
                </button>
              )}

              <button className={styles.calcKey} onClick={() => press("7")}>7</button>
              <button className={styles.calcKey} onClick={() => press("8")}>8</button>
              <button className={styles.calcKey} onClick={() => press("9")}>9</button>
              <button className={`${styles.calcKey} ${styles.calcOp}`} onClick={() => press("/")}>÷</button>

              <button className={styles.calcKey} onClick={() => press("4")}>4</button>
              <button className={styles.calcKey} onClick={() => press("5")}>5</button>
              <button className={styles.calcKey} onClick={() => press("6")}>6</button>
              <button className={`${styles.calcKey} ${styles.calcOp}`} onClick={() => press("*")}>×</button>

              <button className={styles.calcKey} onClick={() => press("1")}>1</button>
              <button className={styles.calcKey} onClick={() => press("2")}>2</button>
              <button className={styles.calcKey} onClick={() => press("3")}>3</button>
              <button className={`${styles.calcKey} ${styles.calcOp}`} onClick={() => press("-")}>−</button>

              <button className={styles.calcKey} onClick={() => press(".")}>.</button>
              <button className={styles.calcKey} onClick={() => press("0")}>0</button>
              <button className={styles.calcKey} onClick={backspace} aria-label={t("calc.erase")}>⌫</button>
              <button className={`${styles.calcKey} ${styles.calcOp}`} onClick={() => press("+")}>+</button>
            </div>
          </div>

          <div className={styles.sheetActions}>
            <button
              className={styles.btnPrimary}
              disabled={result === null || result < 0}
              onClick={() => result !== null && onApply(Number(result.toFixed(2)))}
            >
              {t("common.apply")}
            </button>
          </div>
        </div>
      </div>
    </SheetPortal>
  );
}
