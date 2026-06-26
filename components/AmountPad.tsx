"use client";

import { useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { evalExpr, trimNum } from "@/lib/calc";

// Клавіатура для суми: виїжджає знизу, без блюра/дисплея/«очистити».
// Пише live у поле суми (видно у формі вище), знизу ⌫ і «Застосувати».
export default function AmountPad({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const press = (t: string) => onChange(value + t);
  const backspace = () => onChange(value.slice(0, -1));

  function apply() {
    const r = evalExpr(value);
    onChange(r !== null && r >= 0 ? trimNum(r) : value);
    onClose();
  }

  return (
    <div className={styles.kbdWrap}>
      <div className={styles.kbdBack} onClick={apply} />
      <div className={styles.kbd}>
        <div className={styles.calcGrid}>
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
        <button className={styles.btnPrimary} style={{ width: "100%", marginTop: 8 }} onClick={apply}>
          Застосувати
        </button>
      </div>
    </div>
  );
}
