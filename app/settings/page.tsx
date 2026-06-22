import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite } from "@/components/IconSprite";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import SettingsClient from "@/components/SettingsClient";
import styles from "@/app/dashboard/dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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

  const { count } = await supabase
    .from("transactions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return (
    <div className={styles.screen}>
      <IconSprite />
      <TopBar>
        <span className={styles.barTitle}>Налаштування</span>
      </TopBar>

      <SettingsClient accounts={accounts ?? []} txCount={count ?? 0} />

      <BottomNav active="profile" accounts={accounts ?? []} />
    </div>
  );
}
