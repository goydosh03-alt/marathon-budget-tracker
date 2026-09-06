"use client";

import s from "@/app/dashboard/addsheet.module.css";
import { trimNum } from "@/lib/calc";
import { useT } from "@/components/SettingsProvider";

/**
 * Клавіатура суми. Живе ВСЕРЕДИНІ попапа додавання — другого попапа немає:
 * нижня частина (категорія / рахунок / дата / назва) підміняється на неї.
 */
export default function AmountKeypad({
  expr,
  result,
  onExpr,
}: {
  expr: string;
  result: number | null;
  onExpr: (next: string) => void;
}) {
  const t = useT();
  const press = (k: string) => onExpr(expr + k);
  const split = (n: number) => onExpr(`${trimNum(result ?? 0)}/${n}`);

  return (
    <>
      <div className={s.padExpr}>{expr.length > 1 || /[+\-*/]/.test(expr) ? expr : ""}</div>
      <div className={s.pad}>
        <button type="button" className={`${s.key} ${s.keySplit}`} onClick={() => split(2)}>÷2</button>
        <button type="button" className={`${s.key} ${s.keySplit}`} onClick={() => split(3)}>÷3</button>
        <button type="button" className={`${s.key} ${s.keySplit}`} onClick={() => split(4)}>÷4</button>
        <button type="button" className={s.key} onClick={() => onExpr("")} aria-label={t("common.clear")}>C</button>

        <button type="button" className={s.key} onClick={() => press("7")}>7</button>
        <button type="button" className={s.key} onClick={() => press("8")}>8</button>
        <button type="button" className={s.key} onClick={() => press("9")}>9</button>
        <button type="button" className={`${s.key} ${s.keyOp}`} onClick={() => press("/")}>÷</button>

        <button type="button" className={s.key} onClick={() => press("4")}>4</button>
        <button type="button" className={s.key} onClick={() => press("5")}>5</button>
        <button type="button" className={s.key} onClick={() => press("6")}>6</button>
        <button type="button" className={`${s.key} ${s.keyOp}`} onClick={() => press("*")}>×</button>

        <button type="button" className={s.key} onClick={() => press("1")}>1</button>
        <button type="button" className={s.key} onClick={() => press("2")}>2</button>
        <button type="button" className={s.key} onClick={() => press("3")}>3</button>
        <button type="button" className={`${s.key} ${s.keyOp}`} onClick={() => press("-")}>−</button>

        <button type="button" className={s.key} onClick={() => press(".")}>.</button>
        <button type="button" className={s.key} onClick={() => press("0")}>0</button>
        <button type="button" className={s.key} onClick={() => onExpr(expr.slice(0, -1))} aria-label={t("calc.erase")}>⌫</button>
        <button type="button" className={`${s.key} ${s.keyOp}`} onClick={() => press("+")}>+</button>
      </div>
    </>
  );
}
