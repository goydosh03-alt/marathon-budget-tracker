"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { addTransaction, updateTransaction, deleteTransaction } from "@/app/dashboard/actions";
import { Icon } from "@/components/IconSprite";
import CalcSheet from "@/components/CalcSheet";
import AmountKeypad from "@/components/AmountKeypad";
import { evalExpr, trimNum } from "@/lib/calc";
import CalendarSheet from "@/components/CalendarSheet";
import { currencyMeta } from "@/lib/currency";
import { dataLabel, type StringKey } from "@/lib/i18n";
import { useCategories, useCurrency, useConvertCurrency, useMoney, useConv, useT, useLang } from "@/components/SettingsProvider";
import s from "@/app/dashboard/addsheet.module.css";
import DsIcon from "@/components/ds/Icon";
import CategoryPickerSheet from "@/components/CategoryPickerSheet";
import { resolveCat, ACCOUNT_ICON, ACCOUNT_COLOR } from "@/lib/catIcon";
import { sortByRecent, noteCategory } from "@/lib/recentCats";
import { useScrollFade } from "@/components/ui/useScrollFade";

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
  autoScan = false,
  accounts,
  editTx,
  initialCategory,
  onClose,
}: {
  initialType: "expense" | "income";
  autoScan?: boolean;
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

  // «Сканувати» на головній відкриває камеру одразу
  useEffect(() => {
    if (autoScan) fileRef.current?.click();
  }, [autoScan]);

  // undo для видалення позиції
  const [itemUndo, setItemUndo] = useState<{ items: Item[]; amount: string } | null>(null);
  const itemTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // калькулятор для позиції (індекс)
  const [calcItem, setCalcItem] = useState<number | null>(null);
  // калькулятор для суми + наш календар для дати
  const [padOpen, setPadOpen] = useState(false);
  const [expr, setExpr] = useState("");
  const padResult = evalExpr(expr);
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const catFade = useScrollFade<HTMLDivElement>();
  const accFade = useScrollFade<HTMLDivElement>();
  const customCats = useCategories();
  const cats = [
    ...(isIncome ? INCOME_CATS : EXPENSE_CATS),
    ...customCats.filter((c) => c.type === (isIncome ? "income" : "expense")).map((c) => c.name),
  ];
  const customMap = new Map(customCats.map((c) => [c.name, c]));
  const parsed = parseFloat(amount.replace(",", ".")) || 0;
  const money = useMoney();
  const conv = useConv();
  const t = useT();
  const lang = useLang();
  const [ordered, setOrdered] = useState<string[]>(cats);
  useEffect(() => {
    setOrdered(sortByRecent(cats));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cats.join("|")]);
  const rowA = ordered.filter((_, i) => i % 2 === 0);
  const rowB = ordered.filter((_, i) => i % 2 === 1);

  function pickCategory(c: string) {
    setCategory(c);
    noteCategory(c);
  }


  const homeCur = useCurrency();
  const convCur = useConvertCurrency();
  const sym = currencyMeta(homeCur).symbol;

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
      <div data-sheet-back className={styles.sheetBack} onClick={onClose} />
      <div data-sheet className={`${styles.sheet} ${s.addSheet}`}>
        <span className={s.tex} aria-hidden="true" />
        <div data-vfade className={styles.sheetBody}>
        <div className={s.stack}>

        <div className={s.amtBlock}>
        <div className={s.amtRow}>
          <button
            type="button"
            className={`${s.sign} ${isIncome ? s.signInc : ""}`}
            onClick={() => switchType(isIncome ? "expense" : "income")}
            aria-label={isIncome ? t("common.income") : t("common.expense")}
          >
            {isIncome ? "+" : "\u2212"}
          </button>
          <button
            type="button"
            className={`${s.amtBtn} ${isIncome ? s.amtInc : ""}`}
            onClick={() => { if (padOpen) return; setExpr(amount ? amount.replace(",", ".") : ""); setPadOpen(true); }}
            style={{ color: padOpen || amount ? undefined : "var(--sc-ink-muted)" }}
          >
            {padOpen ? (padResult !== null ? trimNum(padResult) : "0") : amount || "0"}
            {padOpen && <span className={s.caret} />}
          </button>
          <span className={s.amtCur}>{sym}</span>
        </div>
        {convCur !== homeCur && parsed > 0 && (
          <div className={s.amtConv}>≈ {conv(parsed, 2)}</div>
        )}

        {!isIncome && !padOpen && (
          <div className={s.scanRow}>
            <button className={s.scanBtn} type="button" onClick={() => fileRef.current?.click()} disabled={scanning}>
              <DsIcon name="BoldSecurityScanner" size={16} /> {scanning ? t("form.reading") : t("form.scan")}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleScan} style={{ display: "none" }} />
          </div>
        )}
        </div>

        {padOpen && <AmountKeypad expr={expr} result={padResult} onExpr={setExpr} />}

        {!padOpen && (
        <>
        {scannedItems && scannedItems.length > 0 && (
          <>
            <div className={styles.fieldLabel}>{t("form.receiptItems")}</div>
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
                    aria-label={t("form.deleteItem")}
                  >
                    <Icon id="i-trash" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div>
          <span className={s.label}>{t("det.category")}</span>
          <div className={s.catWrap}>
            <div className={`${s.box} ${s.catBox}`}>
              <div
                ref={catFade.ref}
                className={`${s.scrollY} ${catFade.left ? s.fadeL : ""} ${catFade.right ? s.fadeR : ""}`}
              >
                {[rowA, rowB].map((row, ri) => (
                  <div className={s.row} key={ri}>
                    {row.map((c) => {
                      const look = resolveCat(c, isIncome, customMap.get(c));
                      return (
                        <button
                          key={c}
                          type="button"
                          className={`${s.chip} ${category === c ? s.chipOn : ""}`}
                          onClick={() => pickCategory(c)}
                        >
                          <span className={s.chipIco} style={{ color: look.color }}>
                            {look.icon ? <DsIcon name={look.icon} size={16} /> : look.emoji}
                          </span>
                          {dataLabel(c, lang)}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <button type="button" className={s.more} onClick={() => setPickerOpen(true)} aria-label={t("det.category")}>
              <span className={s.dots}><i /><i /><i /></span>
            </button>
          </div>
        </div>

        <div>
          <span className={s.label}>{t("det.account")}</span>
          <div className={`${s.box} ${s.boxPill}`}>
            <div
              ref={accFade.ref}
              className={`${s.scrollX} ${accFade.left ? s.fadeL : ""} ${accFade.right ? s.fadeR : ""}`}
            >
              {accounts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`${s.chip} ${accountId === a.id ? s.chipOn : ""}`}
                  onClick={() => setAccountId(a.id)}
                >
                  <span className={s.chipIco} style={{ color: ACCOUNT_COLOR[a.type] ?? "var(--sc-cat-teal)" }}>
                    <DsIcon name={ACCOUNT_ICON[a.type] ?? "BoldMoneyWallet"} size={16} />
                  </span>
                  {dataLabel(a.name, lang)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className={s.label}>{t("det.date")}</span>
          <div className={s.dateCtl}>
            {dayOptions.map((o) => (
              <button
                key={o.label}
                type="button"
                className={`${s.day} ${date === o.key ? s.dayOn : ""}`}
                onClick={() => setDate(o.key)}
              >
                <b>{o.label}</b><span>{dm(o.key)}</span>
              </button>
            ))}
            <span className={s.vdiv} />
            <button type="button" className={s.calBtn} onClick={() => setDateCalOpen(true)} aria-label={t("form.pickDate")}>
              <DsIcon name="BoldCalendar" size={18} />
            </button>
          </div>
        </div>

        <div className={s.nameCard}>
          <span className={s.nameTile}><DsIcon name="BoldMessagesConversationPen" size={18} /></span>
          <input
            placeholder={isIncome ? t("form.namePlaceholderInc") : t("form.namePlaceholderExp")}
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>
        </>
        )}

        </div>

        {error && <div className={styles.errMsg}>{error}</div>}
        </div>

        <div className={styles.sheetActions}>
          {padOpen ? (
            <button
              className={styles.btnPrimary}
              disabled={padResult === null || padResult < 0}
              onClick={() => {
                if (padResult === null) return;
                setAmount(trimNum(Number(padResult.toFixed(2))));
                setPadOpen(false);
              }}
            >
              {t("common.apply")}
            </button>
          ) : (
            <>
              {isEdit && (
                <button className={styles.btnDelText} onClick={remove} disabled={pending}>{t("common.delete")}</button>
              )}
              <button className={styles.btnPrimary} onClick={save} disabled={pending}>
                {pending ? t("form.saving") : t("common.save")}
              </button>
            </>
          )}
        </div>
      </div>

      {itemUndo && (
        <div className={styles.toast}>
          <Icon id="i-trash" />
          <span className={styles.toastTxt}>{t("form.itemDeleted")}</span>
          <button className={styles.toastUndo} onClick={undoItem}>{t("common.undo")}</button>
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

      {pickerOpen && (
        <CategoryPickerSheet
          cats={ordered}
          value={category}
          isIncome={isIncome}
          onPick={pickCategory}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {dateCalOpen && (
        <CalendarSheet
          single
          title={t("det.date")}
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
