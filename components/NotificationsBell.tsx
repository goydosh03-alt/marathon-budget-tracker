"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
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

  function markAllRead() {
    const next = items.map((n) => ({ ...n, read: true }));
    setItems(next);
    try { localStorage.setItem("sc_notifs", JSON.stringify(next)); } catch {}
  }

  return (
    <>
      <button className={styles.iconBtn} onClick={() => setOpen(true)} aria-label={t("notif.title")} style={{ position: "relative" }}>
        <Icon id="i-bell" />
        {unread > 0 && <span className={styles.notifDot} />}
      </button>

      {open && (
        <div className={styles.sheetWrap}>
          <div className={styles.sheetBack} onClick={() => setOpen(false)} />
          <div className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{t("notif.title")}</span>
                <button className={styles.iconBtn} onClick={() => setOpen(false)} aria-label={t("common.close")}>
                  <Icon id="i-x" />
                </button>
              </div>

              {items.length === 0 ? (
                <EmptyState icon="i-bell" title={t("notif.emptyTitle")} hint={t("notif.emptyHint")} />
              ) : (
                <>
                  {unread > 0 && (
                    <button className={styles.notifMarkAll} onClick={markAllRead}>{t("notif.markAll")}</button>
                  )}
                  <div className={styles.setCard}>
                    {items.map((n) => (
                      <div key={n.id} className={`${styles.notifRow} ${n.read ? "" : styles.notifUnread}`}>
                        {!n.read && <span className={styles.notifDot2} />}
                        <div className={styles.curMid}>
                          <span className={styles.catName2}>{n.title}</span>
                          <span className={styles.catType2}>{n.body}</span>
                        </div>
                        <span className={styles.notifDate}>{n.date}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
