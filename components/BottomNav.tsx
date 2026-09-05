"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/app/dashboard/ds.module.css";
import legacy from "@/app/dashboard/dashboard.module.css";
import DsIcon from "@/components/ds/Icon";
import { Icon } from "@/components/IconSprite";
import { useT } from "@/components/SettingsProvider";
import AddTransactionForm from "@/components/AddTransactionForm";

const TABS = [
  { key: "home", href: "/dashboard", icon: "BoldEssentionalUIHome2", label: "nav.home" },
  { key: "history", href: "/history", icon: "BoldTimeHistory", label: "nav.history" },
  { key: "reports", href: "/reports", icon: "BoldBusinessStatisticChart2", label: "nav.reports" },
  { key: "profile", href: "/menu", icon: "BoldEssentionalUIHamburgerMenu", label: "nav.menu" },
] as const;

export default function BottomNav({
  active,
  accounts,
}: {
  active: "home" | "history" | "reports" | "profile";
  accounts: { id: string; name: string; type: string }[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formType, setFormType] = useState<"expense" | "income" | null>(null);
  const [autoScan, setAutoScan] = useState(false);
  const t = useT();

  function openForm(type: "expense" | "income", scan = false) {
    setMenuOpen(false);
    setAutoScan(scan);
    setFormType(type);
  }

  // відкриття форми ззовні: дзвіночок, швидкі дії на головній
  useEffect(() => {
    function onOpenAdd(e: Event) {
      const detail = (e as CustomEvent).detail ?? {};
      setMenuOpen(false);
      setAutoScan(!!detail.scan);
      setFormType(detail.type === "income" ? "income" : "expense");
    }
    window.addEventListener("sc:open-add", onOpenAdd);
    return () => window.removeEventListener("sc:open-add", onOpenAdd);
  }, []);

  return (
    <>
      {menuOpen && (
        <>
          <div className={legacy.backdrop} onClick={() => setMenuOpen(false)} />
          <div className={legacy.addmenu}>
            <button className={legacy.addItem} onClick={() => openForm("income")}>
              <span className={legacy.mi} style={{ background: "rgba(95,179,127,0.16)", color: "var(--sc-accent-text)" }}>
                <Icon id="i-income" />
              </span>
              {t("nav.addIncome")}
            </button>
            <div className={legacy.menuDiv} />
            <button className={legacy.addItem} onClick={() => openForm("expense")}>
              <span className={legacy.mi} style={{ background: "rgba(181,123,238,0.16)", color: "var(--sc-cat-purple)" }}>
                <Icon id="i-edit" />
              </span>
              {t("nav.addExpense")}
            </button>
            <button className={legacy.addItem} onClick={() => openForm("expense", true)}>
              <span className={legacy.mi} style={{ background: "rgba(47,123,255,0.16)", color: "var(--sc-cat-blue)" }}>
                <Icon id="i-scan" />
              </span>
              {t("nav.scanReceipt")}
            </button>
          </div>
        </>
      )}

      <nav className={styles.dock}>
        <div className={`${styles.navpill} ${styles.glass}`}>
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              aria-label={t(tab.label)}
              aria-current={active === tab.key ? "page" : undefined}
              className={`${styles.navtab} ${active === tab.key ? styles.navtabOn : ""}`}
            >
              <DsIcon name={tab.icon} size={23} />
            </Link>
          ))}
        </div>
        <button
          className={`${styles.fab} ${menuOpen ? styles.fabOn : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={t("nav.add")}
        >
          <DsIcon name="BoldEssentionalUIAddCircle" size={28} />
        </button>
      </nav>

      {formType && (
        <AddTransactionForm
          initialType={formType}
          autoScan={autoScan}
          accounts={accounts}
          onClose={() => {
            setFormType(null);
            setAutoScan(false);
          }}
        />
      )}
    </>
  );
}
