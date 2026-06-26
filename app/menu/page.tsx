import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite, Icon } from "@/components/IconSprite";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import styles from "@/app/dashboard/dashboard.module.css";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
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

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : "Друже");
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className={styles.screen}>
      <IconSprite />
      <TopBar>
        <span className={styles.barTitle}>Меню</span>
      </TopBar>

      <Link href="/profile" className={styles.profCardLink}>
        <div className={styles.profAvatar}>{initial}</div>
        <div className={styles.profName}>{fullName}</div>
        <div className={styles.profEmail}>{user.email}</div>
      </Link>

      <div className={styles.menuGroupLabel}>Керування</div>
      <div className={styles.menuList}>
        <Link href="/settings" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
            <Icon id="i-cog" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Налаштування</span>
            <span className={styles.menuSub}>Рахунки, валюта, дані</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-chev" /></span>
        </Link>
      </div>

      <div className={styles.menuGroupLabel}>Аналітика</div>
      <div className={styles.menuList}>
        <Link href="/reports" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(78,150,255,0.14)", color: "#7cc8f5" }}>
            <Icon id="i-bars" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Звіти й діаграми</span>
            <span className={styles.menuSub}>Аналітика витрат за категоріями</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-chev" /></span>
        </Link>
      </div>

      <div className={styles.menuGroupLabel}>Скоро</div>
      <div className={styles.menuList}>
        <Link href="/soon?f=Регулярні платежі" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(110,231,183,0.14)", color: "#6ee7b7" }}>
            <Icon id="i-repeat" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Регулярні платежі</span>
            <span className={styles.menuSub}>Підписки й щомісячні рахунки</span>
          </span>
          <span className={styles.menuSoon}>СКОРО</span>
        </Link>

        <Link href="/soon?f=Нагадування" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(245,180,90,0.16)", color: "#f5c87c" }}>
            <Icon id="i-bell" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Нагадування</span>
            <span className={styles.menuSub}>Не забути записати витрати</span>
          </span>
          <span className={styles.menuSoon}>СКОРО</span>
        </Link>

        <Link href="/soon?f=Оцінити застосунок" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(255,205,90,0.16)", color: "#ffd45a" }}>
            <Icon id="i-star" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Оцінити застосунок</span>
            <span className={styles.menuSub}>Підтримати Snapcost</span>
          </span>
          <span className={styles.menuSoon}>СКОРО</span>
        </Link>
      </div>

      <BottomNav active="profile" accounts={accounts ?? []} />
    </div>
  );
}
