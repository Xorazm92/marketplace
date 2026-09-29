"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, errorText } from "@/lib/client-api";
import { formatSum } from "@/lib/format";
import type { CartResponse } from "@/lib/types";
import { ProductImage } from "@/components/product-card";
import { RequireUser } from "@/components/require-user";
import { useSession } from "@/components/session";
import { ButtonLink, Empty, ErrorNote, Spinner } from "@/components/ui";

function Cart() {
  const { reloadCart } = useSession();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(
    () => api<CartResponse>("/cart").then(setCart).catch((e) => setError(errorText(e))),
    [],
  );
  useEffect(() => {
    load();
  }, [load]);

  const change = async (itemId: number, quantity: number) => {
    setError("");
    try {
      if (quantity < 1) await api("/cart/remove", { method: "DELETE", body: { cart_item_id: itemId } });
      else await api("/cart/update", { method: "PUT", body: { cart_item_id: itemId, quantity } });
      await Promise.all([load(), reloadCart()]);
    } catch (e) {
      setError(errorText(e));
    }
  };

  if (!cart) return error ? <ErrorNote>{error}</ErrorNote> : <Spinner />;
  if (!cart.items.length) {
    return (
      <Empty title="Savat boʻsh">
        <p className="mb-4">Katalogdan bolangizga mos narsani tanlang.</p>
        <ButtonLink href="/catalog">Katalogga oʻtish</ButtonLink>
      </Empty>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <ul className="space-y-3">
        {cart.items.map((item) => (
          <li key={item.id} className="flex gap-3 rounded-2xl border-2 border-line bg-white p-3">
            <ProductImage src={item.product.product_image[0]?.url} alt={item.product.title} className="h-20 w-20 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2">
              <Link href={`/p/${item.product.slug}`} className="font-semibold hover:underline">{item.product.title}</Link>
              {!item.product.is_active && <p className="text-sm text-block-red">Sotuvdan olingan — savatdan oʻchiring</p>}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center rounded-xl border-2 border-line">
                  <button className="px-3 py-1" aria-label="Kamaytirish" onClick={() => change(item.id, item.quantity - 1)}>−</button>
                  <span className="min-w-6 text-center font-semibold">{item.quantity}</span>
                  <button className="px-3 py-1" aria-label="Koʻpaytirish" onClick={() => change(item.id, item.quantity + 1)}>+</button>
                </div>
                <span className="font-bold">{formatSum(Number(item.product.price) * item.quantity)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit space-y-4 rounded-2xl border-2 border-ink bg-white p-5">
        <div className="flex justify-between text-lg">
          <span>Jami</span>
          <span className="font-bold">{formatSum(cart.total_amount)}</span>
        </div>
        <p className="text-sm text-ink-soft">Yetkazish narxi keyingi qadamda hisoblanadi.</p>
        <ErrorNote>{error}</ErrorNote>
        <ButtonLink href="/checkout" className="w-full">Rasmiylashtirish</ButtonLink>
      </aside>
    </div>
  );
}

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Savat</h1>
      <RequireUser>
        <Cart />
      </RequireUser>
    </div>
  );
}
