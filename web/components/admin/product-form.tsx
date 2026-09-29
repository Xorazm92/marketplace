"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminApi } from "./admin-session";
import { Button, ErrorNote, Field, inputStyles } from "@/components/ui";
import { ProductImage } from "@/components/product-card";
import { errorText } from "@/lib/client-api";
import type { AdminProduct, Category } from "@/lib/types";

type Brand = { id: number; name: string };

const empty = {
  title: "", description: "", short_description: "", price: "", original_price: "", category_id: "", brand_id: "", sku: "",
  recommended_age_min: "", recommended_age_max: "", material: "", safety_warnings: "", choking_hazard: false,
  min_order_quantity: "1", max_order_quantity: "", is_active: true, is_featured: false,
};

function toForm(p: AdminProduct): typeof empty {
  const s = (v: unknown) => (v == null ? "" : String(v));
  return {
    title: p.title, description: p.description, short_description: s(p.short_description), price: s(p.price), original_price: s(p.original_price),
    category_id: s(p.category_id), brand_id: s(p.brand_id), sku: s(p.sku), recommended_age_min: s(p.recommended_age_min), recommended_age_max: s(p.recommended_age_max),
    material: s(p.material), safety_warnings: s(p.safety_warnings), choking_hazard: p.choking_hazard, min_order_quantity: s(p.min_order_quantity),
    max_order_quantity: s(p.max_order_quantity), is_active: p.is_active, is_featured: p.is_featured,
  };
}

// Boʻsh maydon backendʼga yuborilmaydi; raqamli maydonlar raqamga aylantiriladi.
function toPayload(f: typeof empty) {
  const num = (v: string) => (v === "" ? undefined : Number(v));
  const str = (v: string) => (v.trim() === "" ? undefined : v.trim());
  return {
    title: f.title.trim(), description: f.description.trim(), short_description: str(f.short_description), price: Number(f.price),
    original_price: num(f.original_price), category_id: num(f.category_id), brand_id: num(f.brand_id), sku: str(f.sku),
    recommended_age_min: num(f.recommended_age_min), recommended_age_max: num(f.recommended_age_max), material: str(f.material),
    safety_warnings: str(f.safety_warnings), choking_hazard: f.choking_hazard, min_order_quantity: num(f.min_order_quantity),
    max_order_quantity: num(f.max_order_quantity), is_active: f.is_active, is_featured: f.is_featured,
  };
}

