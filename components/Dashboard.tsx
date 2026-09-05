"use client";

import { useState } from "react";
import styles from "@/app/dashboard/ds.module.css";
import { IconSprite } from "@/components/IconSprite";
import DsIcon from "@/components/ds/Icon";
import BottomNav from "@/components/BottomNav";
import AmountsEyeButton from "@/components/AmountsEyeButton";
import NotificationsBell from "@/components/NotificationsBell";
import TransactionViewer from "@/components/TransactionViewer";
import RecurringRunner from "@/components/RecurringRunner";
import ReminderWatcher from "@/components/ReminderWatcher";
import WelcomeSheet from "@/components/WelcomeSheet";
import type { Reminder } from "@/app/dashboard/actions";
import { catEmoji } from "@/lib/txui";
import { catVisual, ACCOUNT_ICON, ACCOUNT_COLOR } from "@/lib/catIcon";
import { useDec, useMoney, useConv, useT, useLang } from "@/components/SettingsProvider";
import { dataLabel, MONTHS_GEN, type Lang } from "@/lib/i18n";

type Account = { id: string; name: string; type: string; balanceHome: number };
type Tx = {
  id: string;
  type: string;
  amountHome: number;
  category: string;
  merchant: string;
  date: string;
  createdAt: string;
  accountId: string;
};

