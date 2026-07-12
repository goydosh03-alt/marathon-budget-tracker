"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import TransactionViewer from "@/components/TransactionViewer";
import EmptyState from "@/components/EmptyState";
import RecurringRunner from "@/components/RecurringRunner";
import ReminderWatcher from "@/components/ReminderWatcher";
import WelcomeSheet from "@/components/WelcomeSheet";
import type { Reminder } from "@/app/dashboard/actions";
import { catEmoji, catBg } from "@/lib/txui";
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

const ACC_ICON: Record<string, string> = { cash: "i-wallet", card: "i-card", bank: "i-card" };
const ACC_STYLE = [
  { color: "#6ee7b7", bg: "rgba(74,222,180,0.16)" },
  { color: "#7cc8f5", bg: "rgba(59,180,245,0.16)" },
  { color: "#b9a8ff", bg: "rgba(124,92,255,0.16)" },
];

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

  return (
    <div className={styles.screen}>
      <IconSprite />
      <RecurringRunner />
      <ReminderWatcher reminders={reminders} />
      <WelcomeSheet txCount={txs.length} />

      <TopBar>
        <a href="/profile" className={styles.hello}>
          <span className={styles.helloAva}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" />
            ) : (
              (name || "U").charAt(0).toUpperCase()
            )}
          </span>
          <span style={{ minWidth: 0 }}>
            <span className={styles.helloHi}>{t("dash.hello")}</span>
            <span className={styles.helloName}>{name || t("prof.friend")}</span>
          </span>
        </a>
      </TopBar>

      <section className={styles.totbal}>
        <span className={styles.totLabel}>{t("dash.totalBalance")}</span>
        <div className={styles.balrow}>
          <span className={styles.big}>{money(totalHome, 0)}</span>
          <span className={styles.eq}>≈ {conv(totalHome, 0)}</span>
        </div>
      </section>

      <section className={`${styles.accRow} ${accounts.length >= 3 ? styles.accRowScroll : ""}`}>
        {accounts.map((a, i) => {
          const st = ACC_STYLE[i % ACC_STYLE.length];
          return (
            <div className={styles.acc} key={a.id}>
              <div className={styles.accTop}>
                <div className={styles.ai} style={{ background: st.bg, color: st.color }}>
                  <Icon id={ACC_ICON[a.type] ?? "i-wallet"} />
                </div>
                <span className={styles.accName}>{dataLabel(a.name, lang)}</span>
              </div>
              <span className={styles.accBal}>{money(a.balanceHome, 0)}</span>
              <span className={styles.cur}>≈ {conv(a.balanceHome, 0)}</span>
            </div>
          );
        })}
      </section>

      <section className={styles.periodcard}>
        <div className={styles.sec}>
          <h3 className={styles.secTitle}>{t("dash.recent")}</h3>
        </div>

        {feed.length === 0 ? (
          <EmptyState
            icon="i-wallet"
            title={t("dash.empty.exp")}
            hint={t("dash.empty.expHint")}
          />
        ) : (
          groups.map((g) => (
            <div key={g.date}>
              <div className={styles.feedDay}>
                {dayLabel(g.date, now, lang, t("rel.today"), t("rel.yesterday"))}
              </div>
              {g.items.map((tx) => (
                <div className={`${styles.tx} ${styles.clickable}`} key={tx.id} onClick={() => setViewId(tx.id)}>
                  <div className={styles.emo} style={{ background: catBg(tx.category) }}>
                    {catEmoji(tx.category, tx.type === "income")}
                  </div>
                  <div className={styles.txMid}>
                    <span className={styles.txName}>{tx.merchant || dataLabel(tx.category, lang)}</span>
                    <span className={styles.txMeta}>
                      {dataLabel(tx.category, lang)}{timeOf(tx.createdAt) ? ` · ${timeOf(tx.createdAt)}` : ""}
                    </span>
                  </div>
                  <div className={styles.amt}>
                    <span className={`${styles.amtVal} ${tx.type === "income" ? styles.inc : ""}`}>
                      {tx.type === "income" ? "+" : "−"}{money(tx.amountHome, dec)}
                    </span>
                    <span className={styles.amtSub}>≈ {conv(tx.amountHome, dec)}</span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </section>

      <BottomNav active="home" accounts={accountsForForm} />

      {viewId && (
        <TransactionViewer id={viewId} accounts={accountsForForm} onClose={() => setViewId(null)} />
      )}
    </div>
  );
}
