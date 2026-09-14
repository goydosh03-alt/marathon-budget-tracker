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
 * на верхньорівневих екранах. Кнопка 42x42, відступ до заголовка 8,
 * заголовок -> контент 24. Компоненту задавати нічого не треба.
 *
 * `back` — перехід на іншу сторінку; `onBack` — повернення всередині
 * того самого екрана (напр. деталі бюджету -> список). Виглядають однаково.
 */
export default function SubHeader({
  title,
  back,
  onBack,
  right,
}: {
  title: string;
  back?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const t = useT();
  return (
    <header className={`${styles.topbar} ${styles.subHead}`}>
      <span className={`${ds.actions} ${ds.glass}`}>
        {back ? (
          <Link href={back} className={styles.iconBtn} aria-label={t("common.back")}>
            <Back />
          </Link>
        ) : (
          <button type="button" className={styles.iconBtn} onClick={onBack} aria-label={t("common.back")}>
            <Back />
          </button>
        )}
      </span>
      <span className={styles.barTitle} style={{ flex: 1 }}>{title}</span>
      {right && <span className={`${ds.actions} ${ds.glass}`}>{right}</span>}
    </header>
  );
}
