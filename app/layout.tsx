import type { Metadata, Viewport } from "next";
import "./globals.css";
import SaveGlow from "@/components/SaveGlow";
import { SettingsProvider } from "@/components/SettingsProvider";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <html lang="uk">
      <body>
        <SaveGlow />
        <SettingsProvider hideCents={hideCents} categories={categories}>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
