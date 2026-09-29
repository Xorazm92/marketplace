"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, useAdmin, type Admin } from "@/components/admin/admin-session";
import { Table } from "@/components/admin/table";
import { Button, ErrorNote, Field, inputStyles } from "@/components/ui";
import { errorText } from "@/lib/client-api";

type Row = Admin & { is_active: boolean };
const blank = { phone_number: "", password: "", first_name: "", last_name: "", role: "ADMIN" };

export default function AdminAccountsPage() {
  const { admin } = useAdmin();
  const [items, setItems] = useState<Row[]>([]);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");

  const load = useCallback(() => adminApi<Row[]>("/admin/admins").then(setItems).catch((e) => setError(errorText(e))), []);
  useEffect(() => {
    load();
  }, [load]);

  if (admin?.role !== "SUPER_ADMIN") return <ErrorNote>Bu boʻlim faqat bosh admin uchun.</ErrorNote>;

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await adminApi("/admin/admins", { body: form });
      setForm(blank);
      await load();
    } catch (e) {
      setError(errorText(e));
    }
  };
  const toggle = async (row: Row) => {
    try {
      await adminApi(`/admin/admins/${row.id}/active`, { method: "PATCH", body: { is_active: !row.is_active } });
      await load();
    } catch (e) {
      setError(errorText(e));
    }
  };
  const set = (key: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold">Adminlar</h1>
      <form onSubmit={create} className="grid gap-3 rounded-2xl border-2 border-line bg-white p-4 sm:grid-cols-2">
        <Field label="Telefon"><input className={inputStyles} value={form.phone_number} onChange={set("phone_number")} required /></Field>
        <Field label="Parol" hint="Kamida 12 belgi"><input className={inputStyles} type="password" value={form.password} onChange={set("password")} minLength={12} required autoComplete="new-password" /></Field>
        <Field label="Ism"><input className={inputStyles} value={form.first_name} onChange={set("first_name")} required /></Field>
        <Field label="Familiya"><input className={inputStyles} value={form.last_name} onChange={set("last_name")} required /></Field>
        <Field label="Rol">
          <select className={inputStyles} value={form.role} onChange={set("role")}>
            <option value="ADMIN">Admin</option>
            <option value="MODERATOR">Moderator</option>
          </select>
        </Field>
        <div className="flex items-end"><Button type="submit">Admin qoʻshish</Button></div>
      </form>
      <ErrorNote>{error}</ErrorNote>
      <Table head={["Telefon", "Ism", "Rol", ""]}>
        {items.map((row) => (
          <tr key={row.id} className={row.is_active ? "" : "text-ink-soft"}>
            <td className="px-3 py-2">{row.phone_number}</td>
            <td className="px-3 py-2">{row.first_name} {row.last_name}</td>
            <td className="px-3 py-2">{row.role}</td>
            <td className="px-3 py-2 text-right">
              {row.id !== admin.id && (
                <button className={`font-semibold hover:underline ${row.is_active ? "text-block-red" : "text-block-blue"}`} onClick={() => toggle(row)}>
                  {row.is_active ? "Oʻchirish" : "Faollashtirish"}
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
