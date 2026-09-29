import type { Metadata } from "next";
import { Baloo_2, Onest } from "next/font/google";
import { SessionProvider } from "@/components/session";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const baloo = Baloo_2({ variable: "--font-baloo", subsets: ["latin", "latin-ext"], weight: ["600", "700", "800"] });
const onest = Onest({ variable: "--font-onest", subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: { default: "INBOLA — bolalar uchun oʻyinchoq va buyumlar", template: "%s · INBOLA" },
  description: "Bola yoshiga mos oʻyinchoqlar, kitoblar va kiyimlar. Payme, Click yoki yetkazganda naqd toʻlov.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uz" className={`${baloo.variable} ${onest.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SessionProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6">{children}</main>
          <footer className="border-t border-line bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-ink-soft sm:flex-row sm:justify-between sm:px-6">
              <p>INBOLA — bolalar uchun doʻkon. Toshkent.</p>
              <p>Savollar: +998 71 000 00 00</p>
            </div>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
