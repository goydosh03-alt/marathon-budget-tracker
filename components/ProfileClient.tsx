"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import { updateProfileName, deleteUserAccount } from "@/app/dashboard/actions";

const PROVIDER_LABEL: Record<string, string> = {
  google: "Вхід через Google",
  apple: "Вхід через Apple",
  email: "Вхід через пошту",
};

export default function ProfileClient({
  name,
  email,
  provider,
}: {
  name: string;
  email: string;
  provider: string;
}) {
  const router = useRouter();
  const [val, setVal] = useState(name);
  const [, start] = useTransition();
  const [delOpen, setDelOpen] = useState(false);
  const [delWord, setDelWord] = useState("");
  const [deleting, setDeleting] = useState(false);
  const canDelete = delWord.trim().toLowerCase() === "видалити";
  const initial = (val || email || "U").charAt(0).toUpperCase();

  useEffect(() => {
    if (!delOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [delOpen]);

  function saveName() {
    if (!val.trim() || val.trim() === name) return;
    start(async () => {
      await updateProfileName(val.trim());
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!canDelete) return;
    setDeleting(true);
    start(async () => {
      await deleteUserAccount();
      router.push("/login");
    });
  }

  return (
    <div className={styles.screen}>
      <IconSprite />
      <SubHeader title="Профіль" back="/menu" />

      <div className={styles.profBig}>
        <div className={styles.profBigAvatar}>{initial}</div>
        <span className={styles.profBigName}>{val || "Друже"}</span>
        <span className={styles.profBigSub}>{email}</span>
      </div>

      <div className={styles.menuGroupLabel}>Імʼя</div>
      <div className={styles.fcard}>
        <div className={styles.fcIcon} style={{ background: "rgba(74,222,180,0.16)", color: "#6ee7b7" }}>
          <Icon id="i-person" />
        </div>
        <input value={val} onChange={(e) => setVal(e.target.value)} onBlur={saveName} placeholder="Твоє імʼя" />
      </div>

      <div className={styles.menuGroupLabel}>Акаунт</div>
      <div className={styles.setCard}>
        <div className={styles.catRow2}>
          <span className={styles.catDot} style={{ background: "rgba(59,180,245,0.16)" }}><Icon id="i-person" /></span>
          <div className={styles.catMid2}>
            <span className={styles.catName2}>{PROVIDER_LABEL[provider] ?? "Підключено"}</span>
            <span className={styles.catType2}>{email}</span>
          </div>
        </div>
      </div>

      <form action="/auth/signout" method="post">
        <button className={styles.logoutBtn} type="submit">Вийти з акаунта</button>
      </form>

      <div className={styles.menuGroupLabel}>Небезпечна зона</div>
      <div className={styles.setHint}>Видалення акаунта стирає всі дані безповоротно.</div>
      <button className={styles.dangerBtn} onClick={() => { setDelWord(""); setDelOpen(true); }}>
        Видалити акаунт
      </button>

      {delOpen && (
        <div className={styles.sheetWrap}>
          <div className={styles.sheetBack} onClick={() => setDelOpen(false)} />
          <div className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Видалити акаунт?</span>
                <button className={styles.iconBtn} onClick={() => setDelOpen(false)} aria-label="Закрити">
                  <Icon id="i-x" />
                </button>
              </div>
              <div className={styles.confirmText}>
                Усі транзакції, рахунки й категорії будуть видалені <b>назавжди</b>. Щоб підтвердити, напиши слово <b>видалити</b>.
              </div>
              <input className={styles.confirmInput} placeholder="видалити" value={delWord} onChange={(e) => setDelWord(e.target.value)} autoFocus />
            </div>
            <div className={styles.sheetActions}>
              <button className={styles.btnGhost} onClick={() => setDelOpen(false)}>Скасувати</button>
              <button className={styles.confirmDel} onClick={confirmDelete} disabled={!canDelete || deleting}>
                {deleting ? "Видаляю…" : "Видалити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
