"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import AddTransactionForm from "@/components/AddTransactionForm";

export default function BottomNav({
  active,
  accounts,
}: {
  active: "home" | "history" | "reports" | "profile";
  accounts: { id: string; name: string; type: string }[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formType, setFormType] = useState<"expense" | "income" | null>(null);

  function openForm(t: "expense" | "income") {
    setMenuOpen(false);
    setFormType(t);
  }

  return (
    <>
      {menuOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />
          <div className={styles.addmenu}>
            <button className={styles.addItem} onClick={() => openForm("income")}>
              <span className={styles.mi} style={{ background: "rgba(110,231,183,0.16)", color: "#6ee7b7" }}>
                <Icon id="i-income" />
              </span>
              Додати дохід
            </button>
            <div className={styles.menuDiv} />
            <button className={styles.addItem} onClick={() => openForm("expense")}>
              <span className={styles.mi} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
                <Icon id="i-edit" />
              </span>
              Витрата вручну
            </button>
            <button className={styles.addItem} onClick={() => openForm("expense")}>
              <span className={styles.mi} style={{ background: "rgba(59,180,245,0.16)", color: "#7cc8f5" }}>
                <Icon id="i-scan" />
              </span>
              Сканувати чек
            </button>
          </div>
        </>
      )}

      <nav className={styles.dock}>
        <div className={styles.navbar}>
          <Link href="/dashboard" className={`${styles.navItem} ${active === "home" ? styles.navOn : ""}`}>
            <Icon id="i-home" />Головна
          </Link>
          <Link href="/history" className={`${styles.navItem} ${active === "history" ? styles.navOn : ""}`}>
            <Icon id="i-list" />Історія
          </Link>
          <Link href="/dashboard" className={`${styles.navItem} ${active === "reports" ? styles.navOn : ""}`}>
            <Icon id="i-bars" />Звіти
          </Link>
          <Link href="/profile" className={`${styles.navItem} ${active === "profile" ? styles.navOn : ""}`}>
            <Icon id="i-person" />Профіль
          </Link>
        </div>
        <button
          className={`${styles.cam} ${menuOpen ? styles.camOpen : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Додати"
        >
          <Icon id="i-plus" />
        </button>
      </nav>

      {formType && (
        <AddTransactionForm initialType={formType} accounts={accounts} onClose={() => setFormType(null)} />
      )}
    </>
  );
}
