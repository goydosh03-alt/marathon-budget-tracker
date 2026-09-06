"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import DsIcon from "@/components/ds/Icon";
import EmptyState from "@/components/EmptyState";
import { useT } from "@/components/SettingsProvider";

// Поки що сповіщення зберігаються локально (на пристрої).
// Структура готова під прочитані / непрочитані — наповнимо реальними подіями згодом.
type Notif = { id: string; title: string; body: string; date: string; read: boolean };

export default function NotificationsBell() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);

  useEffect(() => {
    function load() {
      try {
        const raw = localStorage.getItem("sc_notifs");
        if (raw) setItems(JSON.parse(raw));
      } catch {}
    }
    load();
    // оновлення без перезавантаження, коли RecurringRunner пише нову подію
    window.addEventListener("sc:notifs-updated", load);
    return () => window.removeEventListener("sc:notifs-updated", load);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  function persist(next: Notif[]) {
    setItems(next);
    try { localStorage.setItem("sc_notifs", JSON.stringify(next)); } catch {}
  }

  function markAllRead() {
    persist(items.map((n) => ({ ...n, read: true })));
  }

  // тап по сповіщенню: читаємо його; нагадування «запиши витрати» —
  // одразу відкриває форму додавання витрати
  function tapNotif(n: Notif) {
    persist(items.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (n.id.startsWith("rem-")) {
      setOpen(false);
      window.dispatchEvent(new CustomEvent("sc:open-add", { detail: { type: "expense" } }));
    }
  }

  return (
    <>
      <button className={styles.iconBtn} onClick={() => setOpen(true)} aria-label={t("notif.title")} style={{ position: "relative" }}>
        <DsIcon name="BoldNotificationsBell" size={20} />
        {unread > 0 && <span className={styles.notifDot} />}
      </button>

      {open && (
        <div className={styles.sheetWrap}>
          <div data-sheet-back className={styles.sheetBack} onClick={() => setOpen(false)} />
          <div data-sheet className={styles.sheet}>
            <div data-vfade className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span>{t("notif.title")}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{ background: "none", border: "none", color: "#6ee7b7", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "4px 6px" }}
                    >
                      {t("notif.markAll")}
                    </button>
                  )}
                </span>
              </div>

              {items.length === 0 ? (
                <EmptyState icon="i-bell" title={t("notif.emptyTitle")} hint={t("notif.emptyHint")} />
              ) : (
                <div className={styles.setCard}>
                  {items.map((n) => (
                    <div
                      key={n.id}
                      className={`${styles.notifRow} ${n.read ? "" : styles.notifUnread} ${styles.clickable}`}
                      onClick={() => tapNotif(n)}
                      style={{ cursor: "pointer" }}
                    >
                      {!n.read && <span className={styles.notifDot2} />}
                      <div className={styles.curMid}>
                        <span className={styles.catName2}>{n.title}</span>
                        <span className={styles.catType2}>{n.body}</span>
                      </div>
                      <span className={styles.notifDate}>{n.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
