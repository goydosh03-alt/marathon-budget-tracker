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
      <DsIcon name={hidden ? "BoldEyeClosed" : "BoldSecurityEye"} size={20} />
    </button>
  );
}
