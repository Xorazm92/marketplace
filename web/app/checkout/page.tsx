"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, errorText } from "@/lib/client-api";
import { formatSum, PAYMENT_METHOD_LABEL } from "@/lib/format";
import type { Address, CartResponse, Order, PaymentMethod } from "@/lib/types";
import { AddressForm, AddressLine } from "@/components/address-form";
import { RequireUser } from "@/components/require-user";
import { useSession } from "@/components/session";
import { Button, ButtonLink, Empty, ErrorNote, Field, inputStyles, Spinner } from "@/components/ui";

function Checkout() {
  const router = useRouter();
  const { reloadCart } = useSession();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [notes, setNotes] = useState("");
  const [shipping, setShipping] = useState({ flat_fee: 0, free_from: 0 });
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api<CartResponse>("/cart"), api<Address[]>("/addresses"), api<PaymentMethod[]>("/payments/methods"), api<{ flat_fee: number; free_from: number }>("/shipping")])
      .then(([c, a, m, s]) => {
        setShipping(s);
        setCart(c);
        setAddresses(a);
        setAddressId(a.find((x) => x.is_main)?.id ?? a[0]?.id ?? null);
        setAdding(a.length === 0);
        setMethods(m);
        setMethod(m[0] ?? null);
      })
      .catch((e) => setError(errorText(e)));
  }, []);

  if (!cart) return error ? <ErrorNote>{error}</ErrorNote> : <Spinner />;
  if (!cart.items.length) {
    return (
      <Empty title="Savat boʻsh">
        <ButtonLink href="/catalog">Katalogga oʻtish</ButtonLink>
      </Empty>
    );
  }

  // Server bilan bir xil qoida (OrderService.shippingFee); yakuniy summani baribir server hisoblaydi.
  const shippingFee = shipping.free_from > 0 && cart.total_amount >= shipping.free_from ? 0 : shipping.flat_fee;

  const placeOrder = async () => {
    if (!addressId || !method) return;
    setBusy(true);
    setError("");
    try {
      const order = await api<Order>("/orders", {
        body: {
          items: cart.items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
          address_id: addressId,
          payment_method: method,
          notes: notes || undefined,
        },
      });
      await reloadCart();
      if (method === "CASH") {
        router.replace(`/orders/${order.id}?new=1`);
        return;
      }
      const { payment_url } = await api<{ payment_url: string }>(`/payments/checkout/${order.id}`, { method: "POST" });
      window.location.assign(payment_url);
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">Qayerga yetkazamiz</h2>
          {addresses.map((address) => (
            <label key={address.id} className={`flex cursor-pointer gap-3 rounded-2xl border-2 bg-white p-4 ${addressId === address.id ? "border-ink" : "border-line"}`}>
              <input type="radio" name="address" checked={addressId === address.id} onChange={() => setAddressId(address.id)} className="mt-1 accent-[#2f6bff]" />
              <AddressLine address={address} />
            </label>
          ))}
          {adding ? (
            <AddressForm
              onSaved={(address) => {
                setAddresses((list) => [address, ...list]);
                setAddressId(address.id);
                setAdding(false);
              }}
              onCancel={addresses.length ? () => setAdding(false) : undefined}
            />
          ) : (
            <button className="font-semibold text-block-blue hover:underline" onClick={() => setAdding(true)}>Yangi manzil qoʻshish</button>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">Toʻlov usuli</h2>
          {methods.map((m) => (
            <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-4 font-semibold ${method === m ? "border-ink" : "border-line"}`}>
              <input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} className="accent-[#2f6bff]" />
              {PAYMENT_METHOD_LABEL[m] ?? m}
            </label>
          ))}
          {!methods.length && <ErrorNote>Hozir toʻlov usullari mavjud emas. Birozdan keyin urinib koʻring.</ErrorNote>}
        </section>

        <Field label="Izoh kuryer uchun">
          <textarea className={inputStyles} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} rows={2} />
        </Field>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border-2 border-ink bg-white p-5">
        <ul className="space-y-1 text-sm">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>{item.product.title} × {item.quantity}</span>
              <span className="shrink-0">{formatSum(Number(item.product.price) * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-line pt-3">
          <div className="flex justify-between"><span>Mahsulotlar</span><span>{formatSum(cart.total_amount)}</span></div>
          <div className="flex justify-between"><span>Yetkazish</span><span>{shippingFee ? formatSum(shippingFee) : "Bepul"}</span></div>
          <div className="flex justify-between text-lg"><span>Jami</span><span className="font-bold">{formatSum(cart.total_amount + shippingFee)}</span></div>
        </div>
        {shipping.free_from > 0 && shippingFee > 0 && (
          <p className="text-sm text-ink-soft">{formatSum(shipping.free_from)} dan boshlab yetkazish bepul.</p>
        )}
        <ErrorNote>{error}</ErrorNote>
        <Button className="w-full" onClick={placeOrder} disabled={busy || !addressId || !method}>
          {busy ? "Yuborilmoqda" : method === "CASH" ? "Buyurtma berish" : "Toʻlovga oʻtish"}
        </Button>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Rasmiylashtirish</h1>
      <RequireUser>
        <Checkout />
      </RequireUser>
    </div>
  );
}
