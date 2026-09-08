"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import m from "@/app/menu/menu.module.css";
import st from "@/app/settings/settings.module.css";
import DsIcon from "@/components/ds/Icon";
import { ACCOUNT_ICON, ACCOUNT_COLOR } from "@/lib/catIcon";
import { useT } from "@/components/SettingsProvider";
import {
  renameAccount,
  deleteAccount,
  deleteAllTransactions,
  createAccount,
} from "@/app/dashboard/actions";
import SheetPortal from "@/components/ui/SheetPortal";

type Account = { id: string; name: string; type: string };
const ACC_TYPE_KEY: Record<string, "acc.cash" | "acc.card" | "acc.savings"> = {
  cash: "acc.cash", card: "acc.card", savings: "acc.savings", bank: "acc.savings",
};
const ACC_TYPES = ["cash", "card", "savings"] as const;

function AccIcon({ type, size = 20 }: { type: string; size?: number }) {
  return (
    <span style={{ color: ACCOUNT_COLOR[type] ?? "var(--sc-cat-teal)", display: "flex" }}>
      <DsIcon name={ACCOUNT_ICON[type] ?? "BoldMoneyWallet"} size={size} />
    </span>
  );
}

function Trash() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6.5h16M9.5 6.5V4.8h5v1.7M6.5 6.5l.8 12a1.6 1.6 0 001.6 1.5h6.2a1.6 1.6 0 001.6-1.5l.8-12" />
    </svg>
  );
}

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
      <section className={m.group}>
        <span className={m.groupLabel}>{t("set.accounts")}</span>
        {list.length > 0 && (
          <div className={m.list}>
            {list.map((a) => (
              <div className={m.row} key={a.id} style={{ cursor: "default" }}>
                <span className={m.tile}><AccIcon type={a.type} /></span>
                <span className={m.mid}>
                  <input
                    className={st.accName}
                    value={a.name}
                    onChange={(e) => editName(a.id, e.target.value)}
                    onBlur={(e) => saveName(a.id, e.target.value)}
                  />
                  <span className={st.accSub}>{t(ACC_TYPE_KEY[a.type] ?? "acc.cash")}</span>
                </span>
                <button
                  className={st.del}
                  onClick={() => { setDelWord(""); setDelTarget(a); }}
                  aria-label={t("common.delete")}
                >
                  <Trash />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={m.group}>
        <span className={m.groupLabel}>{t("set.data")}</span>
        <div className={m.list}>
          <div className={st.dataRow}>
            <span>{t("set.total")}</span>
            <span className={st.dataVal}>{txCount}</span>
          </div>
        </div>
      </section>

      {/* Небезпечна зона свідомо НЕ прибита донизу: до неї треба доскролити */}
      <section className={m.group}>
        <span className={m.groupLabel}>{t("set.dangerZone")}</span>
        <button
          className={st.danger}
          onClick={() => { setClearWord(""); setClearOpen(true); }}
          disabled={txCount === 0}
        >
          {t("set.deleteAll")}
        </button>
        <span className={st.dangerHint}>{t("set.irreversible")}</span>
      </section>

      {error && <div className={st.err}>{error}</div>}

      <div className={styles.scrimbar} />
      <div className={st.pinned}>
        <button className={st.addBtn} onClick={() => setShowCreate(true)}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 3.6v12.8M3.6 10h12.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          {t("set.addAccount")}
        </button>
      </div>

      {clearOpen && (
        <SheetPortal>
          <div className={styles.sheetWrap}>
            <div data-sheet-back className={styles.sheetBack} onClick={() => setClearOpen(false)} />
            <div data-sheet className={styles.sheet}>
              <div data-vfade className={styles.sheetBody}>
                <div className={styles.sheetTitle}>{t("set.clearTitle")}</div>
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
        </SheetPortal>
      )}

      {/* bottom sheet: новий рахунок */}
      {showCreate && (
        <SheetPortal>
          <div className={styles.sheetWrap}>
            <div data-sheet-back className={styles.sheetBack} onClick={() => setShowCreate(false)} />
            <div data-sheet className={styles.sheet}>
              <div data-vfade className={styles.sheetBody}>
                <div className={styles.sheetTitle}>{t("set.newAccount")}</div>
                <div className={st.stack}>
                  <div className={st.nameCard}>
                    <span className={st.nameTile}><AccIcon type={newType} size={18} /></span>
                    <input
                      placeholder={t("set.accNamePh")}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className={styles.fieldLabel}>{t("common.type")}</div>
                    <div className={st.typeRow}>
                      {ACC_TYPES.map((tp) => (
                        <button
                          key={tp}
                          type="button"
                          className={`${st.type} ${newType === tp ? st.typeOn : ""}`}
                          onClick={() => setNewType(tp)}
                        >
                          <AccIcon type={tp} size={16} />
                          {t(ACC_TYPE_KEY[tp])}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.sheetActions}>
                <button className={styles.btnGhost} onClick={() => setShowCreate(false)}>
                  {t("common.cancel")}
                </button>
                <button className={styles.btnPrimary} onClick={createAcc} disabled={creating || !newName.trim()}>
                  {creating ? t("common.creating") : t("common.create")}
                </button>
              </div>
            </div>
          </div>
        </SheetPortal>
      )}

      {/* bottom sheet: видалення рахунку */}
      {delTarget && (
        <SheetPortal>
          <div className={styles.sheetWrap}>
            <div data-sheet-back className={styles.sheetBack} onClick={() => setDelTarget(null)} />
            <div data-sheet className={styles.sheet}>
              <div data-vfade className={styles.sheetBody}>
                <div className={styles.sheetTitle}>{t("set.delAccTitle")}</div>
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
        </SheetPortal>
      )}
    </>
  );
}
