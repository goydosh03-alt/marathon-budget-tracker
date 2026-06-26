"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";

// Безпечний обчислювач виразу (+ − × ÷ з пріоритетом), без eval.
function evalExpr(s: string): number | null {
  const tokens = s.match(/(\d+\.?\d*|[+\-*/])/g);
  if (!tokens || tokens.length === 0) return null;
  const arr: (number | string)[] = tokens.map((t) =>
    /[+\-*/]/.test(t) ? t : parseFloat(t)
  );
  if (typeof arr[0] !== "number") return null;
  // пріоритет × ÷
  const p1: (number | string)[] = [];
  for (let k = 0; k < arr.length; k++) {
    const t = arr[k];
    if (t === "*" || t === "/") {
      const a = p1.pop();
      const b = arr[++k];
      if (typeof a !== "number" || typeof b !== "number") return null;
      p1.push(t === "*" ? a * b : b === 0 ? NaN : a / b);
    } else p1.push(t);
  }
  let res = p1[0];
  if (typeof res !== "number") return null;
  for (let k = 1; k < p1.length; k += 2) {
    const op = p1[k];
    const b = p1[k + 1];
    if (typeof b !== "number") return null;
    res = op === "+" ? res + b : res - b;
  }
  return typeof res === "number" && isFinite(res) ? res : null;
}

function trimNum(n: number): string {
  return String(Number(n.toFixed(2)));
}

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
    <div className={styles.sheetWrap}>
      <div className={styles.sheetBack} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetBody}>
          <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{title || "Сума"}</span>
            <button className={styles.iconBtn} onClick={onClose} aria-label="Закрити">
              <Icon id="i-x" />
            </button>
          </div>

          <div className={styles.calcDisp}>
            <div className={styles.calcExpr}>{expr || "0"}</div>
            <div className={styles.calcRes}>{result !== null ? trimNum(result) : "—"} zł</div>
          </div>

          <div className={styles.calcGrid}>
            {showSplit ? (
              <>
                <button className={`${styles.calcKey} ${styles.calcSplit}`} onClick={() => split(2)}>÷2</button>
                <button className={`${styles.calcKey} ${styles.calcSplit}`} onClick={() => split(3)}>÷3</button>
                <button className={`${styles.calcKey} ${styles.calcSplit}`} onClick={() => split(4)}>÷4</button>
                <button className={styles.calcKey} onClick={clear} aria-label="Очистити">C</button>
              </>
            ) : (
              <button className={styles.calcKey} style={{ gridColumn: "1 / -1" }} onClick={clear}>
                Очистити
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
            <button className={styles.calcKey} onClick={backspace} aria-label="Стерти">⌫</button>
            <button className={`${styles.calcKey} ${styles.calcOp}`} onClick={() => press("+")}>+</button>
          </div>
        </div>

        <div className={styles.sheetActions}>
          <button
            className={styles.btnPrimary}
            disabled={result === null || result < 0}
            onClick={() => result !== null && onApply(Number(result.toFixed(2)))}
          >
            Застосувати
          </button>
        </div>
      </div>
    </div>
  );
}
