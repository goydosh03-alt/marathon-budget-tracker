import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CategoryView from "@/components/CategoryView";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  searchParams,
}: {
  searchParams: { cat?: string; from?: string; to?: string; type?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cat = searchParams.cat ?? "Інше";
  const type = searchParams.type === "income" ? "income" : "expense";
  const from = searchParams.from ?? "1970-01-01";
  const to = searchParams.to ?? "2999-12-31";

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const { data: txData } = await supabase
    .from("transactions")
    .select("id, account_id, type, amount_home, category, merchant, tx_date, created_at, items")
    .eq("user_id", user.id)
    .eq("category", cat)
    .eq("type", type)
    .gte("tx_date", from)
    .lte("tx_date", to)
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
    items: Array.isArray(t.items)
      ? (t.items as { name?: unknown }[]).map((it) => String(it?.name ?? ""))
      : [],
  }));

  return <CategoryView accounts={accounts ?? []} txs={txs} cat={cat} isIncome={type === "income"} />;
}
