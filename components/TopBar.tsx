import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import AmountsEyeButton from "@/components/AmountsEyeButton";

// Спільна шапка: ліворуч — вміст сторінки (привітання/заголовок),
// праворуч — око (сховати суми) + сповіщення.
export default function TopBar({ children }: { children: React.ReactNode }) {
  return (
    <header className={styles.topbar}>
      {children}
      <div className={styles.topActions}>
        <AmountsEyeButton />
        <button className={styles.iconBtn} aria-label="Сповіщення">
          <Icon id="i-bell" />
        </button>
      </div>
    </header>
  );
}
