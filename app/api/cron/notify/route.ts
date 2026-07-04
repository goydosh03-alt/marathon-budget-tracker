import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { USD_PER, isCurrency, type CurrencyCode } from "@/lib/currency";
import { isLang, translate, DEFAULT_LANG } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PushSub = { endpoint: string; keys: { p256dh: string; auth: string } };
type Reminder = {
  id: string;
  name: string;
  time: string;
  freq: "daily" | "weekdays" | "weekends" | "weekly";
  enabled: boolean;
  lastSent?: string;
};
type Recurring = {
  id: string;
  name: string;
  amountHome: number;
  type: "expense" | "income";
  category: string;
  accountId: string;
  dayOfMonth: number;
  startDate: string;
  autoAdd: boolean;
  lastGenerated: string | null;
};
type Notif = { title: string; body: string; url: string; tag: string };

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  // Захист: Vercel Cron шле Authorization: Bearer ${CRON_SECRET}
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const isVercelCron = req.headers.get("x-vercel-cron");
  if (secret && auth !== `Bearer ${secret}` && !isVercelCron) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!url || !serviceKey || !vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: "missing env" }, { status: 500 });
  }
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@snapcost.app", vapidPublic, vapidPrivate);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: list, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const users = list?.users ?? [];

  const now = new Date();
  const t0 = new Date(now);
  t0.setHours(0, 0, 0, 0);

  let sent = 0;

  for (const u of users) {
    const meta = (u.user_metadata || {}) as Record<string, unknown>;
    const subs: PushSub[] = Array.isArray(meta.push_subscriptions) ? (meta.push_subscriptions as PushSub[]) : [];
    if (!subs.length) continue;

    // мова користувача для текстів пушів
    const lang = isLang(meta.lang) ? meta.lang : DEFAULT_LANG;

    // місцевий час користувача (зсув у хвилинах від UTC)
    const tz = typeof meta.push_tz === "number" ? (meta.push_tz as number) : 0;
    const local = new Date(now.getTime() + tz * 60000);
    const today = isoDate(local);
    const hourLocal = local.getUTCHours();
    const dow = local.getUTCDay(); // 0 нд .. 6 сб
    const isWeekend = dow === 0 || dow === 6;

    const notifications: Notif[] = [];
    let metaChanged = false;

    // --- Регулярні платежі: дозаписати ті, що настали, і сповістити ---
    const recs: Recurring[] = Array.isArray(meta.recurring) ? (meta.recurring as Recurring[]) : [];
    const mc: CurrencyCode = isCurrency(meta.main_currency) ? (meta.main_currency as CurrencyCode) : "PLN";
    const rate = USD_PER[mc] || USD_PER.PLN;
    const inserts: Record<string, unknown>[] = [];
    const nextRecs = recs.map((r) => {
      if (!r.autoAdd) return r;
      const start = new Date((r.startDate || today) + "T00:00:00");
      const lastGen = r.lastGenerated ? new Date(r.lastGenerated + "T00:00:00") : null;
      let newLast = r.lastGenerated ?? null;
      let y = start.getFullYear();
      let m = start.getMonth();
      for (let i = 0; i < 36; i++) {
        const dim = new Date(y, m + 1, 0).getDate();
        const occ = new Date(y, m, Math.min(r.dayOfMonth, dim));
        occ.setHours(0, 0, 0, 0);
        if (occ > t0) break;
        const afterLast = lastGen ? occ > lastGen : occ >= start;
        if (afterLast && occ >= start) {
          inserts.push({
            user_id: u.id,
            account_id: r.accountId || null,
            tx_date: isoDate(occ),
            type: r.type,
            amount_home: r.amountHome,
            home_currency: mc,
            amount_base: r.amountHome * rate,
            base_currency: "USD",
            exchange_rate: rate,
            category: r.category || "Інше",
            merchant: r.name || null,
            is_confirmed: true,
          });
          newLast = isoDate(occ);
        }
        m++;
        if (m > 11) { m = 0; y++; }
      }
      if (newLast !== (r.lastGenerated ?? null)) { metaChanged = true; return { ...r, lastGenerated: newLast }; }
      return r;
    });
    if (inserts.length) {
      await admin.from("transactions").insert(inserts);
      const first = inserts[0] as { merchant?: string; category?: string };
      notifications.push({
        title: "Snapcost",
        body: inserts.length === 1
          ? `${translate("push.recurringOne", lang)} ${first.merchant || first.category}`
          : `${translate("push.recurringMany", lang)} ${inserts.length}`,
        url: "/dashboard",
        tag: "recurring",
      });
    }

    // --- Нагадування: спрацьовують у свою годину (UTC), раз на день ---
    const reminders: Reminder[] = Array.isArray(meta.reminders) ? (meta.reminders as Reminder[]) : [];
    const nextRem = reminders.map((rm) => {
      if (!rm.enabled) return rm;
      const h = parseInt((rm.time || "20:00").split(":")[0], 10);
      if (h !== hourLocal) return rm;
      const freqOk =
        rm.freq === "daily" ||
        (rm.freq === "weekdays" && !isWeekend) ||
        (rm.freq === "weekends" && isWeekend) ||
        (rm.freq === "weekly" && dow === 1);
      if (!freqOk || rm.lastSent === today) return rm;
      notifications.push({ title: rm.name || translate("push.reminderTitle", lang), body: translate("push.reminderBody", lang), url: "/dashboard", tag: "rem-" + rm.id });
      metaChanged = true;
      return { ...rm, lastSent: today };
    });

    if (!notifications.length) {
      if (metaChanged) {
        await admin.auth.admin.updateUserById(u.id, { user_metadata: { ...meta, recurring: nextRecs, reminders: nextRem } });
      }
      continue;
    }

    // --- Розсилка пушів + чистка мертвих підписок ---
    const dead = new Set<string>();
    for (const n of notifications) {
      const payload = JSON.stringify(n);
      for (const s of subs) {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload);
          sent++;
        } catch (e) {
          const code = (e as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) dead.add(s.endpoint);
        }
      }
    }
    const cleanSubs = subs.filter((s) => !dead.has(s.endpoint));
    await admin.auth.admin.updateUserById(u.id, {
      user_metadata: { ...meta, recurring: nextRecs, reminders: nextRem, push_subscriptions: cleanSubs },
    });
  }

  return NextResponse.json({ ok: true, users: users.length, sent });
}
