"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import ds from "@/app/dashboard/ds.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import EmptyState from "@/components/EmptyState";
import { useScrollFade } from "@/components/ui/useScrollFade";
import { useT } from "@/components/SettingsProvider";
import { addCategory, updateCategory, deleteCategory, type UserCategory } from "@/app/dashboard/actions";
import SheetPortal from "@/components/ui/SheetPortal";

const EMOJIS = [
  "🛒", "☕", "🚌", "🎉", "💊", "👕", "🏠", "🎮", "🍔", "🎬", "✈️", "🐶",
  "📚", "🎁", "💪", "⛽", "💡", "💸", "🍷", "🍕", "🚕", "🏥", "💼", "🎵",
  "📱", "💻", "🎓", "🧴", "🪑", "🐱", "🌸", "⚽", "🎨", "🔧", "🧹", "💳",
];
const COLORS = [
  "#4ade9f", "#3bb4f5", "#b9a8ff", "#f5a86a", "#ff8a8a", "#ffd45a", "#7c6cff", "#f5a3d0",
  "#5ad1c4", "#9ad17a", "#f57c7c", "#7ca3f5", "#d68cff", "#ffb86c", "#6ee7b7", "#c0c0c0",
  "#e0779e", "#88d8c0",
];

export default function CategoriesClient({ categories }: { categories: UserCategory[] }) {
  const t = useT();
  const [showAdd, setShowAdd] = useState(false);
  const emojiFade = useScrollFade<HTMLDivElement>();
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [saving, setSaving] = useState(false);
  const [, start] = useTransition();
  const router = useRouter();

  function openNew() {
    setEditId(null);
    setName("");
    setEmoji(EMOJIS[0]);
    setColor(COLORS[0]);
    setType("expense");
    setShowAdd(true);
  }

  function openEdit(c: UserCategory) {
    setEditId(c.id);
    setName(c.name);
    setEmoji(c.emoji);
    setColor(c.color);
    setType(c.type);
    setShowAdd(true);
  }

  function save() {
    if (!name.trim()) return;
    setSaving(true);
    start(async () => {
      if (editId) await updateCategory(editId, { name, emoji, color, type });
      else await addCategory({ name, emoji, color, type });
      setSaving(false);
      setShowAdd(false);
      setEditId(null);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!window.confirm(t("cats.confirmDel"))) return;
    start(async () => {
      await deleteCategory(id);
      router.refresh();
    });
  }

  return (
    <div className={styles.screen}>
      <IconSprite />
      <SubHeader title={t("menu.categories")} back="/menu" />

      {categories.length === 0 ? (
        <EmptyState icon="BoldSale" title={t("cats.emptyTitle")} hint={t("cats.emptyHint")} />
      ) : (
        <div className={styles.setCard}>
          {categories.map((c) => (
            <div className={`${styles.catRow2} ${styles.clickable}`} key={c.id} onClick={() => openEdit(c)}>
              <span className={styles.catDot} style={{ background: c.color + "26" }}>{c.emoji}</span>
              <div className={styles.catMid2}>
                <span className={styles.catName2}>{c.name}</span>
                <span className={styles.catType2}>{c.type === "income" ? t("common.income") : t("common.expense")}</span>
              </div>
              <button
                className={`${styles.setAccBtn} ${styles.setAccDel}`}
                onClick={(e) => { e.stopPropagation(); remove(c.id); }}
                aria-label={t("common.delete")}
              >
                <Icon id="i-trash" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button className={styles.addLineBtn} onClick={openNew}>
        <Icon id="i-plus" /> {t("cats.add")}
      </button>

      {showAdd && (
        <SheetPortal>
          <div className={styles.sheetWrap}>
            <div data-sheet-back className={styles.sheetBack} onClick={() => setShowAdd(false)} />
            <div data-sheet className={styles.sheet}>
              <div data-vfade className={styles.sheetBody}>
                <div className={styles.sheetTitle}>{editId ? t("cats.editTitle") : t("cats.newTitle")}</div>

                <div className={styles.preview}>
                  <span className={styles.catDot} style={{ background: color + "26" }}>{emoji}</span>
                  <span className={styles.previewName}>{name.trim() || t("cats.nameDefault")}</span>
                </div>

                <input
                  className={styles.confirmInput}
                  placeholder={t("cats.namePh")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />

                <div className={`${ds.seg} ${ds.segPrimary}`}>
                  <button className={`${ds.segItem} ${type === "expense" ? ds.segOn : ""}`} onClick={() => setType("expense")}>{t("common.expense")}</button>
                  <button className={`${ds.segItem} ${type === "income" ? ds.segOn : ""}`} onClick={() => setType("income")}>{t("common.income")}</button>
                </div>

                <div className={styles.fieldLabel}>{t("cats.icon")}</div>
                <div
                  ref={emojiFade.ref}
                  className={`${styles.emojiGrid} ${emojiFade.left ? styles.fadeL : ""} ${emojiFade.right ? styles.fadeR : ""}`}
                >
                  {EMOJIS.map((e) => (
                    <button key={e} className={`${styles.emojiBtn} ${emoji === e ? styles.emojiBtnOn : ""}`} onClick={() => setEmoji(e)}>{e}</button>
                  ))}
                </div>

                <div className={styles.fieldLabel}>{t("cats.color")}</div>
                <div className={styles.colorGrid}>
                  {COLORS.map((c) => (
                    <button key={c} className={`${styles.colorBtn} ${color === c ? styles.colorBtnOn : ""}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={t("cats.color")} />
                  ))}
                </div>
              </div>

              <div className={styles.sheetActions}>
                <button className={styles.btnPrimary} onClick={save} disabled={saving || !name.trim()}>
                  {saving ? t("form.saving") : editId ? t("common.save") : t("common.create")}
                </button>
              </div>
            </div>
          </div>
        </SheetPortal>
      )}
    </div>
  );
}
