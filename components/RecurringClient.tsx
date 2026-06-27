"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { usd } from "@/lib/currency";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import EmptyState from "@/components/EmptyState";
import { catEmoji, catBg } from "@/lib/txui";
import { useDec } from "@/components/SettingsProvider";
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

function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  const [, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("Комунальні");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [day, setDay] = useState(1);

  const isIncome = type === "income";
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
    setDay(1);
    setOpen(true);
  }

  function openEdit(r: Recurring) {
    setEditId(r.id);
    setName(r.name);
    setAmount(String(r.amountHome));
    setType(r.type);
    setCategory(r.category);
    setAccountId(r.accountId);
    setDay(r.dayOfMonth);
    setOpen(true);
  }

  function save() {
    const amt = parseFloat(amount.replace(",", ".")) || 0;
    if (!name.trim() || amt <= 0) return;
    setSaving(true);
    const payload = { name, amountHome: amt, type, category, accountId, dayOfMonth: day, startDate: isoToday() };
    start(async () => {
      if (editId) await updateRecurring(editId, payload);
      else await addRecurring(payload);
      setSaving(false);
      setOpen(false);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!window.confirm("Видалити регулярний платіж?")) return;
    start(async () => {
      await deleteRecurring(id);
      router.refresh();
    });
  }

  return (
    <div className={styles.screen}>
      <IconSprite />
      <SubHeader title="Регулярні платежі" back="/menu" />

      <div className={styles.setHint}>Створюються автоматично у вказане число щомісяця.</div>

      {recurring.length === 0 ? (
        <EmptyState icon="i-repeat" title="Ще немає регулярних" hint="Додай підписку чи рахунок — додаватиметься сам щомісяця." />
      ) : (
        <div className={styles.setCard}>
          {recurring.map((r) => (
            <div className={`${styles.catRow2} ${styles.clickable}`} key={r.id} onClick={() => openEdit(r)}>
              <span className={styles.catDot} style={{ background: bgFor(r.category) }}>{iconFor(r.category)}</span>
              <div className={styles.catMid2}>
                <span className={styles.catName2}>{r.name}</span>
                <span className={styles.catType2}>{r.dayOfMonth}-го числа · {r.category}</span>
              </div>
              <span className={styles.recAmt}>{r.type === "income" ? "+" : "−"}{usd(r.amountHome, dec)}</span>
              <button
                className={`${styles.setAccBtn} ${styles.setAccDel}`}
                onClick={(e) => { e.stopPropagation(); remove(r.id); }}
                aria-label="Видалити"
              >
                <Icon id="i-trash" />
              </button>
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
                <span>{editId ? "Редагувати платіж" : "Новий регулярний платіж"}</span>
                <button className={styles.iconBtn} onClick={() => setOpen(false)} aria-label="Закрити">
                  <Icon id="i-x" />
                </button>
              </div>

              <input className={styles.confirmInput} placeholder="Назва (напр. Netflix)" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              <input className={styles.confirmInput} inputMode="decimal" placeholder="Сума, zł" value={amount} onChange={(e) => setAmount(e.target.value)} />

              <div className={styles.fieldLabel}>Тип</div>
              <div className={styles.pfilter}>
                <button className={`${styles.pf} ${type === "expense" ? styles.pfOn : ""}`} onClick={() => { setType("expense"); setCategory("Комунальні"); }}>Витрата</button>
                <button className={`${styles.pf} ${type === "income" ? styles.pfOn : ""}`} onClick={() => { setType("income"); setCategory("Зарплата"); }}>Дохід</button>
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

              <div className={styles.fieldLabel}>Число місяця</div>
              <div className={styles.chips2}>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                  <button key={d} className={`${styles.chip2} ${day === d ? styles.chip2On : ""}`} onClick={() => setDay(d)}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.sheetActions}>
              <button className={styles.btnPrimary} onClick={save} disabled={saving || !name.trim() || !(parseFloat(amount.replace(",", ".")) > 0)}>
                {saving ? "Зберігаю…" : editId ? "Зберегти" : "Створити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
