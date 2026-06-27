import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/ProfileClient";

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

  const provider =
    (user.app_metadata?.provider as string | undefined) ||
    (user.identities?.[0]?.provider as string | undefined) ||
    "email";

  return <ProfileClient name={fullName} email={user.email ?? ""} provider={provider} />;
}
