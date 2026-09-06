import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportsView from "@/components/ReportsView";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  // account_id — для фільтра «Всі рахунки»;
  // created_at — щоб графік за період «День» мав розподіл усередині доби
  // (tx_date — це дата без часу).
  const { data: txData } = await supabase
    .from("transactions")
    .select("id, type, amount_home, category, tx_date, account_id, created_at")
    .eq("user_id", user.id)
    .order("tx_date", { ascending: false });

  const txs = (txData ?? []).map((t) => ({
    type: t.type as string,
    amountHome: Number(t.amount_home),
    category: (t.category as string | null) ?? "Інше",
    date: t.tx_date as string,
    accountId: (t.account_id as string | null) ?? "",
    createdAt: (t.created_at as string | null) ?? "",
  }));

  return <ReportsView accounts={accounts ?? []} txs={txs} />;
}
