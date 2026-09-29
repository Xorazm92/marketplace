"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { api, errorText } from "@/lib/client-api";
import { formatDate, formatSum, PAYMENT_METHOD_LABEL } from "@/lib/format";
import type { Order } from "@/lib/types";
import { OrderProgress, StatusBadge } from "@/components/order-status";
import { ProductImage } from "@/components/product-card";
import { RequireUser } from "@/components/require-user";
import { Button, ErrorNote, Spinner } from "@/components/ui";

function OrderView() {
  const { id } = useParams<{ id: string }>();
  const isNew = useSearchParams().get("new") === "1";
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Toʻlov sahifasidan qaytganda holat URLʼdan emas, serverdan olinadi.
  const load = useCallback(() => api<Order>(`/orders/${id}`).then(setOrder).catch((e) => setError(errorText(e))), [id]);
  useEffect(() => {
    load();
  }, [load]);

  if (!order) return error ? <ErrorNote>{error}</ErrorNote> : <Spinner />;
  const online = order.payment_method !== "CASH";
  const canPay = online && order.status === "PENDING" && order.payment_status !== "PAID";
  const canCancel = order.status === "PENDING" && order.payment_status !== "PAID";

  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      const { payment_url } = await api<{ payment_url: string }>(`/payments/checkout/${order.id}`, { method: "POST" });
      window.location.assign(payment_url);
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  };
  const cancel = async () => {
    if (!confirm("Buyurtmani bekor qilasizmi?")) return;
    setBusy(true);
    setError("");
    try {
      setOrder(await api<Order>(`/orders/${order.id}/cancel`, { method: "POST" }));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {isNew && order.payment_method === "CASH" && (
        <p className="rounded-2xl border-2 border-block-green bg-green-50 p-4 font-semibold">Buyurtma qabul qilindi. Operator tez orada qoʻngʻiroq qiladi.</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-4xl font-extrabold">{order.order_number}</h1>
        <StatusBadge status={order.status} />
        <StatusBadge status={order.payment_status} kind="payment" />
      </div>
      <p className="text-ink-soft">{formatDate(order.createdAt)}</p>
      <OrderProgress status={order.status} />
      {order.status === "CANCELLED" && order.cancel_reason && <p className="text-ink-soft">Sabab: {order.cancel_reason}</p>}

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={item.product_id} className="flex gap-3 rounded-2xl border-2 border-line bg-white p-3">
              <ProductImage src={item.image} alt={item.title} className="h-16 w-16 shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-wrap justify-between gap-2">
                {item.slug ? <Link href={`/p/${item.slug}`} className="font-semibold hover:underline">{item.title}</Link> : <span className="font-semibold">{item.title}</span>}
                <span className="text-sm">{item.quantity} × {formatSum(item.unit_price)}</span>
              </div>
            </li>
          ))}
        </ul>
        <aside className="h-fit space-y-3 rounded-2xl border-2 border-ink bg-white p-5 text-sm">
          <div className="flex justify-between"><span>Mahsulotlar</span><span>{formatSum(order.total_amount)}</span></div>
          <div className="flex justify-between"><span>Yetkazish</span><span>{order.shipping_amount ? formatSum(order.shipping_amount) : "Bepul"}</span></div>
          <div className="flex justify-between text-lg"><span>Jami</span><span className="font-bold">{formatSum(order.final_amount)}</span></div>
          <p>Toʻlov: <span className="font-semibold">{PAYMENT_METHOD_LABEL[order.payment_method]}</span></p>
          {order.shipping && (
            <p>
              Manzil: <span className="font-semibold">{[order.shipping.region, order.shipping.district, order.shipping.address].filter(Boolean).join(", ")}</span>
              <br />Telefon: {order.shipping.phone}
            </p>
          )}
          <ErrorNote>{error}</ErrorNote>
          {canPay && <Button className="w-full" onClick={pay} disabled={busy}>Toʻlash</Button>}
          {canCancel && <Button variant="danger" className="w-full" onClick={cancel} disabled={busy}>Bekor qilish</Button>}
        </aside>
      </div>
    </div>
  );
}

export default function OrderPage() {
  return (
    <RequireUser>
      <Suspense>
        <OrderView />
      </Suspense>
    </RequireUser>
  );
}
