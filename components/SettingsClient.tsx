"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { renameAccount, deleteAccount, deleteAllTransactions } from "@/app/dashboard/actions";

type Account = { id: string; name: string; type: string };
const ACC_EMOJI: Record<string, string> = { cash: "👛", card: "💳", savings: "🏦", bank: "🏦" };

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
  const [delTarget, setDelTarget] = useState<Account | null>(null);
  const [delWord, setDelWord] = useState("");
  const canDelete = delWord.trim().toLowerCase() === "так";

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
      {list.length === 0 ? (
        <div className={styles.setHint}>Поки немає рахунків. Створити можна під час додавання транзакції.</div>
      ) : (
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
      <div className={styles.setHint}>Назву можна редагувати прямо тут — зміни зберігаються автоматично.</div>

      <div className={styles.menuGroupLabel}>Валюта</div>
      <div className={styles.menuList}>
        <div className={`${styles.menuItem} ${styles.menuItemOff}`}>
          <span className={styles.menuIco} style={{ background: "rgba(74,222,180,0.14)", color: "#6ee7b7" }}>
            <Icon id="i-wallet" />
          </span>
          <span className={styles.menuMid}>
            <span className={styles.menuName}>Головна та конверт-валюта</span>
            <span className={styles.menuSub}>Зараз: zł → $ (фіксовано)</span>
          </span>
          <span className={styles.menuSoon}>СКОРО</span>
        </div>
      </div>

      <div className={styles.menuGroupLabel}>Дані</div>
      <div className={styles.setHint}>
        Усього транзакцій: <b>{txCount}</b>. Видалення безповоротне — рахунки залишаться.
      </div>
      {!confirmClear ? (
        <button
          className={styles.dangerBtn}
          onClick={() => setConfirmClear(true)}
          disabled={txCount === 0}
        >
          Видалити всі транзакції
        </button>
      ) : (
        <button className={styles.dangerBtn} onClick={clearAll} disabled={clearing}>
          {clearing ? "Видаляю…" : `Точно видалити всі ${txCount}? Натисни ще раз`}
        </button>
      )}

      {error && <div className={styles.setHint} style={{ color: "#ff9090" }}>{error}</div>}

      {delTarget && (
        <div className={styles.confirmWrap}>
          <div className={styles.confirmBack} onClick={() => setDelTarget(null)} />
          <div className={styles.confirmCard}>
            <div className={styles.confirmTitle}>Видалити рахунок?</div>
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
            <div className={styles.confirmRow}>
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
