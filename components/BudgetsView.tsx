"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ds from "@/app/dashboard/ds.module.css";
import b from "@/app/budget/budget.module.css";
import DsIcon from "@/components/ds/Icon";
import { IconSprite } from "@/components/IconSprite";
import BottomNav from "@/components/BottomNav";
import SubHeader from "@/components/SubHeader";
import styles from "@/app/dashboard/dashboard.module.css";
import AmountKeypad from "@/components/AmountKeypad";
import { evalExpr, trimNum } from "@/lib/calc";
import { useMoney, useConv, useDec, useT, useLang } from "@/components/SettingsProvider";
import { catVisual } from "@/lib/catIcon";
import { dataLabel, type Lang, type StringKey } from "@/lib/i18n";

type MoneyFn = ReturnType<typeof useMoney>;
type TFn = ReturnType<typeof useT>;
import { createBudget, deleteBudget, type BudgetInput } from "@/app/budget/actions";

type Period = "day" | "week" | "month";
type Budget = {
  id: string;
  type: "overall" | "category";
  category: string | null;
  period: Period;
  startRef: number | null;
  amount: number;
};
type Tx = { amountHome: number; category: string; date: string; createdAt: string };
type Account = { id: string; name: string; type: string };

// категорії за замовчуванням для майстра (як у формі додавання витрати)
const WIZ_CATS = ["Їжа", "Кафе", "Транспорт", "Розваги", "Комунальні", "Аптека"];
const localeOf = (l: Lang) => (l === "uk" ? "uk-UA" : l === "ru" ? "ru-RU" : "en-GB");

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const DAY = 86400000;

// Вікно періоду бюджету від сьогодні.
function windowOf(period: Period, startRef: number | null, now: Date) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (period === "day") {
    return { start: isoDate(d), end: isoDate(d), daysTotal: 1, daysLeft: 1 };
  }
  if (period === "week") {
    const wk = startRef && startRef >= 1 && startRef <= 7 ? startRef : 1; // 1=Пн..7=Нд
    const todayIso = ((d.getDay() + 6) % 7) + 1;
    const back = (todayIso - wk + 7) % 7;
    const s = new Date(d);
    s.setDate(d.getDate() - back);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return {
      start: isoDate(s),
      end: isoDate(e),
      daysTotal: 7,
      daysLeft: Math.round((e.getTime() - d.getTime()) / DAY) + 1,
    };
  }
  const ref = Math.min(28, Math.max(1, startRef ?? 1));
  let s = new Date(d.getFullYear(), d.getMonth(), ref);
  if (d.getTime() < s.getTime()) s = new Date(d.getFullYear(), d.getMonth() - 1, ref);
  const e = new Date(s.getFullYear(), s.getMonth() + 1, ref - 1);
  return {
    start: isoDate(s),
    end: isoDate(e),
    daysTotal: Math.round((e.getTime() - s.getTime()) / DAY) + 1,
    daysLeft: Math.round((e.getTime() - d.getTime()) / DAY) + 1,
  };
}

// Прогрес-кільце навколо іконки.
function Ring({
  pct,
  color,
  over,
  size,
  sw,
  children,
}: {
  pct: number;
  color: string;
  over: boolean;
  size: number;
  sw: number;
  children: React.ReactNode;
}) {
  const r = (size - sw) / 2;
  const C = 2 * Math.PI * r;
  const off = C * (1 - Math.min(100, Math.max(0, over ? 100 : pct)) / 100);
  const ic = size - sw * 2 - 10;
  const stroke = over ? "var(--sc-danger)" : color;
  return (
    <div className={b.ringwrap} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ transform: "rotate(-90deg)", overflow: "visible", display: "block" }}>
        <circle className={b.rt} cx={size / 2} cy={size / 2} r={r} strokeWidth={sw} fill="none" />
        <circle className={b.rv} cx={size / 2} cy={size / 2} r={r} strokeWidth={sw} stroke={stroke} strokeDasharray={C} strokeDashoffset={off} fill="none" strokeLinecap="round" />
      </svg>
      <span className={b.ringico} style={{ background: stroke, width: ic, height: ic }}>{children}</span>
    </div>
  );
}

