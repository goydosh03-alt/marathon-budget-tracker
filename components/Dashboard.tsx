"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { usd, pln } from "@/lib/currency";
import { Icon, IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";
import { periods, PERIOD_LABEL, inPeriod, catEmoji, catBg, fmtDate } from "@/lib/txui";

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
  name = "друже",
  accounts,
  totalHome,
  budgetHome,
  txs,
}: {
  name?: string;
  accounts: Account[];
  totalHome: number;
  budgetHome: number | null;
  txs: Tx[];
}) {
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [period, setPeriod] = useState("month");

  const isExpenses = tab === "expenses";
  const filtered = txs.filter(
    (t) => (isExpenses ? t.type === "expense" : t.type === "income") && inPeriod(t.date, period)
  );
  const total = filtered.reduce((s, t) => s + t.amountHome, 0);
  const list = filtered.slice(0, 5);

  const showBudget = isExpenses && budgetHome && period === "month";
  const pct = showBudget ? Math.min(100, (total / budgetHome!) * 100) : null;

  const accountsForForm = accounts.map((a) => ({ id: a.id, name: a.name, type: a.type }));

  return (
    <div className={styles.screen}>
      <IconSprite />

      <TopBar>
        <div className={styles.hi}>
          <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
          <div>
            <span className={styles.hiSmall}>Привіт 👋</span>
            <span className={styles.hiName}>{name}</span>
          </div>
        </div>
      </TopBar>

      <section className={styles.totbal}>
        <span className={styles.totLabel}>Загальний баланс</span>
        <div className={styles.balrow}>
          <span className={styles.big}>{usd(totalHome, 0)}</span>
          <span className={styles.eq}>≈ {pln(totalHome, 0)}</span>
        </div>
      </section>

      <section className={styles.accRow}>
        {accounts.map((a, i) => {
          const st = ACC_STYLE[i % ACC_STYLE.length];
          return (
            <div className={styles.acc} key={a.id}>
              <div className={styles.accTop}>
                <div className={styles.ai} style={{ background: st.bg, color: st.color }}>
                  <Icon id={ACC_ICON[a.type] ?? "i-wallet"} />
                </div>
                <span className={styles.accName}>{a.name}</span>
              </div>
              <span className={styles.accBal}>{usd(a.balanceHome, 0)}</span>
              <span className={styles.cur}>≈ {pln(a.balanceHome, 0)}</span>
            </div>
          );
        })}
        <button className={styles.accAdd} aria-label="Додати рахунок" title="Скоро">
          <Icon id="i-plus" />
        </button>
      </section>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${isExpenses ? styles.tabOnExp : ""}`} onClick={() => setTab("expenses")}>
          Витрати
        </button>
        <button className={`${styles.tab} ${!isExpenses ? styles.tabOnInc : ""}`} onClick={() => setTab("income")}>
          Дохід
        </button>
      </div>

      <section className={styles.periodcard}>
        <div className={styles.pfilter}>
          {periods.map((p) => (
            <button
              key={p.id}
              className={`${styles.pf} ${period === p.id ? styles.pfOn : ""}`}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
          <span className={styles.vdiv} />
          <button className={styles.cal} aria-label="Період">
            <Icon id="i-cal" />
          </button>
        </div>

        <div className={styles.psum}>
          <span className={styles.psumLabel}>
            {isExpenses ? "Витрачено" : "Зароблено"} · {PERIOD_LABEL[period]}
          </span>
          <div className={styles.psumRow}>
            <span className={styles.psumAmt}>{usd(total, 0)}</span>
            <span className={styles.pr}>≈ {pln(total, 0)}</span>
          </div>
        </div>
        {pct !== null && (
          <>
            <div className={styles.pbar}>
              <span className={styles.pbarFill} style={{ width: `${pct}%` }} />
            </div>
            <div className={styles.pmeta}>з {usd(budgetHome!, 0)} бюджету</div>
          </>
        )}

        <div className={styles.fulldiv} />

        <div className={styles.sec}>
          <h3 className={styles.secTitle}>Останні транзакції</h3>
          <a className={styles.secLink} href="/history">Всі →</a>
        </div>
        {list.length === 0 ? (
          <div className={styles.empty}>Немає транзакцій за цей період. Додай через «+»</div>
        ) : (
          list.map((t) => (
            <div className={styles.tx} key={t.id}>
              <div className={styles.emo} style={{ background: catBg(t.category) }}>
                {catEmoji(t.category, t.type === "income")}
              </div>
              <div>
                <span className={styles.txName}>{t.merchant || t.category}</span>
                <span className={styles.txMeta}>{t.category} · {fmtDate(t.date, t.createdAt)}</span>
              </div>
              <div className={styles.amt}>
                <span className={`${styles.amtVal} ${t.type === "income" ? styles.inc : ""}`}>
                  {t.type === "income" ? "+" : "−"}{usd(t.amountHome, 2)}
                </span>
                <span className={styles.amtSub}>{pln(t.amountHome, 2)}</span>
              </div>
            </div>
          ))
        )}
      </section>

      <BottomNav active="home" accounts={accountsForForm} />
    </div>
  );
}
