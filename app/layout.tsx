// build: 2026-06-28 v2 — reconnect git, redeploy latest (currency sheet + eye + donate + export)
import type { Metadata, Viewport } from "next";
import "./globals.css";
import SaveGlow from "@/components/SaveGlow";
import { SettingsProvider } from "@/components/SettingsProvider";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CURRENCY, isCurrency } from "@/lib/currency";
import { fetchRates } from "@/lib/rates";

export const metadata: Metadata = {
  title: "Snapcost",
  description: "Клац чек — бачиш витрати у своїй валюті",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Snapcost",
  },
};

export const viewport: Viewport = {
  themeColor: "#05090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hideCents = !!user?.user_metadata?.hide_cents;
  const categories = Array.isArray(user?.user_metadata?.categories)
    ? user!.user_metadata.categories
    : [];
  const mc = user?.user_metadata?.main_currency;
  const currency = isCurrency(mc) ? mc : DEFAULT_CURRENCY;
  const cc = user?.user_metadata?.convert_currency;
  const convertCurrency = isCurrency(cc) ? cc : currency === "USD" ? "EUR" : "USD";
  const rates = await fetchRates();

  return (
    <html lang="uk">
      <body>
        <SaveGlow />
        <SettingsProvider
          hideCents={hideCents}
          categories={categories}
          currency={currency}
          convertCurrency={convertCurrency}
          rates={rates}
        >
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
