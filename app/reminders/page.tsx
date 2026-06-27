import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RemindersClient from "@/components/RemindersClient";
import type { Reminder } from "@/app/dashboard/actions";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const reminders: Reminder[] = Array.isArray(user.user_metadata?.reminders) ? user.user_metadata.reminders : [];

  return <RemindersClient reminders={reminders} />;
}
