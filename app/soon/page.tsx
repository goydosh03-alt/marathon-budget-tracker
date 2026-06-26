import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import EmptyState from "@/components/EmptyState";
import styles from "@/app/dashboard/dashboard.module.css";

export const dynamic = "force-dynamic";

const ICONS: Record<string, string> = {
  Звіти: "i-bars",
  Діаграми: "i-bars",
  "Регулярні платежі": "i-repeat",
  Нагадування: "i-bell",
  "Оцінити застосунок": "i-star",
  Валюта: "i-wallet",
  Категорії: "i-list",
  Мова: "i-person",
  "Експорт даних": "i-scan",
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

  const feature = searchParams.f ?? "Ця функція";

  return (
    <div className={styles.screen}>
      <IconSprite />

      <SubHeader title={feature} back="/menu" />

      <EmptyState
        icon={ICONS[feature] ?? "i-star"}
        title="Скоро тут зʼявиться"
        hint={`«${feature}» ще в розробці. Ми працюємо над цим — невдовзі буде готово.`}
      />
    </div>
  );
}
