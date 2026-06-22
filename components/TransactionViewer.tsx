"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTransaction, deleteTransaction } from "@/app/dashboard/actions";
import TransactionDetail from "@/components/TransactionDetail";
import AddTransactionForm from "@/components/AddTransactionForm";
import { Icon } from "@/components/IconSprite";
import styles from "@/app/dashboard/dashboard.module.css";

type Account = { id: string; name: string; type: string };

export default function TransactionViewer({
  id,
  accounts,
  onClose,
}: {
  id: string;
  accounts: Account[];
  onClose: () => void;
}) {
  const [tx, setTx] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState(false);
  const [pendingDel, setPendingDel] = useState<{ name: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    getTransaction(id).then((d) => {
      if (active) setTx(d as Record<string, unknown> | null);
    });
    return () => {
      active = false;
    };
  }, [id]);

  // якщо попап закрили/розмонтували під час відліку — прибираємо таймер
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleDelete() {
    if (!tx) return;
    const name = (tx.merchant as string) || (tx.category as string) || "запис";
    setPendingDel({ name });
    timerRef.current = setTimeout(() => {
      deleteTransaction(String(tx.id)).then(() => router.refresh());
      timerRef.current = null;
      onClose();
    }, 5000);
  }

  function undoDelete() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPendingDel(null);
    onClose();
  }

  // показуємо тільки тост «Повернути» поки йде відлік 5с
  if (pendingDel) {
    return (
      <div className={styles.toast}>
        <Icon id="i-trash" />
        <span className={styles.toastTxt}>Видалено «{pendingDel.name}»</span>
        <button className={styles.toastUndo} onClick={undoDelete}>
          Повернути
        </button>
      </div>
    );
  }

  if (!tx) return null;

  const type = tx.type === "income" ? "income" : "expense";

  if (editing) {
    return (
      <AddTransactionForm
        initialType={type}
        accounts={accounts}
        editTx={{
          id: String(tx.id),
          type,
          amountHome: Number(tx.amount_home),
          category: (tx.category as string) ?? "Інше",
          merchant: (tx.merchant as string) ?? "",
          accountId: (tx.account_id as string) ?? "",
          date: String(tx.tx_date),
        }}
        onClose={onClose}
      />
    );
  }

  const accountName = accounts.find((a) => a.id === tx.account_id)?.name ?? "—";

  return (
    <TransactionDetail
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tx={tx as any}
      accountName={accountName}
      photoUrl={null}
      onClose={onClose}
      onEdit={() => setEditing(true)}
      onDelete={handleDelete}
    />
  );
}
