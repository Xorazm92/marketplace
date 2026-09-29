"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorText, setTokens } from "@/lib/client-api";
import { useAdmin } from "@/components/admin/admin-session";
import { Button, ErrorNote, Field, inputStyles } from "@/components/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const { reload } = useAdmin();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await api<{ access_token: string; refresh_token: string }>("/admin/auth/login", { body: { phone_number: phone, password }, kind: "admin" });
      setTokens("admin", res);
      await reload();
      router.replace("/admin");
    } catch (e) {
      setError(errorText(e));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4 pt-10">
      <h1 className="text-4xl font-extrabold">Admin kirishi</h1>
      <Field label="Telefon raqam">
        <input className={inputStyles} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="username" required />
      </Field>
      <Field label="Parol">
        <input type="password" className={inputStyles} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </Field>
      <ErrorNote>{error}</ErrorNote>
      <Button type="submit" disabled={busy} className="w-full">{busy ? "Tekshirilmoqda" : "Kirish"}</Button>
    </form>
  );
}
