"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, errorText } from "@/lib/client-api";
import { formatDate, formatSum } from "@/lib/format";
import type { Order, Page } from "@/lib/types";
import { StatusBadge } from "@/components/order-status";
import { RequireUser } from "@/components/require-user";
import { ButtonLink, Empty, ErrorNote, Spinner } from "@/components/ui";

function Orders() {
  const [data, setData] = useState<Page<Order> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api<Page<Order>>("/orders?limit=50").then(setData).catch((e) => setError(errorText(e)));
  }, []);

  if (!data) return error ? <ErrorNote>{error}</ErrorNote> : <Spinner />;
  if (!data.items.length) {
    return (
      <Empty title="Hali buyurtma yoʻq">
        <ButtonLink href="/catalog">Katalogga oʻtish</ButtonLink>
      </Empty>
    );
  }
  return (
    <ul className="space-y-3">
      {data.items.map((order) => (
        <li key={order.id}>
          <Link href={`/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-line bg-white p-4 hover:border-ink">
            <div>
              <p className="font-semibold">{order.order_number}</p>
              <p className="text-sm text-ink-soft">{formatDate(order.createdAt)}, {order.items.length} ta mahsulot</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={order.status} />
              <span className="font-bold">{formatSum(order.final_amount)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Buyurtmalarim</h1>
      <RequireUser>
        <Orders />
      </RequireUser>
    </div>
  );
}
