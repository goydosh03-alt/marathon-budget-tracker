"use client";

import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { useAmountsHidden, useToggleAmounts } from "@/components/SettingsProvider";

export default function AmountsEyeButton() {
  const hidden = useAmountsHidden();
  const toggle = useToggleAmounts();
  return (
    <button
      className={styles.iconBtn}
      onClick={toggle}
      aria-label={hidden ? "Показати суми" : "Сховати суми"}
      title={hidden ? "Показати суми" : "Сховати суми"}
    >
      <Icon id={hidden ? "i-eye-off" : "i-eye"} />
    </button>
  );
}
