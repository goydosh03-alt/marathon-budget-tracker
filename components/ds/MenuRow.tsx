import Link from "next/link";
import DsIcon from "@/components/ds/Icon";
import styles from "@/app/menu/menu.module.css";

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

type Props = {
  icon: string;
  title: string;
  sub?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string;
};

/** Рядок меню за формулою системи: тайл 40 → назва/підпис → шеврон. */
export default function MenuRow({ icon, title, sub, href, onClick, badge }: Props) {
  const inner = (
    <>
      <span className={styles.tile}>
        <DsIcon name={icon} size={20} />
      </span>
      <span className={styles.mid}>
        <span className={styles.name}>{title}</span>
        {sub && <span className={styles.sub}>{sub}</span>}
      </span>
      {badge ? (
        <span className={styles.badge}>{badge}</span>
      ) : (
        <span className={styles.chev}><Chevron /></span>
      )}
    </>
  );
  if (href) {
    return <Link href={href} className={styles.row}>{inner}</Link>;
  }
  return (
    <button type="button" className={styles.row} onClick={onClick}>
      {inner}
    </button>
  );
}
