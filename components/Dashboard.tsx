"use client";

import { useState } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { usd, pln } from "@/lib/currency";
import AddTransactionForm from "@/components/AddTransactionForm";

function Icon({ id }: { id: string }) {
  return (
    <svg aria-hidden="true">
      <use href={`#${id}`} />
    </svg>
  );
}

type Account = { id: string; name: string; type: string; balanceHome: number };
type Tx = {
  id: string;
  type: string;
  amountHome: number;
  category: string | null;
  merchant: string | null;
  date: string;
};

const CAT_EMOJI: Record<string, string> = {
  Їжа: "🛒", Кафе: "☕", Транспорт: "🚌", Розваги: "🎉", Аптека: "💊",
  Одяг: "👕", Комунальні: "🏠", Зарплата: "💰", Фриланс: "💸", Подарунок: "🎁", Інше: "📦",
};
const CAT_BG: Record<string, string> = {
  Їжа: "rgba(124,92,255,0.16)", Кафе: "rgba(74,222,180,0.16)", Транспорт: "rgba(59,180,245,0.16)",
};

const ACC_ICON: Record<string, string> = { cash: "i-wallet", card: "i-card", bank: "i-card" };
const ACC_STYLE = [
  { color: "#6ee7b7", bg: "rgba(74,222,180,0.16)" },
  { color: "#7cc8f5", bg: "rgba(59,180,245,0.16)" },
  { color: "#b9a8ff", bg: "rgba(124,92,255,0.16)" },
];

