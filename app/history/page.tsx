import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryList from "@/components/HistoryList";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
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

  const { data: txData } = await supabase
    .from("transactions")
    .select("id, account_id, type, amount_home, category, merchant, tx_date, created_at")
    .eq("user_id", user.id)
    .order("tx_date", { ascending: false })
    .order("created_at", { ascending: false });

  const txs = (txData ?? []).map((t) => ({
    id: t.id as string,
    accountId: (t.account_id as string | null) ?? "",
    type: t.type as string,
    amountHome: Number(t.amount_home),
    category: (t.category as string | null) ?? "Інше",
    merchant: (t.merchant as string | null) ?? "",
    date: t.tx_date as string,
    createdAt: t.created_at as string,
  }));

  return <HistoryList accounts={accounts ?? []} txs={txs} />;
}
