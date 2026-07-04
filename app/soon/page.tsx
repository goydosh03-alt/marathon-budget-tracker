import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import EmptyState from "@/components/EmptyState";
import styles from "@/app/dashboard/dashboard.module.css";
import { DEFAULT_LANG, isLang, translate } from "@/lib/i18n";

export const dynamic = "force-dynamic";

// відомі id фіч (?f=...) → ключ перекладу + іконка
const FEATURES: Record<string, { key: Parameters<typeof translate>[0]; icon: string }> = {
  rate: { key: "menu.rate", icon: "i-star" },
};

export default async function SoonPage({
  searchParams,
}: {
  searchParams: { f?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lg = user.user_metadata?.lang;
  const lang = isLang(lg) ? lg : DEFAULT_LANG;
  const known = searchParams.f ? FEATURES[searchParams.f] : undefined;
  const feature = known
    ? translate(known.key, lang)
    : searchParams.f ?? translate("soon.thisFeature", lang);

  return (
    <div className={styles.screen}>
      <IconSprite />

      <SubHeader title={feature} back="/menu" />

      <EmptyState
        icon={known?.icon ?? "i-star"}
        title={translate("soon.title", lang)}
        hint={`«${feature}» ${translate("soon.body", lang)}`}
      />
    </div>
  );
}
