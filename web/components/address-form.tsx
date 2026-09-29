"use client";

import { useEffect, useState } from "react";
import { api, errorText } from "@/lib/client-api";
import type { Address } from "@/lib/types";
import { Button, ErrorNote, Field, inputStyles } from "./ui";

type Region = { id: number; name: string };
type District = { id: number; name: string; region_id: number };

export function AddressForm({ onSaved, onCancel }: { onSaved: (address: Address) => void; onCancel?: () => void }) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [form, setForm] = useState({ name: "Uy", region_id: "", district_id: "", address: "", phone_number: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Region[]>("/region").then(setRegions).catch(() => setError("Viloyatlar roʻyxati yuklanmadi"));
    api<District[]>("/district").then(setDistricts).catch(() => undefined);
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value, ...(key === "region_id" ? { district_id: "" } : {}) }));
  const regionDistricts = districts.filter((d) => String(d.region_id) === form.region_id);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const address = await api<Address>("/addresses", {
        body: {
          name: form.name,
          region_id: Number(form.region_id),
          district_id: form.district_id ? Number(form.district_id) : undefined,
          address: form.address,
          phone_number: form.phone_number || undefined,
        },
      });
      onSaved(address);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border-2 border-line bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nomi">
          <input className={inputStyles} value={form.name} onChange={set("name")} required maxLength={60} />
        </Field>
        <Field label="Qabul qiluvchi telefoni" hint="Boʻsh qolsa — sizning raqamingiz">
          <input className={inputStyles} value={form.phone_number} onChange={set("phone_number")} inputMode="tel" />
        </Field>
        <Field label="Viloyat">
          <select className={inputStyles} value={form.region_id} onChange={set("region_id")} required>
            <option value="">Tanlang</option>
            {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>
        {regionDistricts.length > 0 && (
          <Field label="Tuman">
            <select className={inputStyles} value={form.district_id} onChange={set("district_id")}>
              <option value="">Tanlang</option>
              {regionDistricts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
        )}
      </div>
      <Field label="Manzil" hint="Koʻcha, uy, xonadon, moʻljal">
        <input className={inputStyles} value={form.address} onChange={set("address")} required minLength={3} maxLength={300} />
      </Field>
      <ErrorNote>{error}</ErrorNote>
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>{busy ? "Saqlanmoqda" : "Manzilni saqlash"}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Bekor qilish</Button>}
      </div>
    </form>
  );
}

export function AddressLine({ address }: { address: Address }) {
  return (
    <span>
      <span className="font-semibold">{address.name}</span>
      <span className="block text-sm text-ink-soft">
        {[address.region?.name, address.district?.name, address.address].filter(Boolean).join(", ")}
      </span>
    </span>
  );
}
