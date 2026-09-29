"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api, errorText } from "@/lib/client-api";
import type { User } from "@/lib/types";
import { useSession } from "@/components/session";
import { Button, ErrorNote, Field, inputStyles } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const { signIn } = useSession();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Faqat ichki manzilga qaytaramiz: `next=https://...` bilan tashqi saytga yoʻnaltirib boʻlmasin.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/auth/otp/send", { body: { phone_number: phone } });
      setStep("code");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api<{ user: User; access_token: string; refresh_token: string; is_new: boolean }>("/auth/otp/verify", {
        body: { phone_number: phone, code, first_name: firstName || undefined },
      });
      signIn(res, res.user);
      router.replace(target);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-6">
      <h1 className="text-4xl font-extrabold">Kirish</h1>
      {step === "phone" ? (
        <form onSubmit={sendCode} className="space-y-4">
          <Field label="Telefon raqam" hint="Raqamingizga 6 xonali kod yuboramiz">
            <input className={inputStyles} value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" required />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <Button type="submit" disabled={busy} className="w-full">{busy ? "Yuborilmoqda" : "Kod olish"}</Button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <p className="text-ink-soft">
            Kod {phone} raqamiga yuborildi.{" "}
            <button type="button" className="font-semibold text-block-blue hover:underline" onClick={() => setStep("phone")}>Raqamni oʻzgartirish</button>
          </p>
          <Field label="SMS kod">
            <input className={`${inputStyles} text-2xl tracking-[0.4em]`} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" required autoFocus />
          </Field>
          <Field label="Ismingiz" hint="Birinchi marta kirayotgan boʻlsangiz">
            <input className={inputStyles} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <Button type="submit" disabled={busy || code.length !== 6} className="w-full">{busy ? "Tekshirilmoqda" : "Kirish"}</Button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
