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

  return (
    <div className={styles.screen}>
      <IconSprite />
      <TopBar>
        <span className={styles.barTitle}>Меню</span>
      </TopBar>

      <div className={styles.menuGroupLabel}>Акаунт</div>
      <div className={styles.menuList}>
        <Link href="/profile" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(74,222,180,0.14)", color: "#6ee7b7" }}>
            <Icon id="i-person" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Профіль</span>
            <span className={styles.menuSub}>{user.email}</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-chev" /></span>
        </Link>

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

      <div className={styles.menuGroupLabel}>Скоро</div>
      <div className={styles.menuList}>
        <div className={`${styles.menuItem} ${styles.menuItemOff}`}>
          <span className={styles.menuIco} style={{ background: "rgba(78,150,255,0.14)", color: "#7cc8f5" }}>
            <Icon id="i-bars" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Діаграми</span>
            <span className={styles.menuSub}>Аналітика витрат за категоріями</span>
          </span>
          <span className={styles.menuSoon}>СКОРО</span>
        </div>

        <div className={`${styles.menuItem} ${styles.menuItemOff}`}>
          <span className={styles.menuIco} style={{ background: "rgba(110,231,183,0.14)", color: "#6ee7b7" }}>
            <Icon id="i-repeat" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Регулярні платежі</span>
            <span className={styles.menuSub}>Підписки й щомісячні рахунки</span>
          </span>
          <span className={styles.menuSoon}>СКОРО</span>
        </div>

        <div className={`${styles.menuItem} ${styles.menuItemOff}`}>
          <span className={styles.menuIco} style={{ background: "rgba(245,180,90,0.16)", color: "#f5c87c" }}>
            <Icon id="i-bell" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Нагадування</span>
            <span className={styles.menuSub}>Не забути записати витрати</span>
          </span>
          <span className={styles.menuSoon}>СКОРО</span>
        </div>

        <div className={`${styles.menuItem} ${styles.menuItemOff}`}>
          <span className={styles.menuIco} style={{ background: "rgba(255,205,90,0.16)", color: "#ffd45a" }}>
            <Icon id="i-star" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Оцінити застосунок</span>
            <span className={styles.menuSub}>Підтримати Snapcost</span>
          </span>
          <span className={styles.menuSoon}>СКОРО</span>
        </div>
      </div>

      <BottomNav active="profile" accounts={accounts ?? []} />
    </div>
  );
}
