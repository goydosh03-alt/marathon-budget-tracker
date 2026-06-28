import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CurrencyClient from "@/components/CurrencyClient";
import { DEFAULT_CURRENCY, isCurrency } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function CurrencyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const mc = user.user_metadata?.main_currency;
  const current = isCurrency(mc) ? mc : DEFAULT_CURRENCY;
  const cc = user.user_metadata?.convert_currency;
  const convert = isCurrency(cc) ? cc : current === "USD" ? "EUR" : "USD";

  return <CurrencyClient current={current} convert={convert} />;
}
