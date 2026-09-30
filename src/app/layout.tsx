import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Noto_Sans_Tamil } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Print Management";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "Printing Company Management System — Track orders, production, clients, expenses, attendance and salary.",
  applicationName: APP_NAME,
  keywords: ["printing", "management", "production", "orders", "attendance", "salary"],
  robots: {
    index: false, // Private business app — no public indexing
    follow: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevent zoom on form inputs (mobile UX)
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoSansTamil.variable}`}
    >
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
