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
import { useDec, useMoney, useCurrency } from "@/components/SettingsProvider";
import { currencyMeta } from "@/lib/currency";
import {
  addRecurring,
  updateRecurring,
  deleteRecurring,
  type Recurring,
  type UserCategory,
} from "@/app/dashboard/actions";

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
  const dec = useDec();
  const money = useMoney();
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
      <SubHeader title="Регулярні платежі" back="/menu" />

      {recurring.length === 0 ? (
        <EmptyState icon="i-repeat" title="Ще немає регулярних" hint="Додай підписку чи рахунок — додаватиметься сам щомісяця." />
      ) : (
        <div className={styles.setCard}>
          {recurring.map((r) => (
            <div className={`${styles.catRow2} ${styles.clickable}`} key={r.id} onClick={() => openEdit(r)}>
              <span className={styles.catDot} style={{ background: bgFor(r.category) }}>{iconFor(r.category)}</span>
              <div className={styles.catMid2}>
                <span className={styles.catName2}>{r.name}</span>
                <span className={styles.catType2}>{r.dayOfMonth}-го числа{r.autoAdd ? " · авто" : ""}</span>
              </div>
              <span className={`${styles.recAmt} ${r.type === "income" ? styles.inc : ""}`}>
                {r.type === "income" ? "+" : "−"}{money(r.amountHome, dec)}
              </span>
            </div>
          ))}
        </div>
      )}

      <button className={styles.addLineBtn} onClick={openNew}>
        <Icon id="i-plus" /> Додати регулярний платіж
      </button>

      {open && (
        <div className={styles.sheetWrap}>
          <div className={styles.sheetBack} onClick={() => setOpen(false)} />
          <div className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{editId ? "Редагувати платіж" : "Новий платіж"}</span>
                <button className={styles.iconBtn} onClick={() => setOpen(false)} aria-label="Закрити">
                  <Icon id="i-x" />
                </button>
              </div>

              <div className={styles.tabs}>
                <button className={`${styles.tab} ${!isIncome ? styles.tabOnExp : ""}`} onClick={() => { setType("expense"); setCategory("Комунальні"); }}>Витрата</button>
                <button className={`${styles.tab} ${isIncome ? styles.tabOnInc : ""}`} onClick={() => { setType("income"); setCategory("Зарплата"); }}>Дохід</button>
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
              </div>

              <div className={styles.fcard}>
                <div className={styles.fcIcon} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
                  <Icon id="i-edit" />
                </div>
                <input placeholder="Назва (напр. Netflix)" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className={styles.fieldLabel}>Категорія</div>
              <div className={styles.chips2}>
                {cats.map((c) => (
                  <button key={c} className={`${styles.chip2} ${category === c ? styles.chip2On : ""}`} onClick={() => setCategory(c)}>
                    {iconFor(c)} {c}
                  </button>
                ))}
              </div>

              <div className={styles.fieldLabel}>Рахунок</div>
              <div className={styles.accChips}>
                {accounts.map((a) => (
                  <button key={a.id} className={`${styles.accChip} ${accountId === a.id ? styles.accChipOn : ""}`} onClick={() => setAccountId(a.id)}>
                    {ACC_EMOJI[a.type] ?? "👛"} {a.name}
                  </button>
                ))}
              </div>

              <div className={styles.fieldLabel}>Частота · число</div>
              <div className={styles.daysRow}>
                <button className={`${styles.dayBtn} ${styles.dayBtnOn}`} style={{ flex: 1 }}>
                  <b>Щомісяця</b><span>{dm(startDate)}</span>
                </button>
                <button className={styles.dayCalBtn} onClick={() => setDateOpen(true)} aria-label="Дата">
                  <Icon id="i-cal" />
                </button>
              </div>

              <div className={styles.autoRow}>
                <div>
                  <span className={styles.autoName}>Додати автоматично</span>
                  <span className={styles.autoSub}>{autoAdd ? "Транзакція створюється сама" : "Лише нагадування"}</span>
                </div>
                <button type="button" className={`${styles.toggle} ${autoAdd ? styles.toggleOn : ""}`} onClick={() => setAutoAdd((v) => !v)} aria-label="Авто">
                  <span className={styles.toggleKnob} />
                </button>
              </div>
            </div>

            <div className={styles.sheetActions}>
              {editId && (
                <button className={styles.btnDelText} onClick={remove}>Видалити</button>
              )}
              <button className={styles.btnPrimary} onClick={save} disabled={saving || !name.trim() || parsed <= 0}>
                {saving ? "Зберігаю…" : editId ? "Зберегти" : "Створити"}
              </button>
            </div>
          </div>
        </div>
      )}

      {calcAmount && (
        <AmountPad value={amount} onChange={setAmount} onClose={() => setCalcAmount(false)} />
      )}

      {dateOpen && (
        <CalendarSheet
          single
          title="Дата початку"
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
