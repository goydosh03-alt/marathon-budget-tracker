import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";

// Шапка підсторінки: ‹ назад + заголовок (праворуч — опційна іконка-дія).
// БЕЗ валюти/дзвоника. Навбару на підсторінках немає.
export default function SubHeader({
  title,
  back,
  right,
}: {
  title: string;
  back: string;
  right?: React.ReactNode;
}) {
  return (
    <header className={styles.topbar}>
      <Link href={back} className={styles.iconBtn} aria-label="Назад">
        <Icon id="i-arrow-left" />
      </Link>
      <span className={styles.barTitle} style={{ marginLeft: 12, flex: 1 }}>{title}</span>
      {right}
    </header>
  );
}
