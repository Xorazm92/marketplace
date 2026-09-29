"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/components/admin/admin-session";
import { Table } from "@/components/admin/table";
import { OrderProgress, StatusBadge } from "@/components/order-status";
import { Button, ErrorNote, inputStyles, Spinner } from "@/components/ui";
import { errorText } from "@/lib/client-api";
import { formatDate, formatSum, ORDER_STATUS_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/format";
import type { AdminOrder } from "@/lib/types";

// Backendʼdagi TRANSITIONS bilan bir xil; qoidani baribir server tekshiradi.
const NEXT: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

export default function AdminOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => adminApi<AdminOrder>(`/admin/orders/${id}`).then(setOrder).catch((e) => setError(errorText(e))), [id]);
  useEffect(() => {
    load();
  }, [load]);
  if (!order) return error ? <ErrorNote>{error}</ErrorNote> : <Spinner />;

  const move = async (status: string) => {
    if (status === "CANCELLED" && !confirm("Buyurtmani bekor qilasizmi? Zaxira qaytariladi.")) return;
    setBusy(true);
    setError("");
    try {
      setOrder(await adminApi<AdminOrder>(`/admin/orders/${order.id}/status`, { method: "PATCH", body: { status, note: note || undefined } }));
      setNote("");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const online = order.payment_method !== "CASH";
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold">{order.order_number}</h1>
        <StatusBadge status={order.status} />
        <StatusBadge status={order.payment_status} kind="payment" />
      </div>
      <OrderProgress status={order.status} />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="space-y-1 rounded-2xl border-2 border-line bg-white p-4 text-sm">
          <h2 className="font-sans text-base font-bold">Xaridor</h2>
          <p>{[order.user.first_name, order.user.last_name].filter(Boolean).join(" ")}{order.user.first_name || order.user.last_name ? ", " : ""}{order.user.phone_number}</p>
          {order.shipping && (
            <p>
              {[order.shipping.region, order.shipping.district, order.shipping.address].filter(Boolean).join(", ")}
              <br />Qabul qiluvchi: {order.shipping.phone}
            </p>
          )}
          {order.notes && <p>Izoh: {order.notes}</p>}
          <p>Toʻlov: {PAYMENT_METHOD_LABEL[order.payment_method]}</p>
        </section>
        <section className="space-y-3 rounded-2xl border-2 border-ink bg-white p-4">
          <h2 className="font-sans text-base font-bold">Holatni oʻzgartirish</h2>
          {online && order.payment_status !== "PAID" && order.status === "PENDING" && (
            <p className="text-sm text-ink-soft">Onlayn toʻlov tushgach buyurtma oʻzi tasdiqlanadi.</p>
          )}
          {online && order.payment_status === "PAID" && (
            <p className="text-sm text-ink-soft">Toʻlangan buyurtmani bekor qilish uchun pulni {PAYMENT_METHOD_LABEL[order.payment_method]} kabinetidan qaytaring.</p>
          )}
          <input className={inputStyles} placeholder="Izoh (ixtiyoriy)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
          <div className="flex flex-wrap gap-2">
            {(NEXT[order.status] ?? []).map((status) => (
              <Button key={status} variant={status === "CANCELLED" ? "danger" : "primary"} disabled={busy} onClick={() => move(status)}>
                {ORDER_STATUS_LABEL[status]}
              </Button>
            ))}
            {!NEXT[order.status] && <p className="text-sm text-ink-soft">Bu buyurtma yakunlangan.</p>}
          </div>
          <ErrorNote>{error}</ErrorNote>
        </section>
      </div>

      <Table head={["Mahsulot", "Soni", "Narx", "Jami"]}>
        {order.items.map((item) => (
          <tr key={item.product_id}>
            <td className="px-3 py-2">{item.title}</td>
            <td className="px-3 py-2">{item.quantity}</td>
            <td className="px-3 py-2">{formatSum(item.unit_price)}</td>
            <td className="px-3 py-2">{formatSum(item.total_price)}</td>
          </tr>
        ))}
        <tr>
          <td className="px-3 py-2" colSpan={3}>Yetkazish</td>
          <td className="px-3 py-2">{formatSum(order.shipping_amount)}</td>
        </tr>
        <tr className="font-bold">
          <td className="px-3 py-2" colSpan={3}>Jami</td>
          <td className="px-3 py-2">{formatSum(order.final_amount)}</td>
        </tr>
      </Table>

      {!!order.payments?.length && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold">Toʻlovlar</h2>
          <Table head={["Usul", "Tranzaksiya", "Summa", "Holat", "Sana"]}>
            {order.payments.map((p) => (
              <tr key={p.id}>
                <td className="px-3 py-2">{p.payment_method}</td>
                <td className="px-3 py-2 break-all">{p.transaction_id ?? "—"}</td>
                <td className="px-3 py-2">{formatSum(p.amount)}</td>
                <td className="px-3 py-2"><StatusBadge status={p.status} kind="payment" /></td>
                <td className="px-3 py-2">{formatDate(p.createdAt)}</td>
              </tr>
            ))}
          </Table>
        </section>
      )}

      {!!order.tracking?.length && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold">Tarix</h2>
          <ol className="space-y-1 text-sm">
            {order.tracking.map((t) => (
              <li key={t.id}>{formatDate(t.createdAt)}: <span className="font-semibold">{ORDER_STATUS_LABEL[t.status] ?? t.status}</span>{t.description ? `, ${t.description}` : ""}</li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
