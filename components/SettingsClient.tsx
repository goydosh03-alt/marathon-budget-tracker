"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { useT } from "@/components/SettingsProvider";
import {
  renameAccount,
  deleteAccount,
  deleteAllTransactions,
  createAccount,
} from "@/app/dashboard/actions";

type Account = { id: string; name: string; type: string };
const ACC_EMOJI: Record<string, string> = { cash: "👛", card: "💳", savings: "🏦", bank: "🏦" };
const ACC_TYPES = [
  { id: "cash", emoji: "👛", key: "acc.cash" },
  { id: "card", emoji: "💳", key: "acc.card" },
  { id: "savings", emoji: "🏦", key: "acc.savings" },
] as const;

export default function SettingsClient({
  accounts,
  txCount,
}: {
  accounts: Account[];
  txCount: number;
}) {
  const router = useRouter();
  const t = useT();
  const [list, setList] = useState<Account[]>(accounts);
  const [, start] = useTransition();
  const [clearOpen, setClearOpen] = useState(false);
  const [clearWord, setClearWord] = useState("");
  const canClear = clearWord.trim().toLowerCase() === t("confirm.yes");
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  // bottom sheet: видалення рахунку
  const [delTarget, setDelTarget] = useState<Account | null>(null);
  const [delWord, setDelWord] = useState("");
  const canDelete = delWord.trim().toLowerCase() === t("confirm.yes");

  // bottom sheet: новий рахунок
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("cash");
  const [creating, setCreating] = useState(false);

  // блокуємо скрол фону, поки відкритий будь-який bottom sheet
  useEffect(() => {
    const open = !!delTarget || showCreate || clearOpen;
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [delTarget, showCreate, clearOpen]);

  function editName(id: string, name: string) {
    setList((p) => p.map((a) => (a.id === id ? { ...a, name } : a)));
  }

  function saveName(id: string, name: string) {
    if (!name.trim()) return;
    start(async () => {
      const r = await renameAccount(id, name.trim());
      if (!r.ok) setError(r.error ?? t("common.error"));
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
        setError(r.error ?? t("common.error"));
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
        setError(r.error ?? t("common.error"));
        return;
      }
      setList((p) => p.filter((a) => a.id !== id));
      setDelTarget(null);
      setDelWord("");
    });
  }

  function clearAll() {
    if (!canClear) return;
    setError("");
    setClearing(true);
    start(async () => {
      const r = await deleteAllTransactions();
      setClearing(false);
      if (!r.ok) {
        setError(r.error ?? t("common.error"));
        return;
      }
      setClearOpen(false);
      setClearWord("");
      router.refresh();
    });
  }

  return (
    <>
      <div className={styles.menuGroupLabel}>{t("set.accounts")}</div>
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
                aria-label={t("common.delete")}
              >
                <Icon id="i-trash" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button className={styles.addLineBtn} onClick={() => setShowCreate(true)}>
        <Icon id="i-plus" /> {t("set.addAccount")}
      </button>

      <div className={styles.menuGroupLabel}>{t("set.data")}</div>
      <div className={styles.setHint}>
        {t("set.total")}: <b>{txCount}</b>. {t("set.irreversible")}
      </div>
      <button
        className={styles.dangerBtn}
        onClick={() => { setClearWord(""); setClearOpen(true); }}
        disabled={txCount === 0}
      >
        {t("set.deleteAll")}
      </button>

      {error && <div className={styles.setHint} style={{ color: "#ff9090" }}>{error}</div>}

      {clearOpen && (
        <div className={styles.sheetWrap}>
          <div data-sheet-back className={styles.sheetBack} onClick={() => setClearOpen(false)} />
          <div data-sheet className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{t("set.clearTitle")}</span>
                <button className={styles.iconBtn} onClick={() => setClearOpen(false)} aria-label={t("common.close")}>
                  <Icon id="i-x" />
                </button>
              </div>
              <div className={styles.confirmText}>
                {t("set.allWord")} <b>{txCount}</b> {t("set.clearBody")}{" "}
                {t("confirm.typeWord")} <b>{t("confirm.yes")}</b>.
              </div>
              <input
                className={styles.confirmInput}
                placeholder={t("confirm.yes")}
                value={clearWord}
                onChange={(e) => setClearWord(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.sheetActions}>
              <button className={styles.btnGhost} onClick={() => setClearOpen(false)}>{t("common.cancel")}</button>
              <button className={styles.confirmDel} onClick={clearAll} disabled={!canClear || clearing}>
                {clearing ? t("common.deleting") : t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* bottom sheet: новий рахунок */}
      {showCreate && (
        <div className={styles.sheetWrap}>
          <div data-sheet-back className={styles.sheetBack} onClick={() => setShowCreate(false)} />
          <div data-sheet className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{t("set.newAccount")}</span>
                <button className={styles.iconBtn} onClick={() => setShowCreate(false)} aria-label={t("common.close")}>
                  <Icon id="i-x" />
                </button>
              </div>
              <input
                className={styles.confirmInput}
                placeholder={t("set.accNamePh")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <div className={styles.fieldLabel}>{t("common.type")}</div>
              <div className={styles.chips2}>
                {ACC_TYPES.map((tp) => (
                  <button
                    key={tp.id}
                    type="button"
                    className={`${styles.chip2} ${newType === tp.id ? styles.chip2On : ""}`}
                    onClick={() => setNewType(tp.id)}
                  >
                    {tp.emoji} {t(tp.key)}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.sheetActions}>
              <button className={styles.btnPrimary} onClick={createAcc} disabled={creating || !newName.trim()}>
                {creating ? t("common.creating") : t("common.create")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* bottom sheet: видалення рахунку */}
      {delTarget && (
        <div className={styles.sheetWrap}>
          <div data-sheet-back className={styles.sheetBack} onClick={() => setDelTarget(null)} />
          <div data-sheet className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{t("set.delAccTitle")}</span>
                <button className={styles.iconBtn} onClick={() => setDelTarget(null)} aria-label={t("common.close")}>
                  <Icon id="i-x" />
                </button>
              </div>
              <div className={styles.confirmText}>
                {t("set.delAccPre")} «{delTarget.name}» {t("set.delAccPost")}{" "}
                {t("confirm.typeWord")} <b>{t("confirm.yes")}</b>.
              </div>
              <input
                className={styles.confirmInput}
                placeholder={t("confirm.yes")}
                value={delWord}
                onChange={(e) => setDelWord(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.sheetActions}>
              <button className={styles.btnGhost} onClick={() => setDelTarget(null)}>
                {t("common.cancel")}
              </button>
              <button className={styles.confirmDel} onClick={confirmDeleteAcc} disabled={!canDelete}>
                {t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