function fmtDate(d: string): string {
  const date = new Date(d + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return "Сьогодні";
  if (diff === 1) return "Вчора";
  const months = ["січ", "лют", "бер", "кві", "тра", "чер", "лип", "сер", "вер", "жов", "лис", "гру"];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

const periods = [
  { id: "day", label: "День" },
  { id: "week", label: "Тиждень" },
  { id: "month", label: "Місяць" },
  { id: "year", label: "Рік" },
];

export default function Dashboard({
  name = "друже",
  accounts,
  totalHome,
  monthExpenseHome,
  monthIncomeHome,
  budgetHome,
  recent,
}: {
  name?: string;
  accounts: Account[];
  totalHome: number;
  monthExpenseHome: number;
  monthIncomeHome: number;
  budgetHome: number | null;
  recent: Tx[];
}) {
  const [tab, setTab] = useState<"expenses" | "income">("expenses");
  const [period, setPeriod] = useState("month");
  const [menuOpen, setMenuOpen] = useState(false);
  const [formType, setFormType] = useState<"expense" | "income" | null>(null);

  const isExpenses = tab === "expenses";
  const amtHome = isExpenses ? monthExpenseHome : monthIncomeHome;
  const note = isExpenses && budgetHome ? `з ${usd(budgetHome, 0)} бюджету` : null;
  const pct = isExpenses && budgetHome ? Math.min(100, (monthExpenseHome / budgetHome) * 100) : null;
  const list = recent.filter((t) => (isExpenses ? t.type === "expense" : t.type === "income"));

  const accountsForForm = accounts.map((a) => ({ id: a.id, name: a.name }));

  function openForm(t: "expense" | "income") {
    setMenuOpen(false);
    setFormType(t);
  }

  return (
    <div className={styles.screen}>
      <IconSprite />

      <header className={styles.topbar}>
        <div className={styles.hi}>
          <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
          <div>
            <span className={styles.hiSmall}>Привіт 👋</span>
            <span className={styles.hiName}>{name}</span>
          </div>
        </div>
        <div className={styles.topActions}>
          <button className={styles.curChip}>
            <span className={styles.dollar}>$</span>USD
            <Icon id="i-chev" />
          </button>
          <button className={styles.iconBtn} aria-label="Сповіщення">
            <Icon id="i-bell" />
          </button>
        </div>
      </header>

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
            {isExpenses ? "Витрачено за місяць" : "Зароблено за місяць"}
          </span>
          <div className={styles.psumRow}>
            <span className={styles.psumAmt}>{usd(amtHome, 0)}</span>
            {note && <span className={styles.pr}>{note}</span>}
          </div>
        </div>
        {pct !== null && (
          <div className={styles.pbar}>
            <span className={styles.pbarFill} style={{ width: `${pct}%` }} />
          </div>
        )}

        <div className={styles.fulldiv} />

        <div className={styles.sec}>
          <h3 className={styles.secTitle}>Останні транзакції</h3>
          <a className={styles.secLink} href="#">Всі →</a>
        </div>
        {list.length === 0 ? (
          <div className={styles.empty}>Ще немає транзакцій. Додай через «+»</div>
        ) : (
          list.map((t) => {
            const cat = t.category ?? "Інше";
            const emoji = CAT_EMOJI[cat] ?? (t.type === "income" ? "💰" : "💸");
            const bg = CAT_BG[cat] ?? "rgba(255,255,255,0.06)";
            return (
              <div className={styles.tx} key={t.id}>
                <div className={styles.emo} style={{ background: bg }}>{emoji}</div>
                <div>
                  <span className={styles.txName}>{t.merchant || cat}</span>
                  <span className={styles.txMeta}>{cat} · {fmtDate(t.date)}</span>
                </div>
                <div className={styles.amt}>
                  <span className={`${styles.amtVal} ${t.type === "income" ? styles.inc : ""}`}>
                    {t.type === "income" ? "+" : "−"}{usd(t.amountHome, 2)}
                  </span>
                  <span className={styles.amtSub}>{pln(t.amountHome, 2)}</span>
                </div>
              </div>
            );
          })
        )}
      </section>

      {menuOpen && (
        <>
          <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />
          <div className={styles.addmenu}>
            <button className={styles.addItem} onClick={() => openForm("income")}>
              <span className={styles.mi} style={{ background: "rgba(110,231,183,0.16)", color: "#6ee7b7" }}>
                <Icon id="i-income" />
              </span>
              Додати дохід
            </button>
            <div className={styles.menuDiv} />
            <button className={styles.addItem} onClick={() => openForm("expense")}>
              <span className={styles.mi} style={{ background: "rgba(124,92,255,0.16)", color: "#b9a8ff" }}>
                <Icon id="i-edit" />
              </span>
              Витрата вручну
            </button>
            <button className={styles.addItem} onClick={() => openForm("expense")}>
              <span className={styles.mi} style={{ background: "rgba(59,180,245,0.16)", color: "#7cc8f5" }}>
                <Icon id="i-scan" />
              </span>
              Сканувати чек
            </button>
          </div>
        </>
      )}

      <nav className={styles.dock}>
        <div className={styles.navbar}>
          <button className={`${styles.navItem} ${styles.navOn}`}><Icon id="i-home" />Головна</button>
          <button className={styles.navItem}><Icon id="i-list" />Історія</button>
          <button className={styles.navItem}><Icon id="i-bars" />Звіти</button>
          <button className={styles.navItem}><Icon id="i-person" />Профіль</button>
        </div>
        <button
          className={`${styles.cam} ${menuOpen ? styles.camOpen : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Додати"
        >
          <Icon id="i-plus" />
        </button>
      </nav>

      {formType && (
        <AddTransactionForm
          initialType={formType}
          accounts={accountsForForm}
          onClose={() => setFormType(null)}
        />
      )}
    </div>
  );
}

function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="i-bell" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.2a5.8 5.8 0 00-5.8 5.8c0 3.4-1 5-1.7 5.9-.5.7 0 1.6.8 1.6h13.4c.8 0 1.3-.9.8-1.6-.7-.9-1.7-2.5-1.7-5.9A5.8 5.8 0 0012 2.2z" /><path fill="currentColor" d="M9.6 18.6a2.4 2.4 0 004.8 0z" /></symbol>
      <symbol id="i-wallet" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M4 5h11a2 2 0 012 2v1h2.2A1.8 1.8 0 0121 9.8V18a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm14.6 8.1a1.4 1.4 0 100 2.8 1.4 1.4 0 000-2.8z" /></symbol>
      <symbol id="i-card" viewBox="0 0 24 24"><path fill="currentColor" d="M5 4h14a2 2 0 012 2v1H3V6a2 2 0 012-2z" /><path fill="currentColor" fillRule="evenodd" d="M3 9h18v9a2 2 0 01-2 2H5a2 2 0 01-2-2zm3 6.2h6v1.8H6z" /></symbol>
      <symbol id="i-plus" viewBox="0 0 24 24"><path fill="currentColor" d="M10.5 4a1.5 1.5 0 013 0v6.5H20a1.5 1.5 0 010 3h-6.5V20a1.5 1.5 0 01-3 0v-6.5H4a1.5 1.5 0 010-3h6.5z" /></symbol>
      <symbol id="i-income" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.4l7.6 7.6a1.4 1.4 0 01-1 2.4h-3V19a1.5 1.5 0 01-1.5 1.5h-4A1.5 1.5 0 018.6 19v-5.6h-3a1.4 1.4 0 01-1-2.4z" /></symbol>
      <symbol id="i-edit" viewBox="0 0 24 24"><path fill="currentColor" d="M3.5 17.1V20a.9.9 0 00.9.9h2.9a.6.6 0 00.43-.18L17.85 10.55l-4.4-4.4L3.68 16.67a.6.6 0 00-.18.43z" /><path fill="currentColor" d="M20.7 6.35l-2.05-2.05a1.4 1.4 0 00-2 0L14.9 5.05l4.4 4.4 1.4-1.4a1.4 1.4 0 000-1.7z" /></symbol>
      <symbol id="i-scan" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M9 4l-1.3 1.8H4.5A2.5 2.5 0 002 8.3v9.2A2.5 2.5 0 004.5 20h15a2.5 2.5 0 002.5-2.5V8.3a2.5 2.5 0 00-2.5-2.5h-3.2L15 4zm3 4.6A4.2 4.2 0 1012 17a4.2 4.2 0 000-8.4z" /><circle cx="12" cy="12.8" r="2.3" fill="currentColor" /></symbol>
      <symbol id="i-cal" viewBox="0 0 24 24"><path fill="currentColor" d="M8 2v2H6a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-2V2h-2v2H10V2zm12 8H4v9a2 2 0 002 2h12a2 2 0 002-2z" /></symbol>
      <symbol id="i-home" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M11.3 3.3a1 1 0 011.4 0l8.4 7.6a1 1 0 01-.67 1.74H19.5V20a1 1 0 01-1 1h-3.5v-5a3 3 0 00-6 0v5H5.5a1 1 0 01-1-1v-7.36H3.57a1 1 0 01-.67-1.74z" /></symbol>
      <symbol id="i-list" viewBox="0 0 24 24"><circle cx="4.7" cy="6.5" r="1.6" fill="currentColor" /><rect x="8.6" y="5.3" width="11.4" height="2.4" rx="1.2" fill="currentColor" /><circle cx="4.7" cy="12" r="1.6" fill="currentColor" /><rect x="8.6" y="10.8" width="11.4" height="2.4" rx="1.2" fill="currentColor" /><circle cx="4.7" cy="17.5" r="1.6" fill="currentColor" /><rect x="8.6" y="16.3" width="11.4" height="2.4" rx="1.2" fill="currentColor" /></symbol>
      <symbol id="i-bars" viewBox="0 0 24 24"><rect x="4" y="11" width="3.6" height="8.5" rx="1.2" fill="currentColor" /><rect x="10.2" y="5.5" width="3.6" height="14" rx="1.2" fill="currentColor" /><rect x="16.4" y="13.5" width="3.6" height="6" rx="1.2" fill="currentColor" /></symbol>
      <symbol id="i-person" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4.2" fill="currentColor" /><path fill="currentColor" d="M3.8 20.2c0-3.7 3.7-6 8.2-6s8.2 2.3 8.2 6v.6a.6.6 0 01-.6.6H4.4a.6.6 0 01-.6-.6z" /></symbol>
      <symbol id="i-chev" viewBox="0 0 24 24"><path fill="currentColor" d="M6.5 9.5h11L12 15z" /></symbol>
    </svg>
  );
}
