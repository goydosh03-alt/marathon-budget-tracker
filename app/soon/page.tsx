import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconSprite, Icon } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
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

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, name, type")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const feature = searchParams.f ?? "Ця функція";
  const active = feature === "Звіти" || feature === "Діаграми" ? "reports" : "profile";

  return (
    <div className={styles.screen}>
      <IconSprite />

      <header className={styles.topbar}>
        <Link href="/menu" className={styles.iconBtn} aria-label="Назад">
          <Icon id="i-back" />
        </Link>
        <span className={styles.barTitle} style={{ marginLeft: 12 }}>{feature}</span>
      </header>

      <EmptyState
        icon={ICONS[feature] ?? "i-star"}
        title="Скоро тут зʼявиться"
        hint={`«${feature}» ще в розробці. Ми працюємо над цим — невдовзі буде готово.`}
      />

      <BottomNav active={active} accounts={accounts ?? []} />
    </div>
  );
}
