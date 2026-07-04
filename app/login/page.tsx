"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./login.module.css";
import { translate, type Lang, type StringKey, DEFAULT_LANG } from "@/lib/i18n";

export default function LoginPage() {
  // мова з браузера (на екрані логіну ще немає профілю)
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);
  useEffect(() => {
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("uk")) setLang("uk");
    else if (nav.startsWith("ru")) setLang("ru");
    else setLang("en");
  }, []);
  const t = (k: StringKey) => translate(k, lang);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setError("");
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      setError(error.message);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setError(t("login.googleErr"));
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="Snapcost" className={styles.logo} />
        <h1 className={styles.title}>Snapcost</h1>
        <p className={styles.sub}>{t("login.tagline")}</p>

        <button onClick={handleGoogle} className={styles.google}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.3 0-11.5-5.1-11.5-11.5S17.7 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.1 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.1 29.1 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 43.5c5.2 0 9.6-1.7 12.9-4.6l-6.2-5.1c-1.9 1.4-4.3 2.2-6.7 2.2-5.3 0-9.7-3.4-11.3-8l-6.5 5c3.3 5.9 9.9 10.5 17.8 10.5z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.2 5.1c-.4.4 6.8-4.9 6.8-14.4 0-1.2-.1-2.4-.4-3.5z" />
          </svg>
          {t("login.google")}
        </button>

        <div className={styles.divider}>
          <span />{t("login.orEmail")}<span />
        </div>

        {sent ? (
          <div className={styles.sentBox}>
            {t("login.sentPre")} <b>{email}</b>. {t("login.sentPost")}
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <input
              className={styles.input}
              type="email"
              required
              placeholder={t("login.emailPh")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? t("login.sending") : t("login.sendLink")}
            </button>
          </form>
        )}
        {error && <p className={styles.err}>{error}</p>}

        <p style={{ marginTop: 18, textAlign: "center" }}>
          <a href="/privacy" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textDecoration: "underline" }}>
            {t("legal.privacy")}
          </a>
        </p>
      </div>
    </main>
  );
}
