"use client";

import { useState, useEffect } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import m from "@/app/menu/menu.module.css";
import DsIcon from "@/components/ds/Icon";
import EmptyState from "@/components/EmptyState";
import { useT } from "@/components/SettingsProvider";
import SheetPortal from "@/components/ui/SheetPortal";

// Поки що сповіщення зберігаються локально (на пристрої).
type Notif = { id: string; title: string; body: string; date: string; read: boolean };

// Вигляд рядка залежить від того, хто подію створив:
// rem-* пише ReminderWatcher, rec-* — RecurringRunner.
function look(id: string): { icon: string; color: string } {
  if (id.startsWith("rem-")) return { icon: "BoldNotificationsBell", color: "var(--sc-cat-orange)" };
  if (id.startsWith("rec-")) return { icon: "BoldArrowsTransferHorizontal", color: "var(--sc-accent-text)" };
  return { icon: "BoldEssentionalUIMenuDotsCircle", color: "var(--sc-ink-tertiary)" };
}

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
      <button
        className={styles.iconBtn}
        onClick={() => setOpen(true)}
        aria-label={t("notif.title")}
        style={{ position: "relative" }}
      >
        <DsIcon name="BoldNotificationsBell" size={20} />
        {unread > 0 && <span className={styles.notifDot} />}
      </button>

      {open && (
        <SheetPortal>
          <div className={styles.sheetWrap}>
            <div data-sheet-back className={styles.sheetBack} onClick={() => setOpen(false)} />
            <div data-sheet className={styles.sheet}>
              <div data-vfade className={styles.sheetBody}>
                <div className={styles.sheetTitle}>{t("notif.title")}</div>

                {items.length === 0 ? (
                  <EmptyState
                    icon="BoldNotificationsBell"
                    title={t("notif.emptyTitle")}
                    hint={t("notif.emptyHint")}
                  />
                ) : (
                  <div className={m.list}>
                    {items.map((n) => {
                      const l = look(n.id);
                      return (
                        <button
                          key={n.id}
                          type="button"
                          className={`${m.row} ${n.read ? styles.notifRead : ""}`}
                          onClick={() => tapNotif(n)}
                        >
                          <span className={m.tile} style={{ color: l.color }}>
                            <DsIcon name={l.icon} size={20} />
                          </span>
                          <span className={m.mid}>
                            <span className={m.name}>{n.title}</span>
                            <span className={m.sub}>{n.body}</span>
                          </span>
                          <span className={styles.notifMeta}>
                            <span className={styles.notifDate}>{n.date}</span>
                            {!n.read && <span className={styles.notifDot2} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {unread > 0 && (
                <div className={styles.sheetActions}>
                  <button className={styles.btnPrimary} onClick={markAllRead}>
                    {t("notif.markAll")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </SheetPortal>
      )}
    </>
  );
}
