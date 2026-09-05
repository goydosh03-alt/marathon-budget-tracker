"use client";

import styles from "@/app/dashboard/dashboard.module.css";
import DsIcon from "@/components/ds/Icon";
import { useAmountsHidden, useToggleAmounts, useT } from "@/components/SettingsProvider";

export default function AmountsEyeButton() {
  const hidden = useAmountsHidden();
  const toggle = useToggleAmounts();
  const t = useT();
  return (
    <button
      className={styles.iconBtn}
      onClick={toggle}
      aria-label={hidden ? t("eye.show") : t("eye.hide")}
      title={hidden ? t("eye.show") : t("eye.hide")}
    >
      <span style={{ opacity: hidden ? 0.45 : 1, display: "flex" }}>
        <DsIcon name="BoldSecurityEye" size={20} />
      </span>
    </button>
  );
}
