"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminApi } from "@/components/admin/admin-session";
import { Pager, Table } from "@/components/admin/table";
import { ButtonLink, ErrorNote, inputStyles, Spinner } from "@/components/ui";
import { errorText } from "@/lib/client-api";
import { formatSum } from "@/lib/format";
import type { AdminProduct, Page } from "@/lib/types";

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page<AdminProduct> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "30", status });
    if (q) params.set("q", q);
    const timer = setTimeout(() => {
      adminApi<Page<AdminProduct>>(`/admin/products?${params}`).then(setData).catch((e) => setError(errorText(e)));
    }, 250);
    return () => clearTimeout(timer);
  }, [q, status, page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-extrabold">Mahsulotlar</h1>
        <ButtonLink href="/admin/products/new">Mahsulot qoʻshish</ButtonLink>
      </div>
      <div className="flex flex-wrap gap-2">
        <input className={`${inputStyles} max-w-xs`} placeholder="Nomi yoki SKU" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <select className={`${inputStyles} w-auto`} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">Hammasi</option>
          <option value="active">Sotuvda</option>
          <option value="inactive">Yashirilgan</option>
        </select>
      </div>
      <ErrorNote>{error}</ErrorNote>
      {!data ? <Spinner /> : (
        <>
          <Table head={["Nomi", "Narx", "Zaxira", "Holat"]}>
            {data.items.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2"><Link href={`/admin/products/${p.id}`} className="font-semibold text-block-blue hover:underline">{p.title}</Link></td>
                <td className="px-3 py-2">{formatSum(p.price)}</td>
                <td className={`px-3 py-2 ${p.stock_quantity === 0 ? "font-semibold text-block-red" : ""}`}>{p.stock_quantity ?? "—"}</td>
                <td className="px-3 py-2">{p.is_active ? "Sotuvda" : "Yashirilgan"}</td>
              </tr>
            ))}
          </Table>
          {!data.items.length && <p className="text-ink-soft">Mahsulot topilmadi.</p>}
          <Pager page={data.page} pages={data.pages} onPage={setPage} />
        </>
      )}
    </div>
  );
}
