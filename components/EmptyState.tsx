import styles from "@/app/dashboard/dashboard.module.css";
import DsIcon from "@/components/ds/Icon";

/** Порожній стан. `icon` — назва гліфа Solar з lib/ds-icons. */
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
        <DsIcon name={icon} size={30} />
      </div>
      <div className={styles.emptyTitle}>{title}</div>
      <div className={styles.emptyHint}>{hint}</div>
    </div>
  );
}