export function ProductForm({ product }: { product?: AdminProduct }) {
  const router = useRouter();
  const [form, setForm] = useState(product ? toForm(product) : empty);
  const [current, setCurrent] = useState(product);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stock, setStock] = useState(String(product?.stock_quantity ?? 0));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi<Category[]>("/category").then(setCategories).catch(() => undefined);
    adminApi<Brand[]>("/brand").then((b) => setBrands(Array.isArray(b) ? b : [])).catch(() => undefined);
  }, []);

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    setForm((f) => ({ ...f, [key]: target.type === "checkbox" ? target.checked : target.value }));
    setMessage("");
  };

  const run = async (action: () => Promise<void>, done: string) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(done);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    run(async () => {
      if (current) {
        setCurrent(await adminApi<AdminProduct>(`/admin/products/${current.id}`, { method: "PATCH", body: toPayload(form) }));
      } else {
        const created = await adminApi<AdminProduct>("/admin/products", { body: toPayload(form) });
        router.replace(`/admin/products/${created.id}`);
      }
    }, "Saqlandi");
  };

  const saveStock = () =>
    run(async () => {
      setCurrent(await adminApi<AdminProduct>(`/admin/products/${current!.id}/stock`, { method: "PUT", body: { stock_quantity: Number(stock) } }));
    }, "Zaxira yangilandi");

  const upload = (files: FileList | null) => {
    if (!files?.length) return;
    const data = new FormData();
    Array.from(files).forEach((file) => data.append("images", file));
    run(async () => setCurrent(await adminApi<AdminProduct>(`/admin/products/${current!.id}/images`, { form: data })), "Rasm yuklandi");
  };

  const removeImage = (imageId: number) =>
    run(async () => setCurrent(await adminApi<AdminProduct>(`/admin/products/${current!.id}/images/${imageId}`, { method: "DELETE" })), "Rasm oʻchirildi");

  const remove = () => {
    if (!confirm("Mahsulotni oʻchirasizmi? Eski buyurtmalarda u saqlanib qoladi.")) return;
    run(async () => {
      await adminApi(`/admin/products/${current!.id}`, { method: "DELETE" });
      router.replace("/admin/products");
    }, "Oʻchirildi");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <form onSubmit={save} className="space-y-4 rounded-2xl border-2 border-line bg-white p-5">
        <Field label="Nomi"><input className={inputStyles} value={form.title} onChange={set("title")} required minLength={2} maxLength={200} /></Field>
        <Field label="Qisqa tavsif" hint="Kartada va qidiruvda koʻrinadi"><input className={inputStyles} value={form.short_description} onChange={set("short_description")} maxLength={300} /></Field>
        <Field label="Toʻliq tavsif"><textarea className={inputStyles} rows={6} value={form.description} onChange={set("description")} required /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Narx, soʻm"><input className={inputStyles} type="number" min={1} step="0.01" value={form.price} onChange={set("price")} required /></Field>
          <Field label="Eski narx" hint="Chegirma koʻrsatish uchun"><input className={inputStyles} type="number" min={1} step="0.01" value={form.original_price} onChange={set("original_price")} /></Field>
          <Field label="Boʻlim">
            <select className={inputStyles} value={form.category_id} onChange={set("category_id")}>
              <option value="">Tanlanmagan</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Brend">
            <select className={inputStyles} value={form.brand_id} onChange={set("brand_id")}>
              <option value="">Tanlanmagan</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Yoshdan, oy" hint="Masalan 36 = 3 yosh"><input className={inputStyles} type="number" min={0} value={form.recommended_age_min} onChange={set("recommended_age_min")} /></Field>
          <Field label="Yoshgacha, oy"><input className={inputStyles} type="number" min={0} value={form.recommended_age_max} onChange={set("recommended_age_max")} /></Field>
          <Field label="Material"><input className={inputStyles} value={form.material} onChange={set("material")} maxLength={100} /></Field>
          <Field label="SKU"><input className={inputStyles} value={form.sku} onChange={set("sku")} maxLength={60} /></Field>
          <Field label="Kamida, dona"><input className={inputStyles} type="number" min={1} value={form.min_order_quantity} onChange={set("min_order_quantity")} /></Field>
          <Field label="Koʻpi bilan, dona"><input className={inputStyles} type="number" min={1} value={form.max_order_quantity} onChange={set("max_order_quantity")} /></Field>
        </div>
        <Field label="Xavfsizlik ogohlantirishi"><textarea className={inputStyles} rows={2} value={form.safety_warnings} onChange={set("safety_warnings")} maxLength={1000} /></Field>
        <div className="flex flex-wrap gap-5 text-sm font-semibold">
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.choking_hazard} onChange={set("choking_hazard")} /> Mayda qismlar bor</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={set("is_active")} /> Sotuvda</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_featured} onChange={set("is_featured")} /> Tavsiya etiladi</label>
        </div>
        <ErrorNote>{error}</ErrorNote>
        {message && <p className="text-sm font-semibold text-block-green">{message}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>{current ? "Saqlash" : "Yaratish"}</Button>
          {current && <Button type="button" variant="danger" onClick={remove} disabled={busy}>Oʻchirish</Button>}
        </div>
      </form>

      {current ? (
        <aside className="space-y-4">
          <section className="space-y-2 rounded-2xl border-2 border-line bg-white p-4">
            <h2 className="font-sans text-base font-bold">Omborda</h2>
            <div className="flex gap-2">
              <input className={inputStyles} type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} aria-label="Zaxira soni" />
              <Button type="button" variant="secondary" onClick={saveStock} disabled={busy}>Yangilash</Button>
            </div>
          </section>
          <section className="space-y-2 rounded-2xl border-2 border-line bg-white p-4">
            <h2 className="font-sans text-base font-bold">Rasmlar</h2>
            <div className="grid grid-cols-3 gap-2">
              {current.images.map((image) => (
                <div key={image.id} className="relative">
                  <ProductImage src={image.url} alt="" className="aspect-square w-full rounded-lg border border-line" />
                  <button type="button" className="absolute right-1 top-1 rounded bg-white px-1 text-xs text-block-red" onClick={() => removeImage(image.id)} aria-label="Rasmni oʻchirish">×</button>
                </div>
              ))}
            </div>
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-line p-3 text-center text-sm font-semibold hover:border-ink">
              Rasm yuklash (JPG, PNG, WEBP, 5 MB gacha)
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
            </label>
          </section>
        </aside>
      ) : (
        <p className="text-sm text-ink-soft">Rasm va zaxira mahsulot yaratilgandan keyin qoʻshiladi.</p>
      )}
    </div>
  );
}