export default function BudgetsView({
  accounts,
  budgets,
  txs,
}: {
  accounts: Account[];
  budgets: Budget[];
  txs: Tx[];
}) {
  const money = useMoney();
  const conv = useConv();
  const dec = useDec();
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [detailId, setDetailId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const now = new Date();

  // залишок по кожному бюджету рахуємо з наявних витрат
  const calc = useMemo(() => {
    const map: Record<string, { spent: number; left: number; win: ReturnType<typeof windowOf>; rows: Tx[] }> = {};
    for (const bud of budgets) {
      const win = windowOf(bud.period, bud.startRef, now);
      const rows = txs.filter(
        (x) =>
          x.date >= win.start &&
          x.date <= win.end &&
          (bud.type === "overall" || x.category === bud.category)
      );
      const spent = rows.reduce((s, x) => s + x.amountHome, 0);
      map[bud.id] = { spent, left: bud.amount - spent, win, rows };
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budgets, txs]);

  const overall = budgets.find((x) => x.type === "overall");
  const cats = budgets.filter((x) => x.type === "category");
  const usedCats = cats.map((x) => x.category);

  const periodLabel = (p: Period) =>
    p === "day" ? t("budget.periodDay") : p === "week" ? t("budget.periodWeek") : t("budget.periodMonth");
  const leftPhrase = (p: Period) =>
    p === "day" ? t("budget.thisDay") : p === "week" ? t("budget.thisWeek") : t("budget.thisMonth");
  const titleOf = (bud: Budget) =>
    bud.type === "category" && bud.category ? dataLabel(bud.category, lang) : t("budget.typeOverall");

  // Витрати за категоріями у вікні бюджету (для сегментів і легенди).
  function spendByCat(rows: Tx[]) {
    const m = new Map<string, number>();
    for (const r of rows) m.set(r.category, (m.get(r.category) ?? 0) + r.amountHome);
    return Array.from(m.entries())
      .filter(([, v]) => v > 0)
      .sort((a, z) => z[1] - a[1]);
  }

  // ---------- ДЕТАЛІ ----------
  if (detailId) {
    const bud = budgets.find((x) => x.id === detailId);
    if (bud) {
      const c = calc[bud.id];
      const over = c.left < 0;
      const pct = Math.min(100, Math.round((c.spent / bud.amount) * 100));
      const perDay = Math.max(0, c.left) / c.win.daysTotal;
      const isCat = bud.type === "category";
      const vis = isCat && bud.category ? catVisual(bud.category, false) : null;
      const ringColor = isCat && vis ? vis.color : "var(--sc-accent)";
      const parts = spendByCat(c.rows);

      const groups: Record<string, Tx[]> = {};
      for (const r of [...c.rows].sort((a, z) => (a.date < z.date ? 1 : (a.createdAt < z.createdAt ? 1 : -1)))) {
        const label =
          r.date === isoDate(now)
            ? t("budget.today")
            : new Date(r.date + "T00:00:00").toLocaleDateString(localeOf(lang), { day: "numeric", month: "short" });
        (groups[label] = groups[label] || []).push(r);
      }

      return (
        <div className={ds.screen}>
          <IconSprite />
          <div className={ds.content}>
            <SubHeader
              title={titleOf(bud)}
              onBack={() => setDetailId(null)}
              right={
                <button
                  className={styles.iconBtn}
                  style={{ color: "var(--sc-danger)" }}
                  disabled={pending}
                  onClick={() => startTransition(async () => { await deleteBudget(bud.id); setDetailId(null); router.refresh(); })}
                  aria-label={t("common.delete")}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 6.5h16M9.5 6.5V4.8h5v1.7M6.5 6.5l.8 12a1.6 1.6 0 001.6 1.5h6.2a1.6 1.6 0 001.6-1.5l.8-12" />
                  </svg>
                </button>
              }
            />

            <div className={b.dhero}>
              <Ring pct={pct} color={ringColor} over={over} size={84} sw={6}>
                <DsIcon name={isCat && vis ? (vis.icon ?? "BoldBill") : "BoldMoneySafeSquare"} size={30} />
              </Ring>
              <div className={b.dbig} style={over ? { color: "var(--sc-danger)" } : undefined}>{money(Math.abs(c.left), dec)}</div>
              <div className={b.dsub}>{over ? t("budget.overspentWord") : `${t("budget.left")} ${leftPhrase(bud.period)}`}</div>
              <div className={b.dchip}>{periodLabel(bud.period)} · {c.win.daysLeft} {t("budget.daysLeft")}</div>
            </div>

            {!isCat && parts.length > 0 && (
              <>
                <div className={b.sectlbl}>{t("budget.overallProgress")}</div>
                <div className={b.opbar}>
                  {parts.map(([cat, amt]) => {
                    const cv = catVisual(cat, false);
                    const w = Math.max(2, Math.round((amt / bud.amount) * 100));
                    return <i key={cat} style={{ width: `${over ? 100 / parts.length : w}%`, background: over ? "var(--sc-danger)" : cv.color }} />;
                  })}
                </div>
                <div className={b.dends}><span>{money(c.spent, dec)} {t("budget.spent").toLowerCase()}</span><span>{money(bud.amount, dec)}</span></div>
              </>
            )}

            <div className={b.statcard}>
              <div className={b.strow}><span className={b.stl}>{t("budget.spent")}</span><span className={b.stv}>{money(c.spent, dec)}</span></div>
              <div className={b.strow}><span className={b.stl}>{t("budget.budgetWord")}</span><span className={b.stv}>{money(bud.amount, dec)}</span></div>
              <div className={b.strow}><span className={b.stl}>{over ? t("budget.overspentWord") : t("budget.left")}</span><span className={`${b.stv} ${over ? b.stvOver : b.stvAccent}`}>{money(Math.abs(c.left), dec)}</span></div>
              <div className={b.strow}><span className={b.stl}>{t("budget.leftEachDay")}</span><span className={b.stv}>{money(perDay, dec)}</span></div>
            </div>

            {!isCat && parts.length > 0 && (
              <>
                <div className={b.sectlbl}>{t("budget.spendingByCategory")}</div>
                <div className={b.leg}>
                  {parts.map(([cat, amt]) => {
                    const cv = catVisual(cat, false);
                    return (
                      <div className={b.legrow} key={cat}>
                        <span className={b.legdot} style={{ background: cv.color }} />
                        <span className={b.legnm}>{dataLabel(cat, lang)}</span>
                        <span className={b.legamt}>{money(amt, dec)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className={b.sectlbl}>{t("budget.transactions")}</div>
            {c.rows.length === 0 ? (
              <div className={b.demohint}>{t("budget.noExpenses")}</div>
            ) : (
              Object.entries(groups).map(([label, rows]) => {
                const sum = rows.reduce((s, x) => s + x.amountHome, 0);
                return (
                  <div className={ds.daygroup} key={label}>
                    <div className={ds.dayhead}><span>{label}</span><span>-{money(sum, dec)}</span></div>
                    <div className={ds.daycard}>
                      {rows.map((r, i) => {
                        const cv = catVisual(r.category, false);
                        return (
                          <div key={i}>
                            {i > 0 && <div className={ds.hair} />}
                            <div className={ds.txrow}>
                              <span className={ds.cat} style={{ background: cv.color }}><DsIcon name={cv.icon ?? "BoldBill"} size={20} /></span>
                              <span className={ds.txmid}><span className={ds.txname}>{dataLabel(r.category, lang)}</span></span>
                              <span className={ds.amt}><span className={ds.amtVal}>-{money(r.amountHome, dec)}</span><span className={ds.amtSub}>≈ {conv(r.amountHome, dec)}</span></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <BottomNav active="budget" accounts={accounts} />
        </div>
      );
    }
  }

  // ---------- СПИСОК ----------
  const overallParts = overall ? spendByCat(calc[overall.id].rows) : [];
  return (
    <div className={ds.screen}>
      <IconSprite />
      <div className={ds.content}>
        <header className={ds.headerbar}>
          <span className={b.pagetitle}>{t("budget.title")}</span>
        </header>

        {budgets.length === 0 ? (
          <div className={b.empty}>
            <span className={b.emptyDisc}><DsIcon name="BoldMoneySafeSquare" size={30} /></span>
            <div className={b.emptyTitle}>{t("budget.emptyTitle")}</div>
            <div className={b.emptyHint}>{t("budget.emptyHint")}</div>
            <button className={b.emptyCta} onClick={() => setWizardOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10.5 4a1.5 1.5 0 013 0v6.5H20a1.5 1.5 0 010 3h-6.5V20a1.5 1.5 0 01-3 0v-6.5H4a1.5 1.5 0 010-3h6.5z" /></svg>
              {t("budget.createBudget")}
            </button>
          </div>
        ) : (
          <>
            {overall && (() => {
              const c = calc[overall.id];
              const over = c.left < 0;
              const pct = Math.min(100, Math.round((c.spent / overall.amount) * 100));
              return (
                <button className={b.ohero} onClick={() => setDetailId(overall.id)}>
                  <span className={ds.scope}><span className={ds.scopedot}><DsIcon name="BoldMoneySafeSquare" size={12} /></span>{t("budget.typeOverall")}</span>
                  <span className={ds.balance}><span className={ds.big} style={over ? { color: "var(--sc-danger)" } : undefined}>{money(Math.abs(c.left), dec)}</span><span className={ds.conv}>≈ {conv(Math.abs(c.left), dec)}</span></span>
                  <div className={b.oprog}>
                    <div className={b.oprogtop}>
                      <span className={b.oplbl}>{over ? t("budget.overspentWord") : `${t("budget.left")} ${leftPhrase(overall.period)}`}</span>
                      <span className={b.opspent}><span className={over ? b.oppctOver : b.oppct}>{pct}%</span> {t("budget.spent").toLowerCase()}</span>
                    </div>
                    <div className={b.opbar}>
                      {overallParts.length === 0
                        ? <i style={{ width: "0%", background: "var(--sc-accent)" }} />
                        : overallParts.map(([cat, amt]) => {
                            const cv = catVisual(cat, false);
                            const w = Math.max(2, Math.round((amt / overall.amount) * 100));
                            return <i key={cat} style={{ width: `${over ? 100 / overallParts.length : w}%`, background: over ? "var(--sc-danger)" : cv.color }} />;
                          })}
                    </div>
                  </div>
                </button>
              );
            })()}

            {cats.length === 0 ? (
              <div className={b.ctafull} onClick={() => setWizardOpen(true)}>
                <span className={b.ctaplus}><svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M10.5 4a1.5 1.5 0 013 0v6.5H20a1.5 1.5 0 010 3h-6.5V20a1.5 1.5 0 01-3 0v-6.5H4a1.5 1.5 0 010-3h6.5z" /></svg></span>
                <div className={b.ctafullT}>{t("budget.categoryBudgets")}</div>
                <div className={b.ctafullS}>{t("budget.categoryBudgetsDesc")}</div>
              </div>
            ) : (
              <>
                <button className={b.ctatop} onClick={() => setWizardOpen(true)}>
                  <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M10.5 4a1.5 1.5 0 013 0v6.5H20a1.5 1.5 0 010 3h-6.5V20a1.5 1.5 0 01-3 0v-6.5H4a1.5 1.5 0 010-3h6.5z" /></svg>
                  {t("budget.addAnotherCategory")}
                </button>
                <div className={b.cgrid}>
                  {cats.map((bud) => {
                    const c = calc[bud.id];
                    const over = c.left < 0;
                    const pct = Math.min(100, Math.round((c.spent / bud.amount) * 100));
                    const cv = bud.category ? catVisual(bud.category, false) : null;
                    return (
                      <button className={b.cgcard} key={bud.id} onClick={() => setDetailId(bud.id)}>
                        <Ring pct={pct} color={cv?.color ?? "var(--sc-accent)"} over={over} size={52} sw={4}>
                          <DsIcon name={cv?.icon ?? "BoldBill"} size={19} />
                        </Ring>
                        <div className={b.cgname}>{titleOf(bud)}</div>
                        <div className={b.cgamt} style={over ? { color: "var(--sc-danger)" } : undefined}>{money(c.spent, dec)}</div>
                        <div className={b.cglbl}>{over ? `${t("budget.overBy")} ${money(Math.abs(c.left), dec)}` : `/ ${money(c.left, dec)} ${t("budget.left").toLowerCase()}`}</div>
                      </button>
                    );
                  })}

                </div>
              </>
            )}
          </>
        )}
      </div>

      <BottomNav active="budget" accounts={accounts} />

      {wizardOpen && (
        <BudgetWizard
          lang={lang}
          money={money}
          hasOverall={!!overall}
          overallAmount={overall?.amount ?? 0}
          overallPeriod={overall?.period ?? "week"}
          allocatedByCats={cats.reduce((s, x) => s + x.amount, 0)}
          usedCats={usedCats}
          pending={pending}
          onClose={() => setWizardOpen(false)}
          onCreate={(input) =>
            startTransition(async () => {
              await createBudget(input);
              setWizardOpen(false);
              router.refresh();
            })
          }
        />
      )}
    </div>
  );
}

// =====================================================================
// Майстер створення бюджету
// =====================================================================
type WizStep = "type" | "category" | "period" | "start" | "amount";

function BudgetWizard({
  lang,
  money,
  hasOverall,
  overallAmount,
  overallPeriod,
  allocatedByCats,
  usedCats,
  pending,
  onClose,
  onCreate,
}: {
  lang: Lang;
  money: MoneyFn;
  hasOverall: boolean;
  overallAmount: number;
  overallPeriod: Period;
  allocatedByCats: number;
  usedCats: (string | null)[];
  pending: boolean;
  onClose: () => void;
  onCreate: (input: BudgetInput) => void;
}) {
  const t = useT();
  const freeCat = WIZ_CATS.find((c) => !usedCats.includes(c)) ?? "";

  const [type, setType] = useState<"overall" | "category">(hasOverall ? "category" : "overall");
  const [category, setCategory] = useState(freeCat);
  const [period, setPeriod] = useState<Period>("week");
  const [start, setStart] = useState<number>(1);
  const [amount, setAmount] = useState(0);
  const [expr, setExpr] = useState("");
  const [alloc, setAlloc] = useState(Math.min(Math.round(overallAmount * 0.2), Math.max(0, overallAmount - allocatedByCats)));
  const [step, setStep] = useState(0);

  const isCat = type === "category";
  const allocMode = isCat && hasOverall; // category під наявний overall → повзунок розподілу
  const steps: WizStep[] = allocMode
    ? ["category", "amount"]
    : isCat
    ? (period === "day" ? ["type", "category", "period", "amount"] : ["type", "category", "period", "start", "amount"])
    : (period === "day" ? ["type", "period", "amount"] : ["type", "period", "start", "amount"]);
  const key = steps[Math.min(step, steps.length - 1)];
  const last = step === steps.length - 1;
  const prog = Math.round(((step + 1) / steps.length) * 100);

  const available = Math.max(0, overallAmount - allocatedByCats);
  const padResult = evalExpr(expr);

  function commit() {
    const finalPeriod = allocMode ? overallPeriod : period;
    const amt = allocMode ? alloc : amount;
    if (!(amt > 0)) return;
    const startRef = finalPeriod === "day" ? null : start;
    onCreate({ type, category: isCat ? category : null, period: finalPeriod, startRef, amount: amt });
  }

  function next() {
    if (!last) { setStep(step + 1); return; }
    commit();
  }
  function back() {
    if (step === 0) { onClose(); return; }
    setStep(step - 1);
  }

  const ctaHidden = key === "amount" && !allocMode; // на кроці суми кнопку заміняє ✓ у калькуляторі

  return (
    <div className={b.wiz}>
      <div className={b.wtop}>
        <button className={b.iconbtn} onClick={back} aria-label={t("common.back")}>
          {step === 0
            ? <svg width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" /></svg>}
        </button>
        <div className={`${b.ringpill} ${prog === 100 ? b.ringpillFull : ""}`}>{prog}%</div>
      </div>

      <div className={b.wbody}>
        {key === "type" && (
          <>
            <h2 className={b.wtitle}>{t("budget.type")}</h2>
            <div className={b.wdesc}>{t("budget.typeDesc")}</div>
            <div className={b.optlist}>
              <button className={`${b.opt} ${type === "overall" ? b.optOn : ""}`} onClick={() => setType("overall")}>{t("budget.typeOverall")}</button>
              <button className={`${b.opt} ${type === "category" ? b.optOn : ""}`} onClick={() => setType("category")}>{t("budget.typeCategory")}</button>
            </div>
          </>
        )}

        {key === "category" && (
          <>
            <h2 className={b.wtitle}>{t("budget.chooseCategory")}</h2>
            <div className={b.wdesc}>{t("budget.typeDesc")}</div>
            <div className={b.optlist} style={{ marginTop: 24 }}>
              {WIZ_CATS.map((c) => {
                const used = usedCats.includes(c);
                const cv = catVisual(c, false);
                return (
                  <button key={c} className={`${b.opt} ${b.optCat} ${category === c ? b.optOn : ""} ${used ? b.optDis : ""}`}
                    disabled={used}
                    onClick={() => { if (!used) setCategory(c); }}>
                    <span className={b.optcd} style={{ background: cv.color }}><DsIcon name={cv.icon ?? "BoldBill"} size={17} /></span>
                    {dataLabel(c, lang)}
                    {used && <span className={b.optAdded}>{t("budget.added")}</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {key === "period" && (
          <>
            <h2 className={b.wtitle}>{t("budget.timeframe")}</h2>
            <div className={b.wdesc}>{t("budget.timeframeDesc")}</div>
            <div className={b.optlist}>
              {(["day", "week", "month"] as Period[]).map((p) => (
                <button key={p} className={`${b.opt} ${period === p ? b.optOn : ""}`} onClick={() => setPeriod(p)}>{periodName(p, t)}</button>
              ))}
            </div>
          </>
        )}

        {key === "start" && period === "week" && (
          <>
            <h2 className={b.wtitle}>{t("budget.startWeek")}</h2>
            <div className={b.wdesc}>{t("budget.startDesc")}</div>
            <div className={b.optlist} style={{ marginTop: 24 }}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button key={d} className={`${b.opt} ${start === d ? b.optOn : ""}`} onClick={() => setStart(d)}>{weekdayName(d, t)}</button>
              ))}
            </div>
          </>
        )}

        {key === "start" && period === "month" && (
          <>
            <h2 className={b.wtitle}>{t("budget.startMonth")}</h2>
            <div className={b.wdesc}>{t("budget.startDesc")}</div>
            <div className={b.optlist} style={{ marginTop: 24 }}>
              {[1, 5, 10, 15, 20, 25].map((d) => (
                <button key={d} className={`${b.opt} ${start === d ? b.optOn : ""}`} onClick={() => setStart(d)}>{d}</button>
              ))}
            </div>
          </>
        )}

        {key === "amount" && allocMode && (
          <AllocSlider
            total={overallAmount}
            available={available}
            allocatedByCats={allocatedByCats}
            value={alloc}
            money={money}
            onChange={setAlloc}
            t={t}
          />
        )}

        {key === "amount" && !allocMode && (
          <>
            <h2 className={b.wtitle}>{t("budget.amountTitle")}</h2>
            <div className={b.wdesc}>{t("budget.amountDesc")}</div>
            <div className={b.amtBig}>
              {padResult !== null ? trimNum(padResult) : amount ? String(amount) : "0"}
              <span className={b.amtCur}>zł</span>
            </div>
          </>
        )}
      </div>

      {ctaHidden ? (
        <div className={b.wpad}>
          <AmountKeypad expr={expr} result={padResult} onExpr={setExpr} />
          <button className={b.cta} disabled={padResult === null || padResult < 0 || pending}
            onClick={() => { if (padResult === null) return; setAmount(Math.round(padResult * 100) / 100); commitAmount(padResult); }}>
            {t("budget.create")}
          </button>
        </div>
      ) : (
        <div className={b.wcta}>
          <button className={b.cta} onClick={next} disabled={pending || (allocMode && last && !(alloc > 0))}>
            {last ? t("budget.create") : t("budget.continue")}
          </button>
        </div>
      )}
    </div>
  );

  // на кроці суми (overall/самостійна категорія) ✓ = створити одразу з результатом калькулятора
  function commitAmount(r: number) {
    const finalPeriod = period;
    const startRef = finalPeriod === "day" ? null : start;
    if (!(r > 0)) return;
    onCreate({ type, category: isCat ? category : null, period: finalPeriod, startRef, amount: Math.round(r * 100) / 100 });
  }
}

// Повзунок розподілу бюджету на категорію.
function AllocSlider({
  total,
  available,
  allocatedByCats,
  value,
  money,
  onChange,
  t,
}: {
  total: number;
  available: number;
  allocatedByCats: number;
  value: number;
  money: MoneyFn;
  onChange: (v: number) => void;
  t: TFn;
}) {
  const usedPct = Math.max(0, Math.min(100, Math.round((allocatedByCats / total) * 100)));
  const availPct = 100 - usedPct;
  const pct = Math.max(0, Math.min(availPct, Math.round((value / total) * 100)));
  const leftAfter = Math.max(0, available - value);

  function onPointer(e: React.PointerEvent<HTMLDivElement>) {
    if (e.type === "pointermove" && !e.buttons) return;
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    let p = Math.round(((r.bottom - e.clientY) / r.height) * 100);
    p = Math.max(0, Math.min(availPct, p));
    onChange(Math.min(available, Math.round((total * p) / 100)));
  }

  return (
    <>
      <h2 className={b.wtitle}>{t("budget.allocateTitle")}</h2>
      <div className={b.wdesc}>{t("budget.allocateShare")} {money(total)}.</div>
      <div className={b.allocwrap}>
        <div className={b.allocamt}>{money(value)}</div>
        <div className={b.allocmeta}>{money(leftAfter)} {t("budget.leftToAllocate")}</div>
      </div>
      <div className={b.allocslider} onPointerDown={onPointer} onPointerMove={onPointer}>
        {allocatedByCats > 0 && <div className={b.allocused} style={{ height: `${usedPct}%` }} />}
        <div className={b.allocfill} style={{ height: `${pct}%` }} />
        <div className={b.allochandle} style={{ bottom: `${pct}%` }} />
        <div className={`${b.allocpct} ${pct > 85 ? b.allocpctBelow : ""}`} style={{ bottom: `${pct}%` }}>{pct}%</div>
      </div>
    </>
  );
}

function periodName(p: Period, t: TFn) {
  return p === "day" ? t("budget.periodDay") : p === "week" ? t("budget.periodWeek") : t("budget.periodMonth");
}
function weekdayName(d: number, t: TFn) {
  const keys: StringKey[] = ["budget.mon", "budget.tue", "budget.wed", "budget.thu", "budget.fri", "budget.sat", "budget.sun"];
  return t(keys[d - 1]);
}
