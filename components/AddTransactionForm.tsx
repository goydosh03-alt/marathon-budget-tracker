"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { addTransaction, updateTransaction, deleteTransaction } from "@/app/dashboard/actions";
import { Icon } from "@/components/IconSprite";
import CalcSheet from "@/components/CalcSheet";
import AmountPad from "@/components/AmountPad";
import CalendarSheet from "@/components/CalendarSheet";
import { currencyMeta } from "@/lib/currency";
import { catEmoji } from "@/lib/txui";
import { dataLabel, type StringKey } from "@/lib/i18n";
import { useCategories, useCurrency, useMoney, useConv, useT, useLang } from "@/components/SettingsProvider";

const EXPENSE_CATS = ["Їжа", "Кафе", "Транспорт", "Розваги", "Аптека", "Одяг", "Комунальні", "Інше"];
const INCOME_CATS = ["Зарплата", "Фриланс", "Подарунок", "Інше"];

const ACC_EMOJI: Record<string, string> = { cash: "👛", card: "💳", savings: "🏦", bank: "🏦" };

type Item = { name: string; price: number };

export type EditTx = {
  id: string;
  type: "expense" | "income";
  amountHome: number;
  category: string;
  merchant: string;
  accountId: string;
  date: string;
  items?: Item[];
};

