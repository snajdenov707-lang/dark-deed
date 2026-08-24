import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import { TelegramBoot } from "@/components/TelegramBoot";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dark Deed",
  description: "Тёмное дело — тёмный шоколад, крафт и золото",
};

export const viewport: Viewport = {
  themeColor: "#1A0F0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${playfair.variable} ${manrope.variable} ${cormorant.variable}`}
        style={{
          background: "#1A0F0A",
          color: "#F5E6D3",
          margin: 0,
          padding: 0,
          minHeight: "100dvh",
          fontFamily: "'Manrope', system-ui, sans-serif",
        }}
      >
        <QueryProvider>
          <ToastProvider>
            <TelegramBoot>{children}</TelegramBoot>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
