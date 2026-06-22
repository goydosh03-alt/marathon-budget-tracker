import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite } from "@/components/IconSprite";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import styles from "@/app/dashboard/dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : "Друже");
  const initial = fullName.charAt(0).toUpperCase();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <div className={styles.screen}>
      <IconSprite />
      <TopBar>
        <span className={styles.barTitle}>Профіль</span>
      </TopBar>

      <div className={styles.profCard}>
        <div className={styles.profAvatar}>{initial}</div>
        <div className={styles.profName}>{fullName}</div>
        <div className={styles.profEmail}>{user.email}</div>
      </div>

      <form action="/auth/signout" method="post">
        <button className={styles.logoutBtn} type="submit">
          Вийти з акаунта
        </button>
      </form>

      <BottomNav active="profile" accounts={accounts ?? []} />
    </div>
  );
}
