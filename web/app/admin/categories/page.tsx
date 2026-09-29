"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/components/admin/admin-session";
import { Table } from "@/components/admin/table";
import { Button, ErrorNote, Field, inputStyles } from "@/components/ui";
import { errorText } from "@/lib/client-api";
import type { Category } from "@/lib/types";

const slugify = (name: string) =>
  name.toLowerCase().replace(/[ʻʼ'`‘’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => adminApi<Category[]>("/category").then(setItems).catch((e) => setError(errorText(e))), []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await adminApi("/category", { body: { name: name.trim(), slug: slugify(name), description: description.trim() || undefined, sort_order: items.length } });
      setName("");
      setDescription("");
      await load();
    } catch (e) {
      setError(errorText(e));
    }
  };
  const hide = async (category: Category) => {
    if (!confirm(`"${category.name}" boʻlimini yashirasizmi? Mahsulotlar oʻchirilmaydi.`)) return;
    try {
      await adminApi(`/category/${category.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(errorText(e));
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold">Boʻlimlar</h1>
      <form onSubmit={create} className="grid gap-3 rounded-2xl border-2 border-line bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Nomi"><input className={inputStyles} value={name} onChange={(e) => setName(e.target.value)} required /></Field>
        <Field label="Tavsif"><input className={inputStyles} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
        <Button type="submit">Qoʻshish</Button>
      </form>
      <ErrorNote>{error}</ErrorNote>
      <Table head={["Nomi", "Manzil", ""]}>
        {items.map((c) => (
          <tr key={c.id}>
            <td className="px-3 py-2 font-semibold">{c.name}</td>
            <td className="px-3 py-2 text-ink-soft">/catalog?category={c.slug}</td>
            <td className="px-3 py-2 text-right"><button className="font-semibold text-block-red hover:underline" onClick={() => hide(c)}>Yashirish</button></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
