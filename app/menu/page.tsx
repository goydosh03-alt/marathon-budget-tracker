import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite, Icon } from "@/components/IconSprite";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import MenuQuickCards from "@/components/MenuQuickCards";
import DonateBanner from "@/components/DonateBanner";
import ExportMenuItem from "@/components/ExportMenuItem";
import LangMenuItem from "@/components/LangMenuItem";
import { DEFAULT_CURRENCY, isCurrency } from "@/lib/currency";
import { DEFAULT_LANG, isLang, translate, type StringKey } from "@/lib/i18n";
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
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null;
  const hideCents = !!user.user_metadata?.hide_cents;
  const mc = user.user_metadata?.main_currency;
  const currency = isCurrency(mc) ? mc : DEFAULT_CURRENCY;
  const lg = user.user_metadata?.lang;
  const lang = isLang(lg) ? lg : DEFAULT_LANG;
  const t = (k: StringKey) => translate(k, lang);

  return (
    <div className={styles.screen}>
      <IconSprite />
      <TopBar>
        <span className={styles.barTitle}>{t("menu.title")}</span>
      </TopBar>

      <DonateBanner />

      <Link href="/profile" className={styles.profCardLink}>
        <div className={styles.profCardAv} style={{ overflow: "hidden" }}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initial
          )}
        </div>
        <div className={styles.profCardMid}>
          <span className={styles.profCardName}>{fullName}</span>
          <span className={styles.profCardSub}>{user.email}</span>
        </div>
        <span className={styles.profCardChev}><Icon id="i-arrow-right" /></span>
      </Link>

      <MenuQuickCards hideCents={hideCents} currency={currency} />

      <div className={styles.menuGroupLabel}>{t("menu.group.manage")}</div>
      <div className={styles.menuList}>
        <Link href="/settings" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
            <Icon id="i-cog" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>{t("menu.settings")}</span>
            <span className={styles.menuSub}>{t("menu.settings.sub")}</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
        </Link>

        <Link href="/categories" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
            <Icon id="i-list" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>{t("menu.categories")}</span>
            <span className={styles.menuSub}>{t("menu.categories.sub")}</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
        </Link>
      </div>

      <div className={styles.menuGroupLabel}>{t("menu.group.finance")}</div>
      <div className={styles.menuList}>
        <ExportMenuItem />
      </div>

      <div className={styles.menuGroupLabel}>{t("menu.group.automation")}</div>
      <div className={styles.menuList}>
        <Link href="/recurring" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(110,231,183,0.14)", color: "#6ee7b7" }}>
            <Icon id="i-repeat" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>{t("menu.recurring")}</span>
            <span className={styles.menuSub}>{t("menu.recurring.sub")}</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
        </Link>

        <Link href="/reminders" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(245,180,90,0.16)", color: "#f5c87c" }}>
            <Icon id="i-bell" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>{t("menu.reminders")}</span>
            <span className={styles.menuSub}>{t("menu.reminders.sub")}</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
        </Link>
      </div>

      <div className={styles.menuGroupLabel}>{t("menu.group.app")}</div>
      <div className={styles.menuList}>
        <LangMenuItem />

        <Link href="/soon?f=rate" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(255,205,90,0.16)", color: "#ffd45a" }}>
            <Icon id="i-star" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>{t("menu.rate")}</span>
            <span className={styles.menuSub}>{t("menu.rate.sub")}</span>
          </span>
          <span className={styles.menuSoon}>{t("common.soon")}</span>
        </Link>

        <Link href="/privacy" className={styles.menuItem}>
          <span className={styles.menuIco} style={{ background: "rgba(148,163,184,0.16)", color: "#cbd5e1" }}>
            <Icon id="i-doc" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>{t("legal.privacy")}</span>
            <span className={styles.menuSub}>{t("legal.privacy.sub")}</span>
          </span>
          <span className={styles.menuChev}><Icon id="i-arrow-right" /></span>
        </Link>
      </div>

      <BottomNav active="profile" accounts={accounts ?? []} />
    </div>
  );
}
