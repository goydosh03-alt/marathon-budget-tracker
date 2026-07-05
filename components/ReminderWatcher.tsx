"use client";

import { useEffect } from "react";
import type { Reminder } from "@/app/dashboard/actions";
import { useLang } from "@/components/SettingsProvider";
import { translate } from "@/lib/i18n";

// Локальний «будильник» нагадувань: працює, поки застосунок відкритий.
// (Коли застосунок закритий — сповіщення шле серверний крон через Web Push після деплою.)
// Логіка: якщо сьогодні підходить за частотою і час нагадування вже настав,
// а сьогодні ще не показували — показуємо системне сповіщення + пишемо в дзвіночок.

type Notif = { id: string; title: string; body: string; date: string; read: boolean };

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function ReminderWatcher({ reminders }: { reminders: Reminder[] }) {
  const lang = useLang();

  useEffect(() => {
    if (!reminders.length) return;

    function check() {
      const now = new Date();
      const today = isoToday();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const dow = now.getDay(); // 0 нд .. 6 сб
      const isWeekend = dow === 0 || dow === 6;

      let sent: Record<string, string> = {};
      try {
        sent = JSON.parse(localStorage.getItem("sc_rem_sent") || "{}");
      } catch {}

      let changed = false;

      for (const r of reminders) {
        if (!r.enabled) continue;
        if (sent[r.id] === today) continue;
        const freqOk =
          r.freq === "daily" ||
          (r.freq === "weekdays" && !isWeekend) ||
          (r.freq === "weekends" && isWeekend) ||
          (r.freq === "weekly" && dow === 1);
        if (!freqOk) continue;
        if (hhmm < r.time) continue; // час ще не настав

        // 1) системне сповіщення (той самий tag, що й у серверного пуша — без дублів)
        try {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(r.name || translate("push.reminderTitle", lang), {
              body: translate("push.reminderBody", lang),
              tag: "rem-" + r.id,
              icon: "/icon-192.png",
            });
          }
        } catch {}

        // 2) запис у дзвіночок
        try {
          const dd = String(now.getDate()).padStart(2, "0");
          const mm = String(now.getMonth() + 1).padStart(2, "0");
          const item: Notif = {
            id: `rem-${r.id}-${today}`,
            title: r.name || translate("push.reminderTitle", lang),
            body: translate("push.reminderBody", lang),
            date: `${dd}.${mm} ${r.time}`,
            read: false,
          };
          const raw = localStorage.getItem("sc_notifs");
          const prev: Notif[] = raw ? JSON.parse(raw) : [];
          if (!prev.some((n) => n.id === item.id)) {
            localStorage.setItem("sc_notifs", JSON.stringify([item, ...prev].slice(0, 20)));
            window.dispatchEvent(new Event("sc:notifs-updated"));
          }
        } catch {}

        sent[r.id] = today;
        changed = true;
      }

      if (changed) {
        try {
          localStorage.setItem("sc_rem_sent", JSON.stringify(sent));
        } catch {}
      }
    }

    check(); // одразу при відкритті
    const t = setInterval(check, 30000); // і кожні 30 секунд, поки відкрито
    return () => clearInterval(t);
  }, [reminders, lang]);

  return null;
}
