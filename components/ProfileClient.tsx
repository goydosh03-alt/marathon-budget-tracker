"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import { useT } from "@/components/SettingsProvider";
import { createClient } from "@/lib/supabase/client";
import { updateProfileName, deleteUserAccount, saveAvatarUrl } from "@/app/dashboard/actions";

// Стискаємо фото до квадрата 256px (центр-кроп) → jpeg.
async function toAvatarBlob(file: File): Promise<Blob | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2;
    const sy = (img.height - side) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, sx, sy, side, side, 0, 0, 256, 256);
    return await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function ProfileClient({
  name,
  email,
  provider,
  avatarUrl,
}: {
  name: string;
  email: string;
  provider: string;
  avatarUrl?: string | null;
}) {
  const router = useRouter();
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avaErr, setAvaErr] = useState("");
  const [val, setVal] = useState(name);
  const [, start] = useTransition();
  const [delOpen, setDelOpen] = useState(false);
  const [delWord, setDelWord] = useState("");
  const [deleting, setDeleting] = useState(false);
  const canDelete = delWord.trim().toLowerCase() === t("confirm.deleteWord");
  const initial = (val || email || "U").charAt(0).toUpperCase();

  // При виході/видаленні чистимо локальні дані пристрою —
  // наступний акаунт має починати з чистого аркуша (дзвіночок, онбординг тощо).
  function clearLocal() {
    try {
      ["sc_notifs", "sc_onboarded", "sc_rem_sent", "sc_hide_amounts"].forEach((k) =>
        localStorage.removeItem(k)
      );
    } catch {}
  }

  const providerLabel =
    provider === "google" ? t("prof.viaGoogle") :
    provider === "apple" ? t("prof.viaApple") :
    provider === "email" ? t("prof.viaEmail") :
    t("prof.connected");

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

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvaErr("");
    setUploading(true);
    try {
      const blob = await toAvatarBlob(file);
      if (!blob) throw new Error("no blob");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("no user");
      const path = `${user.id}/avatar.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, blob, {
        upsert: true,
        contentType: "image/jpeg",
        cacheControl: "3600",
      });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // ?v= — щоб браузер не показував стару закешовану картинку
      await saveAvatarUrl(`${data.publicUrl}?v=${Date.now()}`);
      router.refresh();
    } catch {
      setAvaErr(t("prof.photoErr"));
    } finally {
      setUploading(false);
    }
  }

  function confirmDelete() {
    if (!canDelete) return;
    setDeleting(true);
    clearLocal();
    start(async () => {
      await deleteUserAccount();
      router.push("/login");
    });
  }

  return (
    <div className={styles.screen}>
      <IconSprite />
      <SubHeader title={t("prof.title")} back="/menu" />

      <div className={styles.profBig}>
        <button
          type="button"
          className={styles.profAvaWrap}
          onClick={() => fileRef.current?.click()}
          aria-label={t("prof.changePhoto")}
          title={t("prof.changePhoto")}
          disabled={uploading}
          style={{ opacity: uploading ? 0.6 : 1 }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" style={{ marginBottom: 14 }} />
          ) : (
            <div className={styles.profBigAvatar}>{initial}</div>
          )}
          <span className={styles.profAvaBadge}><Icon id="i-scan" /></span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleAvatar}
          style={{ display: "none" }}
        />
        <span className={styles.profBigName}>{val || t("prof.friend")}</span>
        <span className={styles.profBigSub}>{email}</span>
        {avaErr && <span className={styles.setHint} style={{ color: "#ff9090" }}>{avaErr}</span>}
      </div>

      <div className={styles.menuGroupLabel}>{t("prof.name")}</div>
      <div className={styles.fcard}>
        <div className={styles.fcIcon} style={{ background: "rgba(74,222,180,0.16)", color: "#6ee7b7" }}>
          <Icon id="i-person" />
        </div>
        <input value={val} onChange={(e) => setVal(e.target.value)} onBlur={saveName} placeholder={t("prof.namePh")} />
      </div>

      <div className={styles.menuGroupLabel}>{t("prof.account")}</div>
      <div className={styles.setCard}>
        <div className={styles.catRow2}>
          <span className={styles.catDot} style={{ background: "rgba(59,180,245,0.16)" }}><Icon id="i-person" /></span>
          <div className={styles.catMid2}>
            <span className={styles.catName2}>{providerLabel}</span>
            <span className={styles.catType2}>{email}</span>
          </div>
        </div>
      </div>

      <form action="/auth/signout" method="post" onSubmit={clearLocal}>
        <button className={styles.logoutBtn} type="submit">{t("prof.signout")}</button>
      </form>

      <div className={styles.menuGroupLabel}>{t("prof.danger")}</div>
      <div className={styles.setHint}>{t("prof.deleteWarn")}</div>
      <button className={styles.dangerBtn} onClick={() => { setDelWord(""); setDelOpen(true); }}>
        {t("prof.deleteBtn")}
      </button>

      {delOpen && (
        <div className={styles.sheetWrap}>
          <div className={styles.sheetBack} onClick={() => setDelOpen(false)} />
          <div className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{t("prof.delTitle")}</span>
                <button className={styles.iconBtn} onClick={() => setDelOpen(false)} aria-label={t("common.close")}>
                  <Icon id="i-x" />
                </button>
              </div>
              <div className={styles.confirmText}>
                {t("prof.delBody")} <b>{t("prof.forever")}</b>. {t("confirm.typeWord")} <b>{t("confirm.deleteWord")}</b>.
              </div>
              <input className={styles.confirmInput} placeholder={t("confirm.deleteWord")} value={delWord} onChange={(e) => setDelWord(e.target.value)} autoFocus />
            </div>
            <div className={styles.sheetActions}>
              <button className={styles.btnGhost} onClick={() => setDelOpen(false)}>{t("common.cancel")}</button>
              <button className={styles.confirmDel} onClick={confirmDelete} disabled={!canDelete || deleting}>
                {deleting ? t("common.deleting") : t("common.delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
