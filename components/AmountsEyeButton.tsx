"use client";

import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
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
      <Icon id={hidden ? "i-eye-off" : "i-eye"} />
    </button>
  );
}
