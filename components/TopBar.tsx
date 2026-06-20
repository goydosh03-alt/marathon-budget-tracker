import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";

// Спільна шапка: ліворуч — вміст сторінки (привітання/заголовок),
// праворуч — постійний патерн: валюта + сповіщення.
export default function TopBar({ children }: { children: React.ReactNode }) {
  return (
    <header className={styles.topbar}>
      {children}
      <div className={styles.topActions}>
        <button className={styles.curChip}>
          <span className={styles.dollar}>$</span>USD
          <Icon id="i-chev" />
        </button>
        <button className={styles.iconBtn} aria-label="Сповіщення">
          <Icon id="i-bell" />
        </button>
      </div>
    </header>
  );
}
