"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { addTransaction, updateTransaction, deleteTransaction, createAccount } from "@/app/dashboard/actions";
import { Icon } from "@/components/IconSprite";
import { usd } from "@/lib/currency";
import { catEmoji } from "@/lib/txui";

const EXPENSE_CATS = ["Їжа", "Кафе", "Транспорт", "Розваги", "Аптека", "Одяг", "Комунальні", "Інше"];
const INCOME_CATS = ["Зарплата", "Фриланс", "Подарунок", "Інше"];

const ACC_EMOJI: Record<string, string> = { cash: "👛", card: "💳", savings: "🏦", bank: "🏦" };
const ACC_TYPES = [
  { id: "cash", label: "Готівка" },
  { id: "card", label: "Картка" },
  { id: "savings", label: "Заощадження" },
];

export type EditTx = {
  id: string;
  type: "expense" | "income";
  amountHome: number;
  category: string;
  merchant: string;
  accountId: string;
  date: string;
};

function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
function dm(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AddTransactionForm({
  initialType,
  accounts,
  editTx,
  onClose,
}: {
  initialType: "expense" | "income";
  accounts: { id: string; name: string; type: string }[];
  editTx?: EditTx;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = !!editTx;
  const [type, setType] = useState<"expense" | "income">(editTx?.type ?? initialType);
  const [amount, setAmount] = useState(editTx ? String(editTx.amountHome) : "");
  const [category, setCategory] = useState(
    editTx?.category ?? (initialType === "income" ? "Зарплата" : "Їжа")
  );
  const [merchant, setMerchant] = useState(editTx?.merchant ?? "");
  const [accountId, setAccountId] = useState(editTx?.accountId ?? accounts[0]?.id ?? "");
  const [date, setDate] = useState(editTx?.date ?? isoOffset(0));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [showCreateAcc, setShowCreateAcc] = useState(false);
  const [newAccName, setNewAccName] = useState("");
  const [newAccType, setNewAccType] = useState("cash");

  const isIncome = type === "income";
  const cats = isIncome ? INCOME_CATS : EXPENSE_CATS;
  const parsed = parseFloat(amount.replace(",", ".")) || 0;

  const today = isoOffset(0);
  const yest = isoOffset(1);
  const dayBefore = isoOffset(2);

  // блокуємо скрол фону, поки відкрита форма
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  function switchType(t: "expense" | "income") {
    setType(t);
    if (!isEdit) setCategory(t === "income" ? "Зарплата" : "Їжа");
  }

  function save() {
    setError("");
    if (!parsed || parsed <= 0) {
      setError("Введи суму більше нуля");
      return;
    }
    startTransition(async () => {
      const payload = { type, amountHome: parsed, category, merchant, accountId, date };
      const res = editTx ? await updateTransaction(editTx.id, payload) : await addTransaction(payload);
      if (!res.ok) {
        setError(res.error ?? "Помилка збереження");
        return;
      }
      router.refresh();
      onClose();
    });
  }

  function createAcc() {
    setError("");
    if (!newAccName.trim()) {
      setError("Введи назву рахунку");
      return;
    }
    startTransition(async () => {
      const res = await createAccount({ name: newAccName, type: newAccType });
      if (!res.ok) {
        setError(res.error ?? "Помилка створення рахунку");
        return;
      }
      if (res.id) setAccountId(res.id);
      setNewAccName("");
      setShowCreateAcc(false);
      router.refresh();
    });
  }

  function remove() {
    if (!editTx) return;
    startTransition(async () => {
      const res = await deleteTransaction(editTx.id);
      if (!res.ok) {
        setError(res.error ?? "Помилка видалення");
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div className={styles.sheetWrap}>
      <div className={styles.sheetBack} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetBody}>
        <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{isEdit ? "Редагувати транзакцію" : "Додати транзакцію"}</span>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Закрити">
            <Icon id="i-x" />
          </button>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${type === "expense" ? styles.tabOnExp : ""}`} onClick={() => switchType("expense")}>
            Витрата
          </button>
          <button className={`${styles.tab} ${type === "income" ? styles.tabOnInc : ""}`} onClick={() => switchType("income")}>
            Дохід
          </button>
        </div>

        <div className={styles.amtWrap}>
          {!isIncome && (
            <button className={styles.scanBtn} type="button" title="Скоро">
              <Icon id="i-scan" /> Скан
            </button>
          )}
          <div className={styles.amtRow}>
            <input
              className={styles.amtField}
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: `${Math.max(1, amount.length || 1)}ch` }}
              autoFocus
            />
            <span className={styles.amtZl}>zł</span>
          </div>
          <div className={styles.amtConv}>≈ {usd(parsed, 2)}</div>
        </div>

        <div className={styles.fieldLabel}>Категорія</div>
        <div className={styles.chips2}>
          {cats.map((c) => (
            <button
              key={c}
              className={`${styles.chip2} ${category === c ? styles.chip2On : ""}`}
              onClick={() => setCategory(c)}
            >
              {catEmoji(c, isIncome)} {c}
            </button>
          ))}
        </div>

        <div className={styles.fieldLabel}>Рахунок</div>
        <div className={styles.accChips}>
          {accounts.map((a) => (
            <button
              key={a.id}
              className={`${styles.accChip} ${accountId === a.id ? styles.accChipOn : ""}`}
              onClick={() => setAccountId(a.id)}
            >
              {ACC_EMOJI[a.type] ?? "👛"} {a.name}
            </button>
          ))}
          <button
            className={`${styles.accChip} ${styles.accAddChip}`}
            onClick={() => setShowCreateAcc((v) => !v)}
            aria-label="Додати рахунок"
          >
            ＋
          </button>
        </div>

        {showCreateAcc && (
          <div className={styles.createAcc}>
            <input
              placeholder="Назва рахунку (напр. Картка)"
              value={newAccName}
              onChange={(e) => setNewAccName(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {ACC_TYPES.map((t) => (
                <button
                  key={t.id}
                  className={`${styles.accChip} ${newAccType === t.id ? styles.accChipOn : ""}`}
                  onClick={() => setNewAccType(t.id)}
                >
                  {ACC_EMOJI[t.id]} {t.label}
                </button>
              ))}
            </div>
            <div className={styles.createAccRow}>
              <button className={styles.btnPrimary} onClick={createAcc} disabled={pending}>
                Створити рахунок
              </button>
            </div>
          </div>
        )}

        <div className={styles.fieldLabel}>Дата</div>
        <div className={styles.daysRow}>
          <button className={`${styles.dayBtn} ${date === today ? styles.dayBtnOn : ""}`} onClick={() => setDate(today)}>
            <b>Сьогодні</b><span>{dm(today)}</span>
          </button>
          <button className={`${styles.dayBtn} ${date === yest ? styles.dayBtnOn : ""}`} onClick={() => setDate(yest)}>
            <b>Вчора</b><span>{dm(yest)}</span>
          </button>
          <button className={`${styles.dayBtn} ${date === dayBefore ? styles.dayBtnOn : ""}`} onClick={() => setDate(dayBefore)}>
            <b>Позавчора</b><span>{dm(dayBefore)}</span>
          </button>
          <label className={styles.dayCalBtn}>
            <Icon id="i-cal" />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <div className={styles.fcard}>
          <div className={styles.fcIcon} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
            <Icon id="i-edit" />
          </div>
          <input
            placeholder={isIncome ? "Назва (напр. Зарплата)" : "Назва (напр. Biedronka)"}
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>

        {error && <div className={styles.errMsg}>{error}</div>}
        </div>

        <div className={styles.sheetActions}>
          {isEdit && (
            <button className={styles.btnGhost} onClick={remove} disabled={pending}>Видалити</button>
          )}
          <button className={styles.btnPrimary} onClick={save} disabled={pending}>
            {pending ? "Зберігаю..." : "Зберегти"}
          </button>
        </div>
      </div>
    </div>
  );
}
