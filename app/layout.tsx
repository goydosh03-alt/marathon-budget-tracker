import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snapcost",
  description: "Клац чек — бачиш витрати у своїй валюті",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
