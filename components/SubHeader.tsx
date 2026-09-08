"use client";

import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";
import ds from "@/app/dashboard/ds.module.css";
import { useT } from "@/components/SettingsProvider";

function Back() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

/**
 * Шапка підсторінки: ‹ назад + заголовок (праворуч — опційні дії).
 *
 * Іконки ЗАВЖДИ сидять у скляній пігулці — тій самій, що око й дзвіночок
 * на верхньорівневих екранах. Одна іконка чи три — контейнер один і той самий,
 * тому шапка читається однаково на будь-якій сторінці.
 */
export default function SubHeader({
  title,
  back,
  right,
}: {
  title: string;
  back: string;
  right?: React.ReactNode;
}) {
  const t = useT();
  return (
    <header className={`${styles.topbar} ${styles.subHead}`}>
      <span className={`${ds.actions} ${ds.glass}`}>
        <Link href={back} className={styles.iconBtn} aria-label={t("common.back")}>
          <Back />
        </Link>
      </span>
      <span className={styles.barTitle} style={{ flex: 1 }}>{title}</span>
      {right && <span className={`${ds.actions} ${ds.glass}`}>{right}</span>}
    </header>
  );
}
