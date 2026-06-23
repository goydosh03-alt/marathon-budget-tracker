import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";

export default function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: string;
  title: string;
  hint: string;
}) {
  return (
    <div className={styles.emptyBox}>
      <div className={styles.emptyIco}>
        <Icon id={icon} />
      </div>
      <div className={styles.emptyTitle}>{title}</div>
      <div className={styles.emptyHint}>{hint}</div>
    </div>
  );
}
