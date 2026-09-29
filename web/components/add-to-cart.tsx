"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorText } from "@/lib/client-api";
import { useSession } from "./session";
import { Button, ErrorNote } from "./ui";

export function AddToCart({ productId, inStock, min, max }: { productId: number; inStock: boolean; min: number; max: number | null }) {
  const { user, reloadCart } = useSession();
  const router = useRouter();
  const [quantity, setQuantity] = useState(Math.max(1, min));
  const [state, setState] = useState<"idle" | "saving" | "added">("idle");
  const [error, setError] = useState("");

  if (!inStock) return <p className="font-semibold text-ink-soft">Hozircha sotuvda yoʻq</p>;

  const add = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setState("saving");
    setError("");
    try {
      await api("/cart/add", { body: { product_id: productId, quantity } });
      await reloadCart();
      setState("added");
    } catch (e) {
      setError(errorText(e));
      setState("idle");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-xl border-2 border-line bg-white">
          <button type="button" className="px-3 py-2 text-lg" aria-label="Kamaytirish" onClick={() => setQuantity((q) => Math.max(min, q - 1))}>−</button>
          <span className="min-w-8 text-center font-semibold" aria-live="polite">{quantity}</span>
          <button type="button" className="px-3 py-2 text-lg" aria-label="Koʻpaytirish" onClick={() => setQuantity((q) => (max ? Math.min(max, q + 1) : q + 1))}>+</button>
        </div>
        <Button onClick={add} disabled={state === "saving"}>{state === "saving" ? "Qoʻshilmoqda" : "Savatga qoʻshish"}</Button>
      </div>
      {state === "added" && (
        <p className="text-sm font-semibold text-block-green">
          Savatga qoʻshildi. <a href="/cart" className="text-block-blue underline">Savatga oʻtish</a>
        </p>
      )}
      <ErrorNote>{error}</ErrorNote>
    </div>
  );
}
