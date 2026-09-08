"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import AmountPad from "@/components/AmountPad";
import CalendarSheet from "@/components/CalendarSheet";
import EmptyState from "@/components/EmptyState";
import { catEmoji, catBg } from "@/lib/txui";
import { useDec, useMoney, useConv, useCurrency, useT, useLang } from "@/components/SettingsProvider";
import { currencyMeta } from "@/lib/currency";
import { dataLabel } from "@/lib/i18n";
import {
  addRecurring,
  updateRecurring,
  deleteRecurring,
  type Recurring,
  type UserCategory,
} from "@/app/dashboard/actions";
import SheetPortal from "@/components/ui/SheetPortal";

const EXPENSE_CATS = ["Їжа", "Кафе", "Транспорт", "Розваги", "Аптека", "Одяг", "Комунальні", "Інше"];
const INCOME_CATS = ["Зарплата", "Фриланс", "Подарунок", "Інше"];
const ACC_EMOJI: Record<string, string> = { cash: "👛", card: "💳", savings: "🏦", bank: "🏦" };

type Account = { id: string; name: string; type: string };

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dm(s: string): string {
  const [, m, d] = s.split("-");
  return `${d}.${m}`;
}

export default function RecurringClient({
  accounts,
  recurring,
  categories,
}: {
  accounts: Account[];
  recurring: Recurring[];
  categories: UserCategory[];
}) {
  const router = useRouter();
  const t = useT();
  const lang = useLang();
  const dec = useDec();
  const money = useMoney();
  const conv = useConv();
  const sym = currencyMeta(useCurrency()).symbol;
  const [, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("Комунальні");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [time, setTime] = useState("09:00");
  const [startDate, setStartDate] = useState(iso(new Date()));
  const [autoAdd, setAutoAdd] = useState(true);

  const [calcAmount, setCalcAmount] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const isIncome = type === "income";
  const parsed = parseFloat(amount.replace(",", ".")) || 0;
  const customEmoji = new Map(categories.map((c) => [c.name, c.emoji]));
  const customBg = new Map(categories.map((c) => [c.name, c.color]));
  const cats = [
    ...(isIncome ? INCOME_CATS : EXPENSE_CATS),
    ...categories.filter((c) => c.type === (isIncome ? "income" : "expense")).map((c) => c.name),
  ];
  const iconFor = (n: string) => customEmoji.get(n) ?? catEmoji(n, isIncome);
  const bgFor = (n: string) => (customBg.get(n) ? customBg.get(n)! + "26" : catBg(n));

  function openNew() {
    setEditId(null);
    setName("");
    setAmount("");
    setType("expense");
    setCategory("Комунальні");
    setAccountId(accounts[0]?.id ?? "");
    setTime("09:00");
    setStartDate(iso(new Date()));
    setAutoAdd(true);
    setOpen(true);
  }

  function openEdit(r: Recurring) {
    setEditId(r.id);
    setName(r.name);
    setAmount(String(r.amountHome));
    setType(r.type);
    setCategory(r.category);
    setAccountId(r.accountId);
    setTime(r.time ?? "09:00");
    setStartDate(r.startDate || iso(new Date()));
    setAutoAdd(r.autoAdd ?? true);
    setOpen(true);
  }

  function save() {
    if (!name.trim() || parsed <= 0) return;
    setSaving(true);
    const payload = {
      name,
      amountHome: parsed,
      type,
      category,
      accountId,
      time,
      startDate,
      dayOfMonth: Number(startDate.split("-")[2]),
      autoAdd,
    };
    start(async () => {
      if (editId) await updateRecurring(editId, payload);
      else await addRecurring(payload);
      setSaving(false);
      setOpen(false);
      router.refresh();
    });
  }

  function remove() {
    if (!editId) return;
    start(async () => {
      await deleteRecurring(editId);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className={styles.screen}>
      <IconSprite />
      <SubHeader title={t("menu.recurring")} back="/menu" />

      {recurring.length === 0 ? (
        <EmptyState icon="BoldArrowsTransferHorizontal" title={t("rec.emptyTitle")} hint={t("rec.emptyHint")} />
      ) : (
        <div className={styles.setCard}>
          {recurring.map((r) => (
            <div className={`${styles.catRow2} ${styles.clickable}`} key={r.id} onClick={() => openEdit(r)}>
              <span className={styles.catDot} style={{ background: bgFor(r.category) }}>{iconFor(r.category)}</span>
              <div className={styles.catMid2}>
                <span className={styles.catName2}>{r.name}</span>
                <span className={styles.catType2}>{t("rec.dayPre")}{r.dayOfMonth}{t("rec.dayPost")}{r.time ? ` · ${r.time}` : ""}{r.autoAdd ? ` · ${t("rec.auto")}` : ""}</span>
              </div>
              <span className={`${styles.recAmt} ${r.type === "income" ? styles.inc : ""}`}>
                {r.type === "income" ? "+" : "−"}{money(r.amountHome, dec)}
              </span>
            </div>
          ))}
        </div>
      )}

      <button className={styles.addLineBtn} onClick={openNew}>
        <Icon id="i-plus" /> {t("rec.add")}
      </button>

      {open && (
        <SheetPortal>
          <div className={styles.sheetWrap}>
            <div data-sheet-back className={styles.sheetBack} onClick={() => setOpen(false)} />
            <div data-sheet className={styles.sheet}>
              <div data-vfade className={styles.sheetBody}>
                <div className={styles.sheetTitle}>{editId ? t("rec.editTitle") : t("rec.newTitle")}</div>

                <div className={styles.tabs}>
                  <button className={`${styles.tab} ${!isIncome ? styles.tabOnExp : ""}`} onClick={() => { setType("expense"); setCategory("Комунальні"); }}>{t("common.expense")}</button>
                  <button className={`${styles.tab} ${isIncome ? styles.tabOnInc : ""}`} onClick={() => { setType("income"); setCategory("Зарплата"); }}>{t("common.income")}</button>
                </div>

                <div className={styles.amtWrap}>
                  <div className={styles.amtRow}>
                    <button
                      type="button"
                      className={styles.amtField}
                      onClick={() => setCalcAmount(true)}
                      style={{ width: `${Math.max(1, amount.length || 1)}ch`, color: amount ? undefined : "rgba(255,255,255,0.3)" }}
                    >
                      {amount || "0"}
                    </button>
                    <span className={styles.amtZl}>{sym}</span>
                  </div>
                  <div className={styles.amtConv}>≈ {conv(parsed, dec)}</div>
                </div>

                <div className={styles.fcard}>
                  <div className={styles.fcIcon} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
                    <Icon id="i-edit" />
                  </div>
                  <input placeholder={t("rec.namePh")} value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className={styles.fieldLabel}>{t("det.category")}</div>
                <div className={styles.chips2}>
                  {cats.map((c) => (
                    <button key={c} className={`${styles.chip2} ${category === c ? styles.chip2On : ""}`} onClick={() => setCategory(c)}>
                      {iconFor(c)} {dataLabel(c, lang)}
                    </button>
                  ))}
                </div>

                <div className={styles.fieldLabel}>{t("det.account")}</div>
                <div className={styles.accChips}>
                  {accounts.map((a) => (
                    <button key={a.id} className={`${styles.accChip} ${accountId === a.id ? styles.accChipOn : ""}`} onClick={() => setAccountId(a.id)}>
                      {ACC_EMOJI[a.type] ?? "👛"} {dataLabel(a.name, lang)}
                    </button>
                  ))}
                </div>

                <div className={styles.fieldLabel}>{t("rec.freqDay")}</div>
                <div className={styles.daysRow}>
                  <button className={`${styles.dayBtn} ${styles.dayBtnOn}`} style={{ flex: 1 }}>
                    <b>{t("rec.monthly")}</b><span>{dm(startDate)}</span>
                  </button>
                  <button className={styles.dayCalBtn} onClick={() => setDateOpen(true)} aria-label={t("det.date")}>
                    <Icon id="i-cal" />
                  </button>
                </div>

                <div className={styles.fieldLabel}>{t("rem.time")}</div>
                <input className={styles.confirmInput} type="time" value={time} onChange={(e) => e.target.value && setTime(e.target.value)} />

                <div className={styles.autoRow}>
                  <div>
                    <span className={styles.autoName}>{t("rec.autoAdd")}</span>
                    <span className={styles.autoSub}>{autoAdd ? t("rec.autoOn") : t("rec.autoOff")}</span>
                  </div>
                  <button type="button" className={`${styles.toggle} ${autoAdd ? styles.toggleOn : ""}`} onClick={() => setAutoAdd((v) => !v)} aria-label={t("rec.auto")}>
                    <span className={styles.toggleKnob} />
                  </button>
                </div>
              </div>

              <div className={styles.sheetActions}>
                {editId && (
                  <button className={styles.btnDelText} onClick={remove}>{t("common.delete")}</button>
                )}
                <button className={styles.btnPrimary} onClick={save} disabled={saving || !name.trim() || parsed <= 0}>
                  {saving ? t("form.saving") : editId ? t("common.save") : t("common.create")}
                </button>
              </div>
            </div>
          </div>
        </SheetPortal>
      )}

      {calcAmount && (
        <AmountPad value={amount} onChange={setAmount} onClose={() => setCalcAmount(false)} />
      )}

      {dateOpen && (
        <CalendarSheet
          single
          title={t("rec.startDate")}
          initialFrom={startDate}
          initialTo={startDate}
          onApply={(from) => { setStartDate(from); setDateOpen(false); }}
          onReset={() => setDateOpen(false)}
          onClose={() => setDateOpen(false)}
        />
      )}
    </div>
  );
}
