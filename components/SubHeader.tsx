"use client";

import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { useT } from "@/components/SettingsProvider";

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
  const t = useT();
  return (
    <header className={`${styles.topbar} ${styles.subHead}`}>
      <Link href={back} className={styles.iconBtn} aria-label={t("common.back")}>
        <Icon id="i-arrow-left" />
      </Link>
      <span className={styles.barTitle} style={{ marginLeft: 12, flex: 1 }}>{title}</span>
      {right}
    </header>
  );
}
