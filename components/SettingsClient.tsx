"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import {
  renameAccount,
  deleteAccount,
  deleteAllTransactions,
  createAccount,
} from "@/app/dashboard/actions";

type Account = { id: string; name: string; type: string };
const ACC_EMOJI: Record<string, string> = { cash: "👛", card: "💳", savings: "🏦", bank: "🏦" };
const ACC_TYPES = [
  { id: "cash", emoji: "👛", label: "Готівка" },
  { id: "card", emoji: "💳", label: "Картка" },
  { id: "savings", emoji: "🏦", label: "Заощадження" },
];

export default function SettingsClient({
  accounts,
  txCount,
}: {
  accounts: Account[];
  txCount: number;
}) {
  const router = useRouter();
  const [list, setList] = useState<Account[]>(accounts);
  const [, start] = useTransition();
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  // bottom sheet: видалення рахунку
  const [delTarget, setDelTarget] = useState<Account | null>(null);
  const [delWord, setDelWord] = useState("");
  const canDelete = delWord.trim().toLowerCase() === "так";

  // bottom sheet: новий рахунок
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("cash");
  const [creating, setCreating] = useState(false);

  // блокуємо скрол фону, поки відкритий будь-який bottom sheet
  useEffect(() => {
    const open = !!delTarget || showCreate;
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [delTarget, showCreate]);

  function editName(id: string, name: string) {
    setList((p) => p.map((a) => (a.id === id ? { ...a, name } : a)));
  }

  function saveName(id: string, name: string) {
    if (!name.trim()) return;
    start(async () => {
      const r = await renameAccount(id, name.trim());
      if (!r.ok) setError(r.error ?? "Помилка");
    });
  }

  function createAcc() {
    if (!newName.trim()) return;
    setError("");
    setCreating(true);
    start(async () => {
      const r = await createAccount({ name: newName.trim(), type: newType });
      setCreating(false);
      if (!r.ok || !r.id) {
        setError(r.error ?? "Помилка");
        return;
      }
      setList((p) => [...p, { id: r.id!, name: newName.trim(), type: newType }]);
      setNewName("");
      setNewType("cash");
      setShowCreate(false);
    });
  }

  function confirmDeleteAcc() {
    if (!delTarget || !canDelete) return;
    const id = delTarget.id;
    setError("");
    start(async () => {
      const r = await deleteAccount(id);
      if (!r.ok) {
        setError(r.error ?? "Помилка");
        return;
      }
      setList((p) => p.filter((a) => a.id !== id));
      setDelTarget(null);
      setDelWord("");
    });
  }

  function clearAll() {
    setError("");
    setClearing(true);
    start(async () => {
      const r = await deleteAllTransactions();
      setClearing(false);
      setConfirmClear(false);
      if (!r.ok) {
        setError(r.error ?? "Помилка");
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <div className={styles.menuGroupLabel}>Рахунки</div>
      {list.length > 0 && (
        <div className={styles.setCard}>
          {list.map((a) => (
            <div className={styles.setAccRow} key={a.id}>
              <span className={styles.setAccEmoji}>{ACC_EMOJI[a.type] ?? "👛"}</span>
              <input
                className={styles.setAccInput}
                value={a.name}
                onChange={(e) => editName(a.id, e.target.value)}
                onBlur={(e) => saveName(a.id, e.target.value)}
              />
              <button
                className={`${styles.setAccBtn} ${styles.setAccDel}`}
                onClick={() => {
                  setDelWord("");
                  setDelTarget(a);
                }}
                aria-label="Видалити рахунок"
              >
                <Icon id="i-trash" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button className={styles.addLineBtn} onClick={() => setShowCreate(true)}>
        <Icon id="i-plus" /> Додати рахунок
      </button>

      <div className={styles.menuGroupLabel}>Валюта</div>
      <div className={styles.menuList}>
        <div className={`${styles.menuItem} ${styles.menuItemOff}`}>
          <span className={styles.menuIco} style={{ background: "rgba(74,222,180,0.14)", color: "#6ee7b7" }}>
            <Icon id="i-wallet" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Валюта</span>
            <span className={styles.menuSub}>Зараз: zł → $</span>
          </span>
          <span className={styles.menuSoon}>СКОРО</span>
        </div>
      </div>

      <div className={styles.menuGroupLabel}>Дані</div>
      <div className={styles.setHint}>
        Усього транзакцій: <b>{txCount}</b>. Видалення безповоротне.
      </div>
      {!confirmClear ? (
        <button className={styles.dangerBtn} onClick={() => setConfirmClear(true)} disabled={txCount === 0}>
          Видалити всі транзакції
        </button>
      ) : (
        <button className={styles.dangerBtn} onClick={clearAll} disabled={clearing}>
          {clearing ? "Видаляю…" : `Точно видалити всі ${txCount}? Ще раз`}
        </button>
      )}

      {error && <div className={styles.setHint} style={{ color: "#ff9090" }}>{error}</div>}

      {/* bottom sheet: новий рахунок */}
      {showCreate && (
        <div className={styles.sheetWrap}>
          <div className={styles.sheetBack} onClick={() => setShowCreate(false)} />
          <div className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Новий рахунок</span>
                <button className={styles.iconBtn} onClick={() => setShowCreate(false)} aria-label="Закрити">
                  <Icon id="i-x" />
                </button>
              </div>
              <input
                className={styles.confirmInput}
                placeholder="Назва (напр. Картка mBank)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <div className={styles.fieldLabel}>Тип</div>
              <div className={styles.chips2}>
                {ACC_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.chip2} ${newType === t.id ? styles.chip2On : ""}`}
                    onClick={() => setNewType(t.id)}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.sheetActions}>
              <button className={styles.btnPrimary} onClick={createAcc} disabled={creating || !newName.trim()}>
                {creating ? "Створюю…" : "Створити"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* bottom sheet: видалення рахунку */}
      {delTarget && (
        <div className={styles.sheetWrap}>
          <div className={styles.sheetBack} onClick={() => setDelTarget(null)} />
          <div className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Видалити рахунок?</span>
                <button className={styles.iconBtn} onClick={() => setDelTarget(null)} aria-label="Закрити">
                  <Icon id="i-x" />
                </button>
              </div>
              <div className={styles.confirmText}>
                Рахунок «{delTarget.name}» буде видалено. Транзакції залишаться, але без рахунку.
                Щоб підтвердити, напиши слово <b>так</b>.
              </div>
              <input
                className={styles.confirmInput}
                placeholder="так"
                value={delWord}
                onChange={(e) => setDelWord(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.sheetActions}>
              <button className={styles.btnGhost} onClick={() => setDelTarget(null)}>
                Скасувати
              </button>
              <button className={styles.confirmDel} onClick={confirmDeleteAcc} disabled={!canDelete}>
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
