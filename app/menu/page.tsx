import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite, Icon } from "@/components/IconSprite";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import MenuQuickCards from "@/components/MenuQuickCards";
import DonateBanner from "@/components/DonateBanner";
import ExportMenuItem from "@/components/ExportMenuItem";
import { DEFAULT_CURRENCY, isCurrency } from "@/lib/currency";
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
  const hideCents = !!user.user_metadata?.hide_cents;
  const mc = user.user_metadata?.main_currency;
  const currency = isCurrency(mc) ? mc : DEFAULT_CURRENCY;

  return (
    <div className={styles.screen}>
      <IconSprite />
      <TopBar>
        <span className={styles.barTitle}>Меню</span>
      </TopBar>

      <DonateBanner />

      <Link href="/profile" className={styles.profCardLink}>
        <div className={styles.profCardAv}>{initial}</div>
        <div className={styles.profCardMid}>
          <span className={styles.profCardName}>{fullName}</span>
          <span className={styles.profCardSub}>{user.email}</span>
        </div>
        <span className={styles.profCardChev}><Icon id="i-arrow-right" /></span>
      </Link>

      <MenuQuickCards hideCents={hideCents} currency={currency} />

      <div className={styles.menuGroupLabel}>Керування</div>
      <div className={styles.menuList}>
        <Link href="/settings" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
            <Icon id="i-cog" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Налаштування</span>
            <span className={styles.menuSub}>Рахунки та дані</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
        </Link>

        <Link href="/categories" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
            <Icon id="i-list" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Категорії</span>
            <span className={styles.menuSub}>Свої категорії витрат</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
        </Link>
      </div>

      <div className={styles.menuGroupLabel}>Фінанси</div>
      <div className={styles.menuList}>
        <ExportMenuItem />
      </div>

      <div className={styles.menuGroupLabel}>Автоматизація</div>
      <div className={styles.menuList}>
        <Link href="/recurring" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(110,231,183,0.14)", color: "#6ee7b7" }}>
            <Icon id="i-repeat" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Регулярні платежі</span>
            <span className={styles.menuSub}>Підписки й щомісячні рахунки</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
        </Link>

        <Link href="/reminders" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(245,180,90,0.16)", color: "#f5c87c" }}>
            <Icon id="i-bell" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Нагадування</span>
            <span className={styles.menuSub}>Не забути записати витрати</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
        </Link>
      </div>

      <div className={styles.menuGroupLabel}>Застосунок</div>
      <div className={styles.menuList}>
        <Link href="/soon?f=Мова" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(59,180,245,0.14)", color: "#7cc8f5" }}>
            <Icon id="i-person" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Мова</span>
            <span className={styles.menuSub}>Українська</span>
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
