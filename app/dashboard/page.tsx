import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

type AccountRow = {
  id: string;
  name: string;
  type: string;
  currency: string;
  opening_balance: number | null;
};
type TxRow = {
  id: string;
  account_id: string | null;
  type: string;
  amount_home: number;
  category: string | null;
  merchant: string | null;
  tx_date: string;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Налаштування — створюємо дефолтні, якщо нема
  let { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!settings) {
    await supabase.from("user_settings").insert({ user_id: user.id });
    settings = { base_currency: "USD", home_currency: "PLN", monthly_budget: null };
  }

  // 2. Рахунки — авто-створення "Готівка" при першому вході
  let { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });
  if (!accounts || accounts.length === 0) {
    await supabase
      .from("accounts")
      .insert({ user_id: user.id, name: "Готівка", type: "cash", currency: "PLN" });
    ({ data: accounts } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }));
  }
  const accs = (accounts ?? []) as AccountRow[];

  // 3. Транзакції
  const { data: txData } = await supabase
    .from("transactions")
    .select("id, account_id, type, amount_home, category, merchant, tx_date, created_at")
    .eq("user_id", user.id)
    .order("tx_date", { ascending: false })
    .order("created_at", { ascending: false });
  const txs = (txData ?? []) as TxRow[];

  // 4. Підрахунки
  const accountsOut = accs.map((a) => {
    const opening = Number(a.opening_balance ?? 0);
    const delta = txs
      .filter((t) => t.account_id === a.id)
      .reduce((s, t) => s + (t.type === "income" ? t.amount_home : -t.amount_home), 0);
    return { id: a.id, name: a.name, type: a.type, balanceHome: opening + delta };
  });

  const totalHome = accountsOut.reduce((s, a) => s + a.balanceHome, 0);

  const allTx = txs.map((t) => ({
    id: t.id,
    type: t.type,
    amountHome: Number(t.amount_home),
    category: t.category ?? "Інше",
    merchant: t.merchant ?? "",
    date: t.tx_date,
    createdAt: t.created_at,
    accountId: t.account_id ?? "",
  }));

  const name = user.email ? user.email.split("@")[0] : "друже";

  return (
    <Dashboard
      name={name}
      accounts={accountsOut}
      totalHome={totalHome}
      budgetHome={settings?.monthly_budget ?? null}
      txs={allTx}
    />
  );
}
