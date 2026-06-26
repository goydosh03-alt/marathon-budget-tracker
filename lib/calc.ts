// Безпечний обчислювач виразу (+ − × ÷ з пріоритетом), без eval.
export function evalExpr(s: string): number | null {
  const tokens = s.match(/(\d+\.?\d*|[+\-*/])/g);
  if (!tokens || tokens.length === 0) return null;
  const arr: (number | string)[] = tokens.map((t) =>
    /[+\-*/]/.test(t) ? t : parseFloat(t)
  );
  if (typeof arr[0] !== "number") return null;
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

export function trimNum(n: number): string {
  return String(Number(n.toFixed(2)));
}
