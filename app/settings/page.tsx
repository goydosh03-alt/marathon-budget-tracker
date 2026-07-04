import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import SettingsClient from "@/components/SettingsClient";
import styles from "@/app/dashboard/dashboard.module.css";
import { DEFAULT_LANG, isLang, translate } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lg = user.user_metadata?.lang;
  const lang = isLang(lg) ? lg : DEFAULT_LANG;

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
      <SubHeader title={translate("menu.settings", lang)} back="/menu" />

      <SettingsClient accounts={accounts ?? []} txCount={count ?? 0} />
    </div>
  );
}
