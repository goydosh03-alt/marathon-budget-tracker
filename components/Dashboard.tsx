"use client";

import { useState, useRef } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon, IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import TransactionViewer from "@/components/TransactionViewer";
import CalendarSheet from "@/components/CalendarSheet";
import EmptyState from "@/components/EmptyState";
import RecurringRunner from "@/components/RecurringRunner";
import ReminderWatcher from "@/components/ReminderWatcher";
import WelcomeSheet from "@/components/WelcomeSheet";
import type { Reminder } from "@/app/dashboard/actions";
import { periods, catEmoji, catBg } from "@/lib/txui";
import { useDec, useMoney, useConv, useT, useLang } from "@/components/SettingsProvider";
import { dataLabel, fmtDateL, type StringKey } from "@/lib/i18n";
import { periodRange, periodLabel, availOffsets } from "@/lib/periodNav";

function dmShort(isoStr: string): string {
  const [, m, d] = isoStr.split("-");
  return `${d}.${m}`;
}

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

export default function Dashboard({
  accounts,
  totalHome,
  budgetHome,
  txs,
  reminders = [],
}: {
  name?: string;
  accounts: Account[];
  totalHome: number;
  budgetHome: number | null;
  txs: Tx[];
  reminders?: Reminder[];
}) {
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [period, setPeriod] = useState("month");
  const [navIdx, setNavIdx] = useState(0);
  const [viewId, setViewId] = useState<string | null>(null);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const touch = useRef({ x: 0, y: 0 });

  const dec = useDec();
  const money = useMoney();
  const conv = useConv();
  const t = useT();
  const lang = useLang();
  const isExpenses = tab === "expenses";

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const ofTab = txs.filter((tx) => (isExpenses ? tx.type === "expense" : tx.type === "income"));
  const avail = availOffsets(period, ofTab.map((tx) => tx.date), now);
  const idx = Math.min(navIdx, avail.length - 1);
  const offset = avail[idx] ?? 0;
  const curRange = range ? { start: range.from, end: range.to } : periodRange(period, offset, now);

  const filtered = ofTab.filter((tx) => tx.date >= curRange.start && tx.date <= curRange.end);
  const total = filtered.reduce((s, tx) => s + tx.amountHome, 0);
  const list = filtered.slice(0, 5);
  const periodText = range ? `${dmShort(range.from)} – ${dmShort(range.to)}` : periodLabel(period, offset, now, lang);

  const showBudget = isExpenses && budgetHome && period === "month" && offset === 0 && !range;

  const canOlder = !range && idx < avail.length - 1;
  const canNewer = !range && idx > 0;
  function swipeStart(e: React.TouchEvent) { const p = e.touches[0]; touch.current = { x: p.clientX, y: p.clientY }; }
  function swipeEnd(e: React.TouchEvent) {
    const p = e.changedTouches[0];
    const dx = p.clientX - touch.current.x;
    const dy = p.clientY - touch.current.y;
    if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) { if (canOlder) setNavIdx(idx + 1); } else { if (canNewer) setNavIdx(idx - 1); }
  }
  const pct = showBudget ? Math.min(100, (total / budgetHome!) * 100) : null;

  const accountsForForm = accounts.map((a) => ({ id: a.id, name: a.name, type: a.type }));

  return (
    <div className={styles.screen}>
      <IconSprite />
      <RecurringRunner />
      <ReminderWatcher reminders={reminders} />
      <WelcomeSheet txCount={txs.length} />

      <TopBar>
        <div className={styles.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Snapcost"
            className={styles.brandLogo}
            onError={(e) => {
              e.currentTarget.src = "/icon-192.png";
              e.currentTarget.classList.add(styles.brandLogoFallback);
            }}
          />
        </div>
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

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${isExpenses ? styles.tabOnExp : ""}`} onClick={() => { setTab("expenses"); setNavIdx(0); }}>
          {t("common.expenses")}
        </button>
        <button className={`${styles.tab} ${!isExpenses ? styles.tabOnInc : ""}`} onClick={() => { setTab("income"); setNavIdx(0); }}>
          {t("common.income")}
        </button>
      </div>

      <section className={styles.periodcard} onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
        <div className={styles.pfilter}>
          {periods.map((p) => (
            <button
              key={p.id}
              className={`${styles.pf} ${!range && period === p.id ? styles.pfOn : ""}`}
              onClick={() => {
                setRange(null);
                setNavIdx(0);
                setPeriod(p.id);
              }}
            >
              {t(`period.${p.id}` as StringKey)}
            </button>
          ))}
          <span className={styles.vdiv} />
          <button
            className={`${styles.cal} ${range ? styles.calActive : ""}`}
            aria-label={t("common.period")}
            onClick={() => setCalOpen(true)}
          >
            <Icon id="i-cal" />
          </button>
        </div>

        <div className={styles.psumHead}>
          <div className={styles.psum}>
            <span className={styles.psumLabel}>
              {isExpenses ? t("common.expenses") : t("common.income")} · {periodText}
            </span>
            <div className={styles.psumRow}>
              <span className={styles.psumAmt}>{money(total, 0)}</span>
              <span className={styles.pr}>≈ {conv(total, 0)}</span>
            </div>
          </div>
          {!range && avail.length > 1 && avail.length <= 12 && (
            <div className={styles.psumDots}>
              {avail.map((_, i) => {
                const di = avail.length - 1 - i;
                return <button key={i} className={`${styles.mDot} ${idx === di ? styles.mDotOn : ""}`} onClick={() => setNavIdx(di)} aria-label={`${di}`} />;
              })}
            </div>
          )}
        </div>
        {pct !== null && (
          <>
            <div className={styles.pbar}>
              <span className={styles.pbarFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={styles.pmeta}>{t("dash.budgetPre")} {money(budgetHome!, 0)} {t("dash.budgetPost")}</div>
          </>
        )}

        <div className={styles.fulldiv} />

        <div className={styles.sec}>
          <h3 className={styles.secTitle}>{t("dash.recent")}</h3>
          <a className={styles.secLink} href="/history">{t("dash.all")} →</a>
        </div>
        {list.length === 0 ? (
          offset === 0 && !range && ofTab.length === 0 ? (
            <EmptyState
              icon={isExpenses ? "i-wallet" : "i-income"}
              title={isExpenses ? t("dash.empty.exp") : t("dash.empty.inc")}
              hint={isExpenses ? t("dash.empty.expHint") : t("dash.empty.incHint")}
            />
          ) : (
            <EmptyState
              icon="i-cal"
              title={t("hist.emptyPeriod")}
              hint={isExpenses ? t("rep.noDataExp") : t("rep.noDataInc")}
            />
          )
        ) : (
          list.map((t) => (
            <div className={`${styles.tx} ${styles.clickable}`} key={t.id} onClick={() => setViewId(t.id)}>
              <div className={styles.emo} style={{ background: catBg(t.category) }}>
                {catEmoji(t.category, t.type === "income")}
              </div>
              <div className={styles.txMid}>
                <span className={styles.txName}>{t.merchant || dataLabel(t.category, lang)}</span>
                <span className={styles.txMeta}>{dataLabel(t.category, lang)} · {fmtDateL(t.date, t.createdAt, lang)}</span>
              </div>
              <div className={styles.amt}>
                <span className={`${styles.amtVal} ${t.type === "income" ? styles.inc : ""}`}>
                  {t.type === "income" ? "+" : "−"}{money(t.amountHome, dec)}
                </span>
                <span className={styles.amtSub}>≈ {conv(t.amountHome, dec)}</span>
              </div>
            </div>
          ))
        )}
      </section>

      <BottomNav active="home" accounts={accountsForForm} />

      {viewId && (
        <TransactionViewer id={viewId} accounts={accountsForForm} onClose={() => setViewId(null)} />
      )}

      {calOpen && (
        <CalendarSheet
          initialFrom={range?.from ?? null}
          initialTo={range?.to ?? null}
          onApply={(from, to) => {
            setRange({ from, to });
            setCalOpen(false);
          }}
          onReset={() => {
            setRange(null);
            setCalOpen(false);
          }}
          onClose={() => setCalOpen(false)}
        />
      )}
    </div>
  );
}
