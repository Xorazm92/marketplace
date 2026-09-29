"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/components/admin/admin-session";
import { Pager, Table } from "@/components/admin/table";
import { ErrorNote, inputStyles, Spinner } from "@/components/ui";
import { errorText } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import type { Page } from "@/lib/types";

type Row = { id: number; phone_number: string; first_name: string; last_name: string; is_active: boolean; createdAt: string; _count: { orders: number } };

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page<Row> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (q) params.set("q", q);
    const timer = setTimeout(() => adminApi<Page<Row>>(`/admin/users?${params}`).then(setData).catch((e) => setError(errorText(e))), 250);
    return () => clearTimeout(timer);
  }, [q, page]);

  const toggle = async (user: Row) => {
    if (user.is_active && !confirm(`${user.phone_number} bloklansinmi? U tizimdan chiqariladi.`)) return;
    try {
      await adminApi(`/admin/users/${user.id}/active`, { method: "PATCH", body: { is_active: !user.is_active } });
      setData((d) => d && { ...d, items: d.items.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)) });
    } catch (e) {
      setError(errorText(e));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold">Xaridorlar</h1>
      <input className={`${inputStyles} max-w-xs`} placeholder="Telefon yoki ism" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      <ErrorNote>{error}</ErrorNote>
      {!data ? <Spinner /> : (
        <>
          <Table head={["Telefon", "Ism", "Buyurtmalar", "Roʻyxatdan oʻtgan", ""]}>
            {data.items.map((u) => (
              <tr key={u.id} className={u.is_active ? "" : "text-ink-soft"}>
                <td className="px-3 py-2">{u.phone_number}</td>
                <td className="px-3 py-2">{u.first_name} {u.last_name}</td>
                <td className="px-3 py-2">{u._count.orders}</td>
                <td className="px-3 py-2">{formatDate(u.createdAt)}</td>
                <td className="px-3 py-2 text-right">
                  <button className={`font-semibold hover:underline ${u.is_active ? "text-block-red" : "text-block-blue"}`} onClick={() => toggle(u)}>
                    {u.is_active ? "Bloklash" : "Blokdan chiqarish"}
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          <Pager page={data.page} pages={data.pages} onPage={setPage} />
        </>
      )}
    </div>
  );
}
