import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BudgetsView from "@/components/BudgetsView";

export const dynamic = "force-dynamic";

type BudgetRow = {
  id: string;
  type: string;
  category: string | null;
  period: string;
  start_ref: number | null;
  amount: number | string;
};
type TxRow = {
  type: string;
  amount_home: number | string;
  category: string | null;
  tx_date: string;
  created_at: string | null;
};

export default async function BudgetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // рахунки — для нижньої навігації (BottomNav)
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // бюджети користувача
  const { data: budgetRows } = await supabase
    .from("budgets")
    .select("id, type, category, period, start_ref, amount")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // витрати — залишок бюджету рахується з наявних транзакцій
  const { data: txData } = await supabase
    .from("transactions")
    .select("type, amount_home, category, tx_date, created_at")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .order("tx_date", { ascending: false });

  const budgets = ((budgetRows ?? []) as BudgetRow[]).map((b) => ({
    id: b.id,
    type: b.type === "category" ? ("category" as const) : ("overall" as const),
    category: b.category,
    period: (b.period === "day" || b.period === "week" ? b.period : "month") as
      | "day"
      | "week"
      | "month",
    startRef: b.start_ref,
    amount: Number(b.amount),
  }));

  const txs = ((txData ?? []) as TxRow[]).map((t) => ({
    amountHome: Number(t.amount_home),
    category: t.category ?? "Інше",
    date: t.tx_date,
    createdAt: t.created_at ?? "",
  }));

  return <BudgetsView accounts={accounts ?? []} budgets={budgets} txs={txs} />;
}
