"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "./session";

export function SiteHeader() {
  const { user, cartCount, ready } = useSession();
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <Link href="/" className="font-display text-3xl font-extrabold leading-none text-ink" aria-label="INBOLA bosh sahifa">
          inbola
        </Link>
        <form action="/catalog" className="hidden flex-1 sm:block" role="search">
          <input
            name="q"
            type="search"
            placeholder="Oʻyinchoq, kitob yoki brend"
            aria-label="Qidirish"
            className="w-full rounded-xl border-2 border-line bg-paper px-4 py-2 outline-none focus:border-block-blue"
          />
        </form>
        <nav className="ml-auto flex items-center gap-1 text-sm font-semibold sm:gap-3">
          <Link href="/catalog" className="rounded-lg px-2 py-2 hover:bg-paper">Katalog</Link>
          <Link href="/cart" className="relative rounded-lg px-2 py-2 hover:bg-paper">
            Savat
            {cartCount > 0 && (
              <span className="ml-1 rounded-full bg-block-yellow px-2 py-0.5 text-xs text-ink" aria-label={`${cartCount} ta mahsulot`}>
                {cartCount}
              </span>
            )}
          </Link>
          {ready && (user ? (
            <Link href="/profile" className="rounded-lg px-2 py-2 hover:bg-paper">{user.first_name || "Profil"}</Link>
          ) : (
            <Link href="/login" className="rounded-lg border-2 border-ink px-3 py-1.5 hover:bg-paper">Kirish</Link>
          ))}
        </nav>
      </div>
      <form action="/catalog" className="px-4 pb-3 sm:hidden" role="search">
        <input name="q" type="search" placeholder="Qidirish" aria-label="Qidirish" className="w-full rounded-xl border-2 border-line bg-paper px-4 py-2 outline-none focus:border-block-blue" />
      </form>
    </header>
  );
}
