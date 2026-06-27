"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import EmptyState from "@/components/EmptyState";
import {
  addReminder,
  updateReminder,
  toggleReminder,
  deleteReminder,
  type Reminder,
} from "@/app/dashboard/actions";

const FREQS = [
  { id: "daily", label: "Щодня" },
  { id: "weekdays", label: "Будні" },
  { id: "weekends", label: "Вихідні" },
  { id: "weekly", label: "Щотижня" },
] as const;
const FREQ_LABEL: Record<string, string> = { daily: "Щодня", weekdays: "По буднях", weekends: "У вихідні", weekly: "Щотижня" };

export default function RemindersClient({ reminders }: { reminders: Reminder[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [items, setItems] = useState(reminders);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [time, setTime] = useState("20:00");
  const [freq, setFreq] = useState<Reminder["freq"]>("daily");
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
    if (res === "granted") new Notification("Snapcost", { body: "Сповіщення увімкнено ✓" });
  }

  function openNew() {
    setEditId(null);
    setName("Записати витрати");
    setTime("20:00");
    setFreq("daily");
    setEnabled(true);
    setOpen(true);
  }
  function openEdit(r: Reminder) {
    setEditId(r.id);
    setName(r.name);
    setTime(r.time);
    setFreq(r.freq);
    setEnabled(r.enabled);
    setOpen(true);
  }
  function save() {
    if (!name.trim()) return;
    setSaving(true);
    start(async () => {
      const payload = { name, time, freq, enabled };
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
      <SubHeader title="Нагадування" back="/menu" />

      <div className={styles.notice}>
        <Icon id="i-bell" />
        <div>
          <b>Зверни увагу:</b> сповіщення дзвонять лише коли Snapcost встановлений як застосунок (PWA) на телефоні. У браузері — лише як налаштування.
        </div>
      </div>

      {perm !== "granted" && perm !== "unsupported" && (
        <button className={styles.addLineBtn} onClick={askPerm} style={{ marginTop: 10 }}>
          <Icon id="i-bell" /> Дозволити сповіщення
        </button>
      )}
      {perm === "denied" && (
        <div className={styles.setHint}>Сповіщення заблоковані. Увімкни їх у налаштуваннях браузера/телефону.</div>
      )}

      {items.length === 0 ? (
        <EmptyState icon="i-bell" title="Ще немає нагадувань" hint="Додай нагадування, щоб не забувати записувати витрати." />
      ) : (
        <div className={styles.setCard}>
          {items.map((r) => (
            <div className={styles.remRow} key={r.id}>
              <div className={`${styles.catMid2} ${styles.clickable}`} onClick={() => openEdit(r)} style={{ cursor: "pointer" }}>
                <span className={styles.catName2}>{r.name}</span>
                <span className={styles.catType2}>{r.enabled ? `${r.time} · ${FREQ_LABEL[r.freq]}` : "Вимкнено"}</span>
              </div>
              <button type="button" className={`${styles.toggle} ${r.enabled ? styles.toggleOn : ""}`} onClick={() => flip(r)} aria-label="Увімкнути">
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button className={styles.addLineBtn} onClick={openNew}>
        <Icon id="i-plus" /> Додати нагадування
      </button>

      {open && (
        <div className={styles.sheetWrap}>
          <div className={styles.sheetBack} onClick={() => setOpen(false)} />
          <div className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{editId ? "Редагувати нагадування" : "Нове нагадування"}</span>
                <button className={styles.iconBtn} onClick={() => setOpen(false)} aria-label="Закрити">
                  <Icon id="i-x" />
                </button>
              </div>

              <div className={styles.fcard}>
                <div className={styles.fcIcon} style={{ background: "rgba(245,180,90,0.16)", color: "#f5c87c" }}>
                  <Icon id="i-bell" />
                </div>
                <input placeholder="Назва (напр. Записати витрати)" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className={styles.fieldLabel}>Час</div>
              <input className={styles.confirmInput} type="time" value={time} onChange={(e) => setTime(e.target.value)} />

              <div className={styles.fieldLabel}>Частота</div>
              <div className={styles.chips2}>
                {FREQS.map((f) => (
                  <button key={f.id} className={`${styles.chip2} ${freq === f.id ? styles.chip2On : ""}`} onClick={() => setFreq(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>

              <div className={styles.autoRow}>
                <div>
                  <span className={styles.autoName}>Увімкнено</span>
                  <span className={styles.autoSub}>{enabled ? "Нагадування активне" : "Вимкнено"}</span>
                </div>
                <button type="button" className={`${styles.toggle} ${enabled ? styles.toggleOn : ""}`} onClick={() => setEnabled((v) => !v)} aria-label="Увімкнути">
                  <span className={styles.toggleKnob} />
                </button>
              </div>
            </div>

            <div className={styles.sheetActions}>
              {editId && <button className={styles.btnDelText} onClick={remove}>Видалити</button>}
              <button className={styles.btnPrimary} onClick={save} disabled={saving || !name.trim()}>
                {saving ? "Зберігаю…" : editId ? "Зберегти" : "Створити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
