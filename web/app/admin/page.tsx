"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/components/admin/admin-session";
import { errorText } from "@/lib/client-api";
import { formatSum, ORDER_STATUS_LABEL } from "@/lib/format";
import { ErrorNote, Spinner } from "@/components/ui";

type Dashboard = {
  orders_by_status: Record<string, number>;
  revenue_today: number;
  paid_orders_today: number;
  revenue_total: number;
  paid_orders_total: number;
  users: number;
  active_products: number;
  low_stock: Array<{ id: number; title: string; stock_quantity: number }>;
};

export default function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    adminApi<Dashboard>("/admin/dashboard").then(setData).catch((e) => setError(errorText(e)));
  }, []);
  if (!data) return error ? <ErrorNote>{error}</ErrorNote> : <Spinner />;

  const waiting = (data.orders_by_status.PENDING ?? 0) + (data.orders_by_status.CONFIRMED ?? 0);
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Umumiy holat</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/admin/orders?status=PENDING" className="rounded-2xl border-2 border-ink bg-block-yellow p-5">
          <p className="font-display text-5xl font-extrabold">{waiting}</p>
          <p className="font-semibold">buyurtma ishlov kutmoqda</p>
        </Link>
        <div className="rounded-2xl border-2 border-line bg-white p-5">
          <p className="text-2xl font-bold">{formatSum(data.revenue_today)}</p>
          <p className="text-ink-soft">bugun tushgan ({data.paid_orders_today} ta)</p>
        </div>
        <div className="rounded-2xl border-2 border-line bg-white p-5">
          <p className="text-2xl font-bold">{formatSum(data.revenue_total)}</p>
          <p className="text-ink-soft">jami tushgan ({data.paid_orders_total} ta)</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border-2 border-line bg-white p-5">
          <h2 className="mb-3 text-xl font-bold">Buyurtmalar holati</h2>
          <ul className="space-y-1">
            {Object.entries(ORDER_STATUS_LABEL).map(([status, label]) => (
              <li key={status} className="flex justify-between">
                <Link href={`/admin/orders?status=${status}`} className="hover:underline">{label}</Link>
                <span className="font-semibold">{data.orders_by_status[status] ?? 0}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-soft">{data.users} xaridor, {data.active_products} faol mahsulot</p>
        </section>
        <section className="rounded-2xl border-2 border-line bg-white p-5">
          <h2 className="mb-3 text-xl font-bold">Tugayotgan mahsulotlar</h2>
          {data.low_stock.length ? (
            <ul className="space-y-1">
              {data.low_stock.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <Link href={`/admin/products/${p.id}`} className="hover:underline">{p.title}</Link>
                  <span className={`font-semibold ${p.stock_quantity === 0 ? "text-block-red" : ""}`}>{p.stock_quantity} dona</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-soft">Hamma mahsulot yetarli.</p>
          )}
        </section>
      </div>
    </div>
  );
}
