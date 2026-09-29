"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSessionProvider, useAdmin } from "@/components/admin/admin-session";
import { Spinner } from "@/components/ui";

const NAV = [
  { href: "/admin", label: "Umumiy holat" },
  { href: "/admin/orders", label: "Buyurtmalar" },
  { href: "/admin/products", label: "Mahsulotlar" },
  { href: "/admin/categories", label: "Boʻlimlar" },
  { href: "/admin/users", label: "Xaridorlar" },
];

function Shell({ children }: { children: React.ReactNode }) {
  const { admin, ready, signOut } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/admin/login";

  useEffect(() => {
    if (ready && !admin && !onLogin) router.replace("/admin/login");
  }, [ready, admin, onLogin, router]);

  if (onLogin) return <>{children}</>;
  if (!ready || !admin) return <Spinner />;

  const nav = admin.role === "SUPER_ADMIN" ? [...NAV, { href: "/admin/admins", label: "Adminlar" }] : NAV;
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="grid gap-6 md:grid-cols-[200px_1fr]">
      <aside className="space-y-4">
        <Link href="/admin" className="font-display text-2xl font-extrabold">inbola admin</Link>
        <nav className="flex flex-wrap gap-1 md:flex-col">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={`rounded-lg px-3 py-2 font-semibold ${isActive(item.href) ? "bg-ink text-white" : "hover:bg-white"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="text-sm text-ink-soft">
          {admin.first_name} ({admin.role})
          <button className="mt-1 block font-semibold text-block-red hover:underline" onClick={async () => { await signOut(); router.replace("/admin/login"); }}>
            Chiqish
          </button>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <Shell>{children}</Shell>
    </AdminSessionProvider>
  );
}
