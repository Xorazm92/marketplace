"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { adminApi } from "@/components/admin/admin-session";
import { Pager, Table } from "@/components/admin/table";
import { StatusBadge } from "@/components/order-status";
import { ErrorNote, inputStyles, Spinner } from "@/components/ui";
import { errorText } from "@/lib/client-api";
import { formatDate, formatSum, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/format";
import type { AdminOrder, Page } from "@/lib/types";

function Orders() {
  const initial = useSearchParams().get("status") ?? "";
  const [status, setStatus] = useState(initial);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page<AdminOrder> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    const timer = setTimeout(() => adminApi<Page<AdminOrder>>(`/admin/orders?${params}`).then(setData).catch((e) => setError(errorText(e))), 250);
    return () => clearTimeout(timer);
  }, [status, q, page]);

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold">Buyurtmalar</h1>
      <div className="flex flex-wrap gap-2">
        <input className={`${inputStyles} max-w-xs`} placeholder="Raqam yoki telefon" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <select className={`${inputStyles} w-auto`} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Barcha holatlar</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <ErrorNote>{error}</ErrorNote>
      {!data ? <Spinner /> : (
        <>
          <Table head={["Raqam", "Xaridor", "Sana", "Summa", "Toʻlov", "Holat"]}>
            {data.items.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-2"><Link href={`/admin/orders/${o.id}`} className="font-semibold text-block-blue hover:underline">{o.order_number}</Link></td>
                <td className="px-3 py-2">{o.user.first_name} {o.user.phone_number}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(o.createdAt)}</td>
                <td className="px-3 py-2 whitespace-nowrap">{formatSum(o.final_amount)}</td>
                <td className="px-3 py-2">{PAYMENT_METHOD_LABEL[o.payment_method]} <StatusBadge status={o.payment_status} kind="payment" /></td>
                <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </Table>
          {!data.items.length && <p className="text-ink-soft">Buyurtma topilmadi.</p>}
          <Pager page={data.page} pages={data.pages} onPage={setPage} />
        </>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <Orders />
    </Suspense>
  );
}
