import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CategoriesClient from "@/components/CategoriesClient";
import type { UserCategory } from "@/app/dashboard/actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const categories: UserCategory[] = Array.isArray(user.user_metadata?.categories)
    ? user.user_metadata.categories
    : [];

  return <CategoriesClient categories={categories} />;
}
