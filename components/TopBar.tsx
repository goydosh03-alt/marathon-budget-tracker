import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import CurrencyChip from "@/components/CurrencyChip";

// Спільна шапка: ліворуч — вміст сторінки (привітання/заголовок),
// праворуч — постійний патерн: валюта + сповіщення.
export default function TopBar({ children }: { children: React.ReactNode }) {
  return (
    <header className={styles.topbar}>
      {children}
      <div className={styles.topActions}>
        <CurrencyChip />
        <button className={styles.iconBtn} aria-label="Сповіщення">
          <Icon id="i-bell" />
        </button>
      </div>
    </header>
  );
}