function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
function dm(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function AddTransactionForm({
  initialType,
  accounts,
  editTx,
  initialCategory,
  onClose,
}: {
  initialType: "expense" | "income";
  accounts: { id: string; name: string; type: string }[];
  editTx?: EditTx;
  initialCategory?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = !!editTx;
  const [type, setType] = useState<"expense" | "income">(editTx?.type ?? initialType);
  const [amount, setAmount] = useState(editTx ? String(editTx.amountHome) : "");
  const [category, setCategory] = useState(
    editTx?.category ?? initialCategory ?? (initialType === "income" ? "Зарплата" : "Їжа")
  );
  const [merchant, setMerchant] = useState(editTx?.merchant ?? "");
  const [accountId, setAccountId] = useState(editTx?.accountId ?? accounts[0]?.id ?? "");
  const [date, setDate] = useState(editTx?.date ?? isoOffset(0));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [scanning, setScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<Item[] | null>(
    editTx?.items && editTx.items.length ? editTx.items : null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  // undo для видалення позиції
  const [itemUndo, setItemUndo] = useState<{ items: Item[]; amount: string } | null>(null);
  const itemTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // калькулятор для позиції (індекс)
  const [calcItem, setCalcItem] = useState<number | null>(null);
  // калькулятор для суми + наш календар для дати
  const [calcAmount, setCalcAmount] = useState(false);
  const [dateCalOpen, setDateCalOpen] = useState(false);

  function applyItemPrice(idx: number, value: number) {
    if (!scannedItems) return;
    const old = scannedItems[idx]?.price ?? 0;
    const next = scannedItems.map((it, i) => (i === idx ? { ...it, price: value } : it));
    setScannedItems(next);
    const newAmount = Math.max(0, Number((parsed - old + value).toFixed(2)));
    setAmount(newAmount ? String(newAmount) : "");
    setCalcItem(null);
  }


  const isIncome = type === "income";
  const customCats = useCategories();
  const cats = [
    ...(isIncome ? INCOME_CATS : EXPENSE_CATS),
    ...customCats.filter((c) => c.type === (isIncome ? "income" : "expense")).map((c) => c.name),
  ];
  const customEmoji = new Map(customCats.map((c) => [c.name, c.emoji]));
  const catIcon = (name: string) => customEmoji.get(name) ?? catEmoji(name, isIncome);
  const parsed = parseFloat(amount.replace(",", ".")) || 0;
  const money = useMoney();
  const conv = useConv();
  const t = useT();
  const lang = useLang();
  const sym = currencyMeta(useCurrency()).symbol;

  const today = isoOffset(0);
  const yest = isoOffset(1);
  const dayBefore = isoOffset(2);

  // дата зі скану/календаря, якщо вона не сьогодні/вчора/позавчора — виходить першим чипом
  const dayPresets = [
    { key: today, label: t("rel.today") },
    { key: yest, label: t("rel.yesterday") },
    { key: dayBefore, label: t("common.dayBefore") },
  ];
  const isPresetDate = dayPresets.some((p) => p.key === date);
  const dayOptions = isPresetDate
    ? dayPresets
    : [{ key: date, label: t("common.chosen") }, dayPresets[0], dayPresets[1]];

  // блокуємо скрол фону, поки відкрита форма
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (itemTimer.current) clearTimeout(itemTimer.current);
    };
  }, []);

  function switchType(t: "expense" | "income") {
    setType(t);
    if (!isEdit) setCategory(t === "income" ? "Зарплата" : "Їжа");
  }

  function save() {
    setError("");
    if (!parsed || parsed <= 0) {
      setError(t("form.errAmount"));
      return;
    }
    startTransition(async () => {
      const payload = { type, amountHome: parsed, category, merchant, accountId, date };
      const res = editTx
        ? await updateTransaction(editTx.id, { ...payload, items: scannedItems ?? [] })
        : await addTransaction({ ...payload, items: scannedItems ?? undefined });
      if (!res.ok) {
        setError(res.error ?? t("form.errSave"));
        return;
      }
      router.refresh();
      onClose();
      // анімацію + тост запускаємо ПІСЛЯ закриття попапа — на чистому екрані,
      // незалежно від того, скільки тривало збереження
      if (typeof window !== "undefined") {
        const label = isEdit ? t("common.saved") : t("common.added");
        setTimeout(
          () => window.dispatchEvent(new CustomEvent("snapcost:saved", { detail: { label } })),
          80
        );
      }
    });
  }

  function removeItem(idx: number) {
    if (!scannedItems) return;
    const snapshot = { items: scannedItems, amount };
    const removed = scannedItems[idx];
    const next = scannedItems.filter((_, i) => i !== idx);
    // авто-перерахунок суми: віднімаємо ціну видаленої позиції
    const newAmount = Math.max(0, parsed - (removed?.price ?? 0));
    setScannedItems(next.length ? next : null);
    setAmount(newAmount ? String(Number(newAmount.toFixed(2))) : "");
    // даємо 5с на відкат
    if (itemTimer.current) clearTimeout(itemTimer.current);
    setItemUndo(snapshot);
    itemTimer.current = setTimeout(() => {
      setItemUndo(null);
      itemTimer.current = null;
    }, 5000);
  }

  function undoItem() {
    if (itemTimer.current) clearTimeout(itemTimer.current);
    itemTimer.current = null;
    if (itemUndo) {
      setScannedItems(itemUndo.items);
      setAmount(itemUndo.amount);
    }
    setItemUndo(null);
  }

  function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });
  }

  // Стискаємо фото в браузері до ~1600px JPEG: вирішує великі фото з телефона,
  // HEIC (iPhone) та ліміти Claude/Vercel. Якщо щось пішло не так — шлемо оригінал.
  async function fileToScaledJpeg(
    file: File
  ): Promise<{ base64: string; mediaType: string }> {
    try {
      const dataUrl = await readAsDataURL(file);
      const img = await loadImage(dataUrl);
      const maxDim = 1600;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return { base64: dataUrl.split(",")[1], mediaType: file.type || "image/jpeg" };
      ctx.drawImage(img, 0, 0, w, h);
      const out = canvas.toDataURL("image/jpeg", 0.82);
      return { base64: out.split(",")[1], mediaType: "image/jpeg" };
    } catch {
      const dataUrl = await readAsDataURL(file);
      return { base64: dataUrl.split(",")[1], mediaType: file.type || "image/jpeg" };
    }
  }

  async function handleScan(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setScanning(true);
    try {
      const { base64, mediaType } = await fileToScaledJpeg(file);
      const res = await fetch("/api/parse-receipt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? t("form.errScan"));
        return;
      }
      const d = json.data;
      setType("expense");
      if (d.total) setAmount(String(d.total));
      if (d.merchant) setMerchant(d.merchant);
      if (d.category) setCategory(d.category);
      if (d.date) setDate(d.date);
      if (Array.isArray(d.items) && d.items.length) setScannedItems(d.items);
    } catch {
      setError(t("form.errScan"));
    } finally {
      setScanning(false);
      e.target.value = "";
    }
  }

  function remove() {
    if (!editTx) return;
    startTransition(async () => {
      const res = await deleteTransaction(editTx.id);
      if (!res.ok) {
        setError(res.error ?? t("form.errDelete"));
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div className={styles.sheetWrap}>
      <div className={styles.sheetBack} onClick={onClose} />
      <div className={styles.sheet}>
        <div className={styles.sheetBody}>
        <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{isEdit ? "Редагувати транзакцію" : "Додати транзакцію"}</span>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Закрити">
            <Icon id="i-x" />
          </button>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${type === "expense" ? styles.tabOnExp : ""}`} onClick={() => switchType("expense")}>
            Витрата
          </button>
          <button className={`${styles.tab} ${type === "income" ? styles.tabOnInc : ""}`} onClick={() => switchType("income")}>
            Дохід
          </button>
        </div>

        <div className={styles.amtWrap}>
          {!isIncome && (
            <>
              <button
                className={styles.scanBtn}
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={scanning}
              >
                <Icon id="i-scan" /> {scanning ? "Читаю…" : "Скан"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleScan}
                style={{ display: "none" }}
              />
            </>
          )}
          <div className={styles.amtRow}>
            <button
              type="button"
              className={styles.amtField}
              onClick={() => setCalcAmount(true)}
              style={{
                width: `${Math.max(1, amount.length || 1)}ch`,
                color: amount ? undefined : "rgba(255,255,255,0.3)",
              }}
            >
              {amount || "0"}
            </button>
            <span className={styles.amtZl}>{sym}</span>
          </div>
          <div className={styles.amtConv}>≈ {conv(parsed, 2)}</div>
        </div>

        {scannedItems && scannedItems.length > 0 && (
          <>
            <div className={styles.fieldLabel}>Позиції з чека</div>
            <div className={styles.itemsEdit}>
              {scannedItems.map((it, i) => (
                <div className={styles.itemRow} key={i}>
                  <button type="button" className={styles.itemTap} onClick={() => setCalcItem(i)}>
                    <span className={styles.itemName}>{it.name}</span>
                    <span className={styles.itemPrice}>{money(it.price, 2)}</span>
                  </button>
                  <button
                    className={styles.itemDel}
                    type="button"
                    onClick={() => removeItem(i)}
                    aria-label="Видалити позицію"
                  >
                    <Icon id="i-trash" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={styles.fieldLabel}>Категорія</div>
        <div className={styles.chips2}>
          {cats.map((c) => (
            <button
              key={c}
              className={`${styles.chip2} ${category === c ? styles.chip2On : ""}`}
              onClick={() => setCategory(c)}
            >
              {catIcon(c)} {c}
            </button>
          ))}
        </div>

        <div className={styles.fieldLabel}>Рахунок</div>
        <div className={styles.accChips}>
          {accounts.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`${styles.accChip} ${accountId === a.id ? styles.accChipOn : ""}`}
              onClick={() => setAccountId(a.id)}
            >
              {ACC_EMOJI[a.type] ?? "👛"} {a.name}
            </button>
          ))}
        </div>

        <div className={styles.fieldLabel}>Дата</div>
        <div className={styles.daysRow}>
          {dayOptions.map((o) => (
            <button
              key={o.label}
              type="button"
              className={`${styles.dayBtn} ${date === o.key ? styles.dayBtnOn : ""}`}
              onClick={() => setDate(o.key)}
            >
              <b>{o.label}</b><span>{dm(o.key)}</span>
            </button>
          ))}
          <button
            type="button"
            className={styles.dayCalBtn}
            onClick={() => setDateCalOpen(true)}
            aria-label="Вибрати дату"
          >
            <Icon id="i-cal" />
          </button>
        </div>

        <div className={styles.fcard}>
          <div className={styles.fcIcon} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
            <Icon id="i-edit" />
          </div>
          <input
            placeholder={isIncome ? "Назва (напр. Зарплата)" : "Назва (напр. Biedronka)"}
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>

        {error && <div className={styles.errMsg}>{error}</div>}
        </div>

        <div className={styles.sheetActions}>
          {isEdit && (
            <button className={styles.btnDelText} onClick={remove} disabled={pending}>Видалити</button>
          )}
          <button className={styles.btnPrimary} onClick={save} disabled={pending}>
            {pending ? "Зберігаю..." : "Зберегти"}
          </button>
        </div>
      </div>

      {itemUndo && (
        <div className={styles.toast}>
          <Icon id="i-trash" />
          <span className={styles.toastTxt}>Позицію видалено</span>
          <button className={styles.toastUndo} onClick={undoItem}>Повернути</button>
        </div>
      )}

      {calcItem !== null && scannedItems && scannedItems[calcItem] && (
        <CalcSheet
          title={scannedItems[calcItem].name}
          initial={scannedItems[calcItem].price}
          onApply={(val) => applyItemPrice(calcItem, val)}
          onClose={() => setCalcItem(null)}
        />
      )}

      {calcAmount && (
        <AmountPad value={amount} onChange={setAmount} onClose={() => setCalcAmount(false)} />
      )}

      {dateCalOpen && (
        <CalendarSheet
          single
          title="Дата"
          initialFrom={date}
          initialTo={date}
          onApply={(from) => {
            setDate(from);
            setDateCalOpen(false);
          }}
          onReset={() => setDateCalOpen(false)}
          onClose={() => setDateCalOpen(false)}
        />
      )}
    </div>
  );
}
