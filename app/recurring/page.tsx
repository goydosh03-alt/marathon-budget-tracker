import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RecurringClient from "@/components/RecurringClient";
import type { Recurring, UserCategory } from "@/app/dashboard/actions";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
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

  const recurring: Recurring[] = Array.isArray(user.user_metadata?.recurring) ? user.user_metadata.recurring : [];
  const categories: UserCategory[] = Array.isArray(user.user_metadata?.categories) ? user.user_metadata.categories : [];

  return <RecurringClient accounts={accounts ?? []} recurring={recurring} categories={categories} />;
}
