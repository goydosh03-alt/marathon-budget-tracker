import styles from "@/app/dashboard/dashboard.module.css";
import AmountsEyeButton from "@/components/AmountsEyeButton";
import NotificationsBell from "@/components/NotificationsBell";

// Спільна шапка: ліворуч — вміст сторінки (привітання/заголовок),
// праворуч — око (сховати суми) + сповіщення.
export default function TopBar({ children }: { children: React.ReactNode }) {
  return (
    <header className={styles.topbar}>
      {children}
      <div className={styles.topActions}>
        <AmountsEyeButton />
        <NotificationsBell />
      </div>
    </header>
  );
}
