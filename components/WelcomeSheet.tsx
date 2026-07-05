"use client";

// Онбординг v2: три слайди зі свайпом і міні-мокапами реального інтерфейсу.
// Показується один раз новому користувачу (нема транзакцій + нема прапорця).
// Реальний навбар застосунку НЕ чіпаємо — знизу слайда його намальована копія.
import { useState, useEffect, useRef } from "react";
import styles from "@/app/dashboard/dashboard.module.css";
import { Icon } from "@/components/IconSprite";
import { useT, useLang, useCurrency } from "@/components/SettingsProvider";
import { dataLabel } from "@/lib/i18n";
import { currencyMeta } from "@/lib/currency";

const FLAG = "sc_onboarded";

export default function WelcomeSheet({ txCount }: { txCount: number }) {
  const t = useT();
  const lang = useLang();
  const sym = currencyMeta(useCurrency()).symbol;
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const touch = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      if (txCount === 0 && localStorage.getItem(FLAG) !== "1") setOpen(true);
    } catch {}
  }, [txCount]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function close() {
    try { localStorage.setItem(FLAG, "1"); } catch {}
    setOpen(false);
  }

  function swipeStart(e: React.TouchEvent) {
    const p = e.touches[0];
    touch.current = { x: p.clientX, y: p.clientY };
  }
  function swipeEnd(e: React.TouchEvent) {
    const p = e.changedTouches[0];
    const dx = p.clientX - touch.current.x;
    const dy = p.clientY - touch.current.y;
    if (Math.abs(dx) < 35 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) setIdx((i) => Math.min(2, i + 1));
    else setIdx((i) => Math.max(0, i - 1));
  }

  if (!open) return null;

  const titles = [t("onb.s1.title"), t("onb.s2.title"), t("onb.s3.title")];
  const subs = [t("onb.s1.sub"), t("onb.s2.sub"), t("onb.s3.sub")];

  const skelRow = (w: string, h: number, mt: number) => (
    <div style={{ width: w, height: h, background: "rgba(255,255,255,0.06)", borderRadius: 10, marginTop: mt }} />
  );

  return (
    <div className={styles.sheetWrap}>
      <div className={styles.sheetBack} onClick={close} />
      <div className={styles.sheet}>
        <div className={styles.sheetBody}>
          <div className={styles.sheetTitle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{t("onb.welcome")}</span>
            <button className={styles.iconBtn} onClick={close} aria-label={t("common.close")}>
              <Icon id="i-x" />
            </button>
          </div>

          <div className={styles.onbView} onTouchStart={swipeStart} onTouchEnd={swipeEnd}>
            <div className={styles.onbTrack} style={{ transform: `translateX(-${idx * 100}%)` }}>

              {/* Слайд 1: пригашена головна + копія нашого навбара, пульсує «+» */}
              <div className={styles.onbSlide}>
                <div className={styles.onbMock}>
                  <div style={{ opacity: 0.3 }}>
                    {skelRow("38%", 9, 0)}
                    {skelRow("55%", 20, 8)}
                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                      <div style={{ flex: 1, height: 44, background: "rgba(255,255,255,0.06)", borderRadius: 12 }} />
                      <div style={{ flex: 1, height: 44, background: "rgba(255,255,255,0.06)", borderRadius: 12 }} />
                    </div>
                  </div>
                  <div className={styles.onbBubble}>{t("onb.s1.title")}</div>
                  {/* копія навбара: пігулка з 4 вкладками + окрема кнопка «+» праворуч */}
                  <div style={{ marginTop: "auto", display: "flex", gap: 8, alignItems: "stretch" }}>
                    <div style={{ flex: 1, display: "flex", justifyContent: "space-around", alignItems: "center", background: "rgba(18,28,30,0.97)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "9px 6px" }}>
                      {(["i-home", "i-list", "i-bars", "i-menu"] as const).map((ic) => (
                        <span key={ic} style={{ color: "rgba(255,255,255,0.35)", display: "flex" }}>
                          <Icon id={ic} />
                        </span>
                      ))}
                    </div>
                    <div className={styles.onbCamPulse} style={{ width: 46, background: "rgba(18,28,30,0.97)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 4, display: "flex" }}>
                      <span style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, background: "rgba(74,222,159,0.22)", color: "#4ade9f" }}>
                        <Icon id="i-plus" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Слайд 2: меню «+» з підсвіченим сканом + чек з лінією сканування */}
              <div className={styles.onbSlide}>
                <div className={styles.onbMock}>
                  <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(74,222,159,0.45)", borderRadius: 12, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, color: "#cfe8de", fontSize: 12.5 }}>
                    <span style={{ color: "#4ade9f", display: "flex" }}><Icon id="i-scan" /></span>
                    {t("nav.scanReceipt")}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.35)", fontSize: 12.5, marginTop: 6 }}>
                    <span style={{ display: "flex" }}><Icon id="i-edit" /></span>
                    {t("nav.addExpense")}
                  </div>
                  <div style={{ flex: 1, marginTop: 10, border: "1.5px dashed rgba(255,255,255,0.16)", borderRadius: 14, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 68, background: "#f3efe6", borderRadius: 4, padding: "8px 7px" }}>
                      {[["70%", "#c9c2b2", 5], ["100%", "#d8d2c3", 4], ["85%", "#d8d2c3", 4], ["60%", "#d8d2c3", 4], ["50%", "#a89f8a", 5]].map(([w, c, h], i) => (
                        <div key={i} style={{ width: w as string, height: h as number, background: c as string, borderRadius: 2, marginTop: i ? 4 : 0 }} />
                      ))}
                    </div>
                    <div className={styles.onbScanline} />
                  </div>
                  <div style={{ alignSelf: "center", marginTop: 8, background: "rgba(74,222,159,0.14)", color: "#7fe0b8", fontSize: 12, padding: "5px 12px", borderRadius: 999 }}>
                    {t("onb.scanning")}
                  </div>
                </div>
              </div>

              {/* Слайд 3: розпізнана транзакція + міні-звіт */}
              <div className={styles.onbSlide}>
                <div className={styles.onbMock}>
                  <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(124,92,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛒</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: "#eaf2f0", fontSize: 12.5 }}>Biedronka</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10.5 }}>{dataLabel("Їжа", lang)} · {t("rel.today")}</div>
                      </div>
                      <div style={{ color: "#eaf2f0", fontSize: 13, fontWeight: 600 }}>−47.30 {sym}</div>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8, paddingTop: 6, display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.4)", fontSize: 10.5 }}>
                      <span>{t("onb.item1")}</span><span>4.99</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.4)", fontSize: 10.5, marginTop: 3 }}>
                      <span>{t("onb.item2")}</span><span>3.50</span>
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10.5, marginTop: 3 }}>{t("onb.moreItems")}</div>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
                    <svg width="78" height="78" viewBox="0 0 42 42" aria-hidden="true">
                      <circle cx="21" cy="21" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                      <circle cx="21" cy="21" r="15.9" fill="none" stroke="#4ade9f" strokeWidth="7" strokeDasharray="55 45" strokeDashoffset="25" strokeLinecap="round" />
                      <circle cx="21" cy="21" r="15.9" fill="none" stroke="#3bb4f5" strokeWidth="7" strokeDasharray="25 75" strokeDashoffset="70" strokeLinecap="round" />
                    </svg>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.9 }}>
                      <div><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#4ade9f", marginRight: 6 }} />{dataLabel("Їжа", lang)}</div>
                      <div><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#3bb4f5", marginRight: 6 }} />{dataLabel("Кафе", lang)}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className={styles.onbTitle}>{titles[idx]}</div>
          <div className={styles.onbText}>{subs[idx]}</div>

          <div className={styles.onbDots}>
            {[0, 1, 2].map((i) => (
              <button key={i} className={`${styles.onbDot} ${idx === i ? styles.onbDotOn : ""}`} onClick={() => setIdx(i)} aria-label={`${i + 1}`} />
            ))}
          </div>
        </div>

        <div className={styles.sheetActions}>
          {idx < 2 ? (
            <>
              <button className={styles.btnGhost} onClick={close}>{t("onb.skip")}</button>
              <button className={styles.btnPrimary} onClick={() => setIdx((i) => i + 1)}>{t("onb.next")}</button>
            </>
          ) : (
            <button className={styles.btnPrimary} onClick={close}>{t("onb.start")}</button>
          )}
        </div>
      </div>
    </div>
  );
}
