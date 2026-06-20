"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { addTransaction } from "@/app/dashboard/actions";

const EXPENSE_CATS = ["Їжа", "Кафе", "Транспорт", "Розваги", "Аптека", "Одяг", "Комунальні", "Інше"];
const INCOME_CATS = ["Зарплата", "Фриланс", "Подарунок", "Інше"];

export default function AddTransactionForm({
  initialType,
  accounts,
  onClose,
}: {
  initialType: "expense" | "income";
  accounts: { id: string; name: string }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [type, setType] = useState<"expense" | "income">(initialType);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(initialType === "income" ? "Зарплата" : "Їжа");
  const [merchant, setMerchant] = useState("");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const cats = type === "income" ? INCOME_CATS : EXPENSE_CATS;

  function switchType(t: "expense" | "income") {
    setType(t);
    setCategory(t === "income" ? "Зарплата" : "Їжа");
  }

  function save() {
    setError("");
    const amountHome = parseFloat(amount.replace(",", "."));
    if (!amountHome || amountHome <= 0) {
      setError("Введи суму більше нуля");
      return;
    }
    startTransition(async () => {
      const res = await addTransaction({
        type,
        amountHome,
        category,
        merchant,
        accountId,
        date,
      });
      if (!res.ok) {
        setError(res.error ?? "Помилка збереження");
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
        <div className={styles.sheetTitle}>
          {type === "income" ? "Додати дохід" : "Додати витрату"}
        </div>

        <div className={styles.segType}>
          <button className={type === "expense" ? styles.segOn : ""} onClick={() => switchType("expense")}>
            Витрата
          </button>
          <button className={type === "income" ? styles.segOn : ""} onClick={() => switchType("income")}>
            Дохід
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Сума (zł)</label>
          <input
            className={`${styles.input} ${styles.amountInput}`}
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Категорія</label>
          <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            {cats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Назва (необов'язково)</label>
          <input
            className={styles.input}
            placeholder={type === "income" ? "напр. Зарплата" : "напр. Biedronka"}
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Рахунок</label>
          <select className={styles.select} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Дата</label>
          <input className={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {error && <div className={styles.errMsg}>{error}</div>}

        <div className={styles.sheetActions}>
          <button className={styles.btnGhost} onClick={onClose}>Скасувати</button>
          <button className={styles.btnPrimary} onClick={save} disabled={pending}>
            {pending ? "Зберігаю..." : "Зберегти"}
          </button>
        </div>
      </div>
    </div>
  );
}
