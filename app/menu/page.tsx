import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import AmountsEyeButton from "@/components/AmountsEyeButton";
import NotificationsBell from "@/components/NotificationsBell";
import MenuQuickCards from "@/components/MenuQuickCards";
import ExportMenuItem from "@/components/ExportMenuItem";
import LangMenuItem from "@/components/LangMenuItem";
import MenuRow from "@/components/ds/MenuRow";
import { DEFAULT_CURRENCY, isCurrency } from "@/lib/currency";
import { DEFAULT_LANG, isLang, translate, type StringKey } from "@/lib/i18n";
import ds from "@/app/dashboard/ds.module.css";
import m from "@/app/menu/menu.module.css";

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
    <div className={ds.screen}>
      <IconSprite />

      <div className={ds.content}>
        <header className={ds.headerbar}>
          <h1 className={m.title}>{t("menu.title")}</h1>
          <div className={`${ds.actions} ${ds.glass}`}>
            <AmountsEyeButton />
            <NotificationsBell />
          </div>
        </header>

        <Link href="/profile" className={m.profile}>
          <span className={m.profAva}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" />
            ) : (
              initial
            )}
          </span>
          <span className={m.mid}>
            <span className={m.name}>{fullName}</span>
            <span className={m.sub}>{user.email}</span>
          </span>
          <span className={m.chev}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>

        <MenuQuickCards hideCents={hideCents} currency={currency} />

        <section className={m.group}>
          <span className={m.groupLabel}>{t("menu.group.manage")}</span>
          <div className={m.list}>
            <MenuRow icon="BoldSettings" href="/settings" title={t("menu.settings")} sub={t("menu.settings.sub")} />
            <MenuRow icon="BoldEssentionalUIHamburgerMenu" href="/categories" title={t("menu.categories")} sub={t("menu.categories.sub")} />
          </div>
        </section>

        <section className={m.group}>
          <span className={m.groupLabel}>{t("menu.group.finance")}</span>
          <div className={m.list}>
            <ExportMenuItem />
          </div>
        </section>

        <section className={m.group}>
          <span className={m.groupLabel}>{t("menu.group.automation")}</span>
          <div className={m.list}>
            <MenuRow icon="BoldArrowsTransferHorizontal" href="/recurring" title={t("menu.recurring")} sub={t("menu.recurring.sub")} />
            <MenuRow icon="BoldNotificationsBell" href="/reminders" title={t("menu.reminders")} sub={t("menu.reminders.sub")} />
          </div>
        </section>

        <section className={m.group}>
          <span className={m.groupLabel}>{t("menu.group.app")}</span>
          <div className={m.list}>
            <LangMenuItem />
            <MenuRow icon="BoldAstronomyStarsMinimalistic" href="/soon?f=rate" title={t("menu.rate")} sub={t("menu.rate.sub")} badge={t("common.soon")} />
            <MenuRow icon="BoldEssentionalUICopy" href="/privacy" title={t("legal.privacy")} sub={t("legal.privacy.sub")} />
          </div>
        </section>
      </div>

      <div className={ds.scrimbar} />
      <BottomNav active="profile" accounts={accounts ?? []} />
    </div>
  );
}
