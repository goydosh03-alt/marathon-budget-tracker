"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import EmptyState from "@/components/EmptyState";
import { useT, useLang } from "@/components/SettingsProvider";
import { WEEKDAYS_SHORT, type StringKey } from "@/lib/i18n";
import {
  addReminder,
  updateReminder,
  toggleReminder,
  deleteReminder,
  savePushSubscription,
  type Reminder,
  type PushSub,
} from "@/app/dashboard/actions";
import { subscribeToPush, pushSupported } from "@/lib/push";

const FREQ_IDS = ["daily", "weekdays", "weekends", "weekly"] as const;

export default function RemindersClient({ reminders }: { reminders: Reminder[] }) {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const [, start] = useTransition();
  const [items, setItems] = useState(reminders);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [time, setTime] = useState("20:00");
  const [freq, setFreq] = useState<Reminder["freq"]>("daily");
  const [weekday, setWeekday] = useState(0); // 0=Пн … 6=Нд (для «Щотижня»)
  const [enabled, setEnabled] = useState(true);

  useEffect(() => setItems(reminders), [reminders]);
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) setPerm("unsupported");
    else setPerm(Notification.permission);
  }, []);

  async function askPerm() {
    if (!("Notification" in window)) return;
    const res = await Notification.requestPermission();
    setPerm(res);
    if (res !== "granted") return;
    // підписка на справжні пуші (service worker + VAPID) і збереження на сервері
    try {
      if (pushSupported()) {
        const sub = await subscribeToPush();
        if (sub?.endpoint && sub.keys) {
          const tzOffsetMin = -new Date().getTimezoneOffset(); // +120 для UTC+2
          await savePushSubscription(sub as PushSub, tzOffsetMin);
        }
      }
      new Notification("Snapcost", { body: t("rem.notifOn") });
    } catch {
      /* тихо: дозвіл є, підписку спробуємо ще раз пізніше */
    }
  }

  function openNew() {
    setEditId(null);
    setName(t("rem.defaultName"));
    setTime("20:00");
    setFreq("daily");
    setWeekday((new Date().getDay() + 6) % 7); // за замовч. — сьогоднішній день
    setEnabled(true);
    setOpen(true);
  }
  function openEdit(r: Reminder) {
    setEditId(r.id);
    setName(r.name);
    setTime(r.time);
    setFreq(r.freq);
    setWeekday(r.weekday ?? 0);
    setEnabled(r.enabled);
    setOpen(true);
  }
  function save() {
    if (!name.trim()) return;
    setSaving(true);
    start(async () => {
      const payload = { name, time, freq, weekday, enabled };
      if (editId) await updateReminder(editId, payload);
      else await addReminder(payload);
      setSaving(false);
      setOpen(false);
      router.refresh();
    });
  }
  function remove() {
    if (!editId) return;
    start(async () => {
      await deleteReminder(editId);
      setOpen(false);
      router.refresh();
    });
  }
  function flip(r: Reminder) {
    setItems((cur) => cur.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)));
    start(async () => {
      await toggleReminder(r.id, !r.enabled);
      router.refresh();
    });
  }

  return (
    <div className={styles.screen}>
      <IconSprite />
      <SubHeader title={t("menu.reminders")} back="/menu" />

      <div className={styles.notice}>
        <Icon id="i-bell" />
        <div>
          <b>{t("rem.noticeTitle")}</b> {t("rem.noticeBody")}
        </div>
      </div>

      {perm !== "granted" && perm !== "unsupported" && (
        <button className={styles.addLineBtn} onClick={askPerm}>
          <Icon id="i-bell" /> {t("rem.allow")}
        </button>
      )}
      {perm === "denied" && (
        <div className={styles.setHint}>{t("rem.blocked")}</div>
      )}

      {items.length === 0 ? (
        <EmptyState icon="i-bell" title={t("rem.emptyTitle")} hint={t("rem.emptyHint")} />
      ) : (
        <div className={styles.setCard}>
          {items.map((r) => (
            <div className={styles.remRow} key={r.id}>
              <div className={`${styles.catMid2} ${styles.clickable}`} onClick={() => openEdit(r)} style={{ cursor: "pointer" }}>
                <span className={styles.catName2}>{r.name}</span>
                <span className={styles.catType2}>
                  {r.enabled
                    ? `${r.time} · ${t(("freqL." + r.freq) as StringKey)}${r.freq === "weekly" ? ` (${WEEKDAYS_SHORT[lang][r.weekday ?? 0]})` : ""}`
                    : t("rem.offSub")}
                </span>
              </div>
              <button type="button" className={`${styles.toggle} ${r.enabled ? styles.toggleOn : ""}`} onClick={() => flip(r)} aria-label={t("rem.enabled")}>
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button className={styles.addLineBtn} onClick={openNew}>
        <Icon id="i-plus" /> {t("rem.add")}
      </button>

      {open && (
        <div className={styles.sheetWrap}>
          <div data-sheet-back className={styles.sheetBack} onClick={() => setOpen(false)} />
          <div data-sheet className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle}>{editId ? t("rem.editTitle") : t("rem.newTitle")}</div>

              {/* Час — головний елемент, як сума у формі транзакції. Тап = системний пікер. */}
              <div className={styles.remTimeWrap}>
                <input
                  className={styles.remTimeInput}
                  type="time"
                  value={time}
                  onChange={(e) => e.target.value && setTime(e.target.value)}
                  aria-label={t("rem.time")}
                />
                <span className={styles.remTimeHint}>{t("rem.time")}</span>
              </div>

              <div className={styles.fcard}>
                <div className={styles.fcIcon} style={{ background: "rgba(245,180,90,0.16)", color: "#f5c87c" }}>
                  <Icon id="i-bell" />
                </div>
                <input placeholder={t("rem.namePh")} value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className={styles.fieldLabel}>{t("rem.freq")}</div>
              <div className={styles.chips2}>
                {FREQ_IDS.map((f) => (
                  <button key={f} className={`${styles.chip2} ${freq === f ? styles.chip2On : ""}`} onClick={() => setFreq(f)}>
                    {t(("freq." + f) as StringKey)}
                  </button>
                ))}
              </div>

              {freq === "weekly" && (
                <div className={styles.chips2} style={{ marginTop: 8 }}>
                  {WEEKDAYS_SHORT[lang].map((w, i) => (
                    <button key={w} className={`${styles.chip2} ${weekday === i ? styles.chip2On : ""}`} onClick={() => setWeekday(i)}>
                      {w}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.autoRow}>
                <div>
                  <span className={styles.autoName}>{t("rem.enabled")}</span>
                  <span className={styles.autoSub}>{enabled ? t("rem.activeSub") : t("rem.offSub")}</span>
                </div>
                <button type="button" className={`${styles.toggle} ${enabled ? styles.toggleOn : ""}`} onClick={() => setEnabled((v) => !v)} aria-label={t("rem.enabled")}>
                  <span className={styles.toggleKnob} />
                </button>
              </div>
            </div>

            <div className={styles.sheetActions}>
              {editId && <button className={styles.btnDelText} onClick={remove}>{t("common.delete")}</button>}
              <button className={styles.btnPrimary} onClick={save} disabled={saving || !name.trim()}>
                {saving ? t("form.saving") : editId ? t("common.save") : t("common.create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