// Заголовок дня: Сьогодні / Вчора / «5 липня» (+ рік, якщо не поточний)
function dayLabel(dateStr: string, now: Date, lang: Lang, today: string, yesterday: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.round((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return today;
  if (diff === 1) return yesterday;
  const year = d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : "";
  return `${d.getDate()} ${MONTHS_GEN[lang][d.getMonth()]}${year}`;
}

function timeOf(createdAt: string): string {
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Відкрити форму додавання — та сама подія, яку вже слухає BottomNav.
function openAdd(type: "income" | "expense", scan = false) {
  window.dispatchEvent(new CustomEvent("sc:open-add", { detail: { type, scan } }));
}

const FEED_LIMIT = 30;

export default function Dashboard({
  name,
  avatarUrl,
  accounts,
  totalHome,
  txs,
  reminders = [],
}: {
  name?: string;
  avatarUrl?: string | null;
  accounts: Account[];
  totalHome: number;
  budgetHome?: number | null;
  txs: Tx[];
  reminders?: Reminder[];
}) {
  const [viewId, setViewId] = useState<string | null>(null);

  const dec = useDec();
  const money = useMoney();
  const conv = useConv();
  const t = useT();
  const lang = useLang();

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // стрічка: усі типи разом, найновіші зверху, згруповані по днях
  const sorted = [...txs].sort((a, b) =>
    a.date === b.date ? (b.createdAt || "").localeCompare(a.createdAt || "") : b.date.localeCompare(a.date)
  );
  const feed = sorted.slice(0, FEED_LIMIT);
  const groups: { date: string; items: Tx[] }[] = [];
  for (const tx of feed) {
    const last = groups[groups.length - 1];
    if (last && last.date === tx.date) last.items.push(tx);
    else groups.push({ date: tx.date, items: [tx] });
  }

  const accountsForForm = accounts.map((a) => ({ id: a.id, name: a.name, type: a.type }));
  const signed = (v: number) => `${v < 0 ? "−" : "+"}${money(Math.abs(v), dec)}`;

  return (
    <div className={styles.screen}>
      <IconSprite />
      <RecurringRunner />
      <ReminderWatcher reminders={reminders} />
      <WelcomeSheet txCount={txs.length} />

      <div className={styles.content}>
        <header className={styles.headerbar}>
          <a href="/profile" className={styles.who}>
            <span className={`${styles.avatar} ${styles.glass}`}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" />
              ) : (
                (name || "U").charAt(0).toUpperCase()
              )}
            </span>
            <span className={styles.whotext}>
              <span className={styles.hi}>{t("dash.hello")}</span>
              <span className={styles.name}>{name || t("prof.friend")}</span>
            </span>
          </a>
          <div className={`${styles.actions} ${styles.glass}`}>
            <AmountsEyeButton />
            <NotificationsBell />
          </div>
        </header>

        <section className={styles.hero}>
          <span className={styles.scope}>
            <span className={styles.scopedot}>
              <DsIcon name="BoldMoneySafeSquare" size={12} />
            </span>
            {t("dash.totalBalance")}
          </span>
          <span className={styles.balance}>
            <span className={styles.big}>{money(totalHome, dec)}</span>
            <span className={styles.conv}>≈ {conv(totalHome, dec)}</span>
          </span>
          {accounts.length > 0 && (
            <div className={styles.accounts}>
              {accounts.map((a) => (
                <span key={a.id} className={`${styles.acct} ${styles.glass}`}>
                  <span
                    className={styles.acctIcon}
                    style={{ color: ACCOUNT_COLOR[a.type] ?? "var(--sc-cat-teal)" }}
                  >
                    <DsIcon name={ACCOUNT_ICON[a.type] ?? "BoldMoneyWallet"} size={18} />
                  </span>
                  {money(a.balanceHome, dec)}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className={styles.qrow}>
          <div className={styles.ca}>
            <button
              className={`${styles.caBtn} ${styles.glass}`}
              onClick={() => openAdd("income")}
              aria-label={t("nav.addIncome")}
            >
              <DsIcon name="BoldMoneyDollarMinimalistic" size={26} />
            </button>
            <span className={styles.caLabel}>{t("qa.income")}</span>
          </div>
          <div className={styles.ca}>
            <button
              className={`${styles.caBtn} ${styles.glass}`}
              onClick={() => openAdd("expense")}
              aria-label={t("nav.addExpense")}
            >
              <DsIcon name="BoldMessagesConversationPen" size={22} />
            </button>
            <span className={styles.caLabel}>{t("qa.expense")}</span>
          </div>
          <div className={styles.ca}>
            <button
              className={`${styles.caBtn} ${styles.glass}`}
              onClick={() => openAdd("expense", true)}
              aria-label={t("nav.scanReceipt")}
            >
              <DsIcon name="BoldSecurityScanner" size={22} />
            </button>
            <span className={styles.caLabel}>{t("qa.scan")}</span>
          </div>
          <div className={styles.ca}>
            {/* «Ще» — намальовано, логіку свідомо не підключаємо (рішення юзера) */}
            <button className={`${styles.caBtn} ${styles.glass}`} aria-label={t("qa.more")}>
              <span className={styles.dots}><i /><i /><i /></span>
            </button>
            <span className={styles.caLabel}>{t("qa.more")}</span>
          </div>
        </section>

        <section className={styles.sheet}>
          <div className={styles.sheetHead}>
            <h2 className={styles.sheetTitle}>{t("dash.recent")}</h2>
            <a className={styles.sheetLink} href="/history">
              {t("dash.all")}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>

          {feed.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyTitle}>{t("dash.empty.exp")}</span>
              <span className={styles.emptyHint}>{t("dash.empty.expHint")}</span>
            </div>
          ) : (
            groups.map((g) => {
              const dayTotal = g.items.reduce(
                (s, tx) => s + (tx.type === "income" ? tx.amountHome : -tx.amountHome),
                0
              );
              return (
                <div className={styles.daygroup} key={g.date}>
                  <div className={styles.dayhead}>
                    <span>{dayLabel(g.date, now, lang, t("rel.today"), t("rel.yesterday"))}</span>
                    <span>{signed(dayTotal)}</span>
                  </div>
                  <div className={`${styles.daycard} ${g.items.length === 1 ? styles.daycardSingle : ""}`}>
                    {g.items.map((tx, i) => {
                      const isIncome = tx.type === "income";
                      const vis = catVisual(tx.category, isIncome);
                      return (
                        <div key={tx.id}>
                          {i > 0 && <div className={styles.hair} />}
                          <button className={styles.txrow} onClick={() => setViewId(tx.id)}>
                            <span className={styles.cat} style={{ background: vis.color }}>
                              {vis.icon ? <DsIcon name={vis.icon} size={20} /> : catEmoji(tx.category, isIncome)}
                              <span className={styles.dirbadge}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={isIncome ? { transform: "rotate(180deg)" } : undefined}>
                                  <path d="M5 12h14M13 6l6 6-6 6" />
                                </svg>
                              </span>
                            </span>
                            <span className={styles.txmid}>
                              <span className={styles.txname}>{tx.merchant || dataLabel(tx.category, lang)}</span>
                              <span className={styles.txmeta}>
                                {dataLabel(tx.category, lang)}
                                {timeOf(tx.createdAt) ? ` · ${timeOf(tx.createdAt)}` : ""}
                              </span>
                            </span>
                            <span className={styles.amt}>
                              <span className={`${styles.amtVal} ${isIncome ? styles.amtValInc : ""}`}>
                                {isIncome ? "+" : "−"}
                                {money(tx.amountHome, dec)}
                              </span>
                              <span className={styles.amtSub}>≈ {conv(tx.amountHome, dec)}</span>
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      <div className={styles.scrimbar} />
      <BottomNav active="home" accounts={accountsForForm} />

      {viewId && (
        <TransactionViewer id={viewId} accounts={accountsForForm} onClose={() => setViewId(null)} />
      )}
    </div>
  );
}
