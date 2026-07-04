import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";
import { DEFAULT_LANG, isLang, translate } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const lg = user.user_metadata?.lang;
  const lang = isLang(lg) ? lg : DEFAULT_LANG;
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : translate("prof.friend", lang));

  const provider =
    (user.app_metadata?.provider as string | undefined) ||
    (user.identities?.[0]?.provider as string | undefined) ||
    "email";

  return <ProfileClient name={fullName} email={user.email ?? ""} provider={provider} />;
}
