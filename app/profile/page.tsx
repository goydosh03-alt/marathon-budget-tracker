import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
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

  return (
    <div className={styles.screen}>
      <IconSprite />
      <SubHeader title="Профіль" back="/menu" />

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
    </div>
  );
}
