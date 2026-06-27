"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import SubHeader from "@/components/SubHeader";
import EmptyState from "@/components/EmptyState";
import { addCategory, deleteCategory, type UserCategory } from "@/app/dashboard/actions";

const EMOJIS = ["🛒", "☕", "🚌", "🎉", "💊", "👕", "🏠", "🎮", "🍔", "🎬", "✈️", "🐶", "📚", "🎁", "💪", "⛽", "💡", "💸"];
const COLORS = ["#4ade9f", "#3bb4f5", "#b9a8ff", "#f5a86a", "#ff8a8a", "#ffd45a", "#7c6cff", "#f5a3d0", "#5ad1c4"];

export default function CategoriesClient({ categories }: { categories: UserCategory[] }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(COLORS[0]);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [saving, setSaving] = useState(false);
  const [, start] = useTransition();
  const router = useRouter();

  function create() {
    if (!name.trim()) return;
    setSaving(true);
    start(async () => {
      await addCategory({ name, emoji, color, type });
      setSaving(false);
      setShowAdd(false);
      setName("");
      setEmoji(EMOJIS[0]);
      setColor(COLORS[0]);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!window.confirm("Видалити категорію?")) return;
    start(async () => {
      await deleteCategory(id);
      router.refresh();
    });
  }

  return (
    <div className={styles.screen}>
      <IconSprite />
      <SubHeader title="Категорії" back="/menu" />

      {categories.length === 0 ? (
        <EmptyState icon="i-list" title="Своїх категорій ще нема" hint="Додай першу — назва, колір та іконка." />
      ) : (
        <div className={styles.setCard}>
          {categories.map((c) => (
            <div className={styles.catRow2} key={c.id}>
              <span className={styles.catDot} style={{ background: c.color + "26" }}>{c.emoji}</span>
              <div className={styles.catMid2}>
                <span className={styles.catName2}>{c.name}</span>
                <span className={styles.catType2}>{c.type === "income" ? "Дохід" : "Витрата"}</span>
              </div>
              <button className={`${styles.setAccBtn} ${styles.setAccDel}`} onClick={() => remove(c.id)} aria-label="Видалити">
                <Icon id="i-trash" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button className={styles.addLineBtn} onClick={() => setShowAdd(true)}>
        <Icon id="i-plus" /> Додати категорію
      </button>

      {showAdd && (
        <div className={styles.sheetWrap}>
          <div className={styles.sheetBack} onClick={() => setShowAdd(false)} />
          <div className={styles.sheet}>
            <div className={styles.sheetBody}>
              <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Нова категорія</span>
                <button className={styles.iconBtn} onClick={() => setShowAdd(false)} aria-label="Закрити">
                  <Icon id="i-x" />
                </button>
              </div>

              <div className={styles.preview}>
                <span className={styles.catDot} style={{ background: color + "26" }}>{emoji}</span>
                <span className={styles.previewName}>{name.trim() || "Назва категорії"}</span>
              </div>

              <input
                className={styles.confirmInput}
                placeholder="Назва (напр. Кава)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />

              <div className={styles.fieldLabel}>Тип</div>
              <div className={styles.pfilter}>
                <button className={`${styles.pf} ${type === "expense" ? styles.pfOn : ""}`} onClick={() => setType("expense")}>Витрата</button>
                <button className={`${styles.pf} ${type === "income" ? styles.pfOn : ""}`} onClick={() => setType("income")}>Дохід</button>
              </div>

              <div className={styles.fieldLabel}>Іконка</div>
              <div className={styles.emojiGrid}>
                {EMOJIS.map((e) => (
                  <button key={e} className={`${styles.emojiBtn} ${emoji === e ? styles.emojiBtnOn : ""}`} onClick={() => setEmoji(e)}>{e}</button>
                ))}
              </div>

              <div className={styles.fieldLabel}>Колір</div>
              <div className={styles.colorGrid}>
                {COLORS.map((c) => (
                  <button key={c} className={`${styles.colorBtn} ${color === c ? styles.colorBtnOn : ""}`} style={{ background: c }} onClick={() => setColor(c)} aria-label="Колір" />
                ))}
              </div>
            </div>

            <div className={styles.sheetActions}>
              <button className={styles.btnPrimary} onClick={create} disabled={saving || !name.trim()}>
                {saving ? "Створюю…" : "Створити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
