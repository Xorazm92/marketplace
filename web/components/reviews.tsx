"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorText } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import type { Review, ReviewStats } from "@/lib/types";
import { useSession } from "./session";
import { Button, ErrorNote, Field, inputStyles } from "./ui";

function Stars({ value, label }: { value: number; label?: string }) {
  return (
    <span aria-label={label ?? `${value} yulduz`} className="whitespace-nowrap text-block-yellow [text-shadow:0_0_1px_#1d2440]">
      {"★".repeat(Math.round(value))}
      <span className="text-line">{"★".repeat(5 - Math.round(value))}</span>
    </span>
  );
}

export function Reviews({ productId, initial, stats }: { productId: number; initial: Review[]; stats: ReviewStats }) {
  const { user } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/reviews", { body: { product_id: productId, rating, comment: comment.trim() || undefined } });
      setOpen(false);
      setComment("");
      router.refresh();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-4 border-t border-line pt-8" aria-labelledby="reviews-title">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="reviews-title" className="text-3xl font-bold">Sharhlar</h2>
        {stats.count > 0 && (
          <p className="text-lg">
            <Stars value={stats.average ?? 0} label={`Oʻrtacha ${stats.average} yulduz`} /> <span className="font-semibold">{stats.average}</span>
            <span className="text-ink-soft"> ({stats.count} ta)</span>
          </p>
        )}
      </div>

      {user && !open && (
        <Button variant="secondary" onClick={() => setOpen(true)}>Sharh yozish</Button>
      )}
      {open && (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border-2 border-line bg-white p-4">
          <fieldset>
            <legend className="mb-1 text-sm font-semibold">Baho</legend>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-pressed={n <= rating} aria-label={`${n} yulduz`} onClick={() => setRating(n)} className={`text-3xl ${n <= rating ? "text-block-yellow" : "text-line"}`}>
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          <Field label="Fikringiz">
            <textarea className={inputStyles} rows={3} maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>{busy ? "Yuborilmoqda" : "Sharhni yuborish"}</Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Bekor qilish</Button>
          </div>
        </form>
      )}

      {initial.length ? (
        <ul className="space-y-3">
          {initial.map((review) => (
            <li key={review.id} className="rounded-2xl border-2 border-line bg-white p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Stars value={review.rating} />
                <span className="font-semibold">{review.user.first_name || "Xaridor"}</span>
                {review.is_verified && <span className="text-block-green">Xarid qilgan</span>}
                <span className="text-ink-soft">{formatDate(review.createdAt)}</span>
              </div>
              {review.title && <p className="mt-1 font-semibold">{review.title}</p>}
              {review.comment && <p className="mt-1 max-w-prose whitespace-pre-line">{review.comment}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-soft">Hali sharh yoʻq. Mahsulotni olgan xaridorlar sharh qoldira oladi.</p>
      )}
    </section>
  );
}
