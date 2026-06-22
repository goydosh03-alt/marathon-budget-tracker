"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getTransaction, deleteTransaction } from "@/app/dashboard/actions";
import TransactionDetail from "@/components/TransactionDetail";
import AddTransactionForm from "@/components/AddTransactionForm";

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
  const [, startDelete] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!tx) return;
    startDelete(async () => {
      await deleteTransaction(String(tx.id));
      router.refresh();
      onClose();
    });
  }

  useEffect(() => {
    let active = true;
    getTransaction(id).then((d) => {
      if (active) setTx(d as Record<string, unknown> | null);
    });
    return () => {
      active = false;
    };
  }, [id]);

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
