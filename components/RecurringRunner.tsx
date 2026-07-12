"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { processRecurring } from "@/app/dashboard/actions";
import { useLang } from "@/components/SettingsProvider";
import { translate } from "@/lib/i18n";

// Тихо створює пропущені регулярні платежі при відкритті застосунку (раз)
// і пише подію у дзвіночок сповіщень (localStorage sc_notifs).
type Notif = { id: string; title: string; body: string; date: string; read: boolean };

export default function RecurringRunner() {
  const ran = useRef(false);
  const router = useRouter();
  const lang = useLang();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const nowT = new Date();
    const clientTime = `${String(nowT.getHours()).padStart(2, "0")}:${String(nowT.getMinutes()).padStart(2, "0")}`;
    processRecurring(clientTime)
      .then((r) => {
        if (r.created > 0) {
          // додаємо запис у дзвіночок
          try {
            const now = new Date();
            const dd = String(now.getDate()).padStart(2, "0");
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const hh = String(now.getHours()).padStart(2, "0");
            const mi = String(now.getMinutes()).padStart(2, "0");
            const body =
              r.created === 1
                ? translate("push.recurringOne", lang).replace(/:$/, "")
                : `${translate("push.recurringMany", lang)} ${r.created}`;
            const item: Notif = {
              id: `rec-${Date.now()}`,
              title: "Snapcost",
              body,
              date: `${dd}.${mm} ${hh}:${mi}`,
              read: false,
            };
            const raw = localStorage.getItem("sc_notifs");
            const prev: Notif[] = raw ? JSON.parse(raw) : [];
            localStorage.setItem("sc_notifs", JSON.stringify([item, ...prev].slice(0, 20)));
            window.dispatchEvent(new Event("sc:notifs-updated"));
          } catch {}
          router.refresh();
        }
      })
      .catch(() => {});
  }, [router, lang]);

  return null;
}
