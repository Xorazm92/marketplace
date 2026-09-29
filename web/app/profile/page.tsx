"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, errorText } from "@/lib/client-api";
import type { Address, User } from "@/lib/types";
import { AddressForm, AddressLine } from "@/components/address-form";
import { RequireUser } from "@/components/require-user";
import { useSession } from "@/components/session";
import { Button, ErrorNote, Field, inputStyles } from "@/components/ui";

function Profile() {
  const router = useRouter();
  const { user, setUser, signOut } = useSession();
  const [form, setForm] = useState({ first_name: user?.first_name ?? "", last_name: user?.last_name ?? "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Address[]>("/addresses").then(setAddresses).catch((e) => setError(errorText(e)));
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      setUser(await api<User>("/auth/me", { method: "PATCH", body: form }));
      setSaved(true);
    } catch (e) {
      setError(errorText(e));
    }
  };
  const removeAddress = async (id: number) => {
    setError("");
    try {
      await api(`/addresses/${id}`, { method: "DELETE" });
      setAddresses((list) => list.filter((a) => a.id !== id));
    } catch (e) {
      setError(errorText(e));
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Maʼlumotlar</h2>
        <p className="text-ink-soft">{user?.phone_number}</p>
        <form onSubmit={save} className="space-y-3">
          <Field label="Ism">
            <input className={inputStyles} value={form.first_name} onChange={(e) => { setForm({ ...form, first_name: e.target.value }); setSaved(false); }} required maxLength={60} />
          </Field>
          <Field label="Familiya">
            <input className={inputStyles} value={form.last_name} onChange={(e) => { setForm({ ...form, last_name: e.target.value }); setSaved(false); }} maxLength={60} />
          </Field>
          <div className="flex items-center gap-3">
            <Button type="submit">Saqlash</Button>
            {saved && <span className="text-sm font-semibold text-block-green">Saqlandi</span>}
          </div>
        </form>
        <div className="flex gap-3 pt-4">
          <Link href="/orders" className="font-semibold text-block-blue hover:underline">Buyurtmalarim</Link>
          <button className="font-semibold text-block-red hover:underline" onClick={async () => { await signOut(); router.replace("/"); }}>Chiqish</button>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-bold">Manzillar</h2>
        {addresses.map((address) => (
          <div key={address.id} className="flex items-start justify-between gap-3 rounded-2xl border-2 border-line bg-white p-4">
            <AddressLine address={address} />
            <button className="text-sm font-semibold text-block-red hover:underline" onClick={() => removeAddress(address.id)}>Oʻchirish</button>
          </div>
        ))}
        {adding ? (
          <AddressForm onSaved={(a) => { setAddresses((list) => [a, ...list]); setAdding(false); }} onCancel={() => setAdding(false)} />
        ) : (
          <button className="font-semibold text-block-blue hover:underline" onClick={() => setAdding(true)}>Manzil qoʻshish</button>
        )}
        <ErrorNote>{error}</ErrorNote>
      </section>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold">Profil</h1>
      <RequireUser>
        <Profile />
      </RequireUser>
    </div>
  );
}
