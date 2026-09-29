import type { Metadata } from "next";
import Link from "next/link";
import { AgePicker } from "@/components/age-picker";
import { ProductGrid } from "@/components/product-card";
import { Empty } from "@/components/ui";
import { serverApi } from "@/lib/server-api";

export const metadata: Metadata = { title: "Katalog" };

const SORTS = [
  { value: "newest", label: "Yangilari" },
  { value: "price_asc", label: "Arzonroq" },
  { value: "price_desc", label: "Qimmatroq" },
  { value: "popular", label: "Ommabop" },
];
const ALLOWED = ["q", "category", "sort", "min_price", "max_price", "age_months", "page"];

export default async function CatalogPage(props: PageProps<"/catalog">) {
  const raw = await props.searchParams;
  const params = new URLSearchParams();
  for (const key of ALLOWED) {
    const value = raw[key];
    if (typeof value === "string" && value) params.set(key, value);
  }
  params.set("limit", "24");

  const [result, categories] = await Promise.all([serverApi.products(params.toString()), serverApi.categories()]);
  const active = (key: string) => params.get(key) ?? "";
  const withParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    next.delete("limit");
    next.delete("page");
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    return qs ? `/catalog?${qs}` : "/catalog";
  };
  const pageHref = (page: number) => {
    const next = new URLSearchParams(params);
    next.delete("limit");
    next.set("page", String(page));
    return `/catalog?${next}`;
  };
  const categoryName = categories.find((c) => c.slug === active("category"))?.name;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold">{active("q") ? `"${active("q")}" boʻyicha` : categoryName ?? "Katalog"}</h1>
        <p className="mt-1 text-ink-soft">{result.total} ta mahsulot</p>
      </div>

      <AgePicker active={active("age_months") ? Number(active("age_months")) : undefined} />

      <div className="flex flex-wrap items-center gap-2">
        <Link href={withParam("category", null)} className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold ${!active("category") ? "border-ink bg-ink text-white" : "border-line bg-white"}`}>
          Hammasi
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={withParam("category", category.slug)}
            className={`rounded-full border-2 px-3 py-1.5 text-sm font-semibold ${active("category") === category.slug ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}
          >
            {category.name}
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-2xl border-2 border-line bg-white p-4" action="/catalog">
        {["q", "category", "age_months"].map((key) => active(key) && <input key={key} type="hidden" name={key} value={active(key)} />)}
        <label className="text-sm font-semibold">
          Narxdan
          <input name="min_price" type="number" min={0} defaultValue={active("min_price")} className="mt-1 block w-32 rounded-lg border-2 border-line px-2 py-1.5" />
        </label>
        <label className="text-sm font-semibold">
          Narxgacha
          <input name="max_price" type="number" min={0} defaultValue={active("max_price")} className="mt-1 block w-32 rounded-lg border-2 border-line px-2 py-1.5" />
        </label>
        <label className="text-sm font-semibold">
          Tartib
          <select name="sort" defaultValue={active("sort") || "newest"} className="mt-1 block rounded-lg border-2 border-line bg-white px-2 py-1.5">
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>{sort.label}</option>
            ))}
          </select>
        </label>
        <button className="rounded-lg border-2 border-ink px-4 py-1.5 font-semibold hover:bg-paper">Qoʻllash</button>
      </form>

      {result.items.length ? (
        <ProductGrid products={result.items} />
      ) : (
        <Empty title="Bu filtrlar boʻyicha hech narsa topilmadi">
          <Link href="/catalog" className="font-semibold text-block-blue hover:underline">Filtrlarni tozalash</Link>
        </Empty>
      )}

      {result.pages > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Sahifalar">
          {Array.from({ length: result.pages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={pageHref(page)}
              aria-current={page === result.page ? "page" : undefined}
              className={`min-w-10 rounded-lg border-2 px-3 py-1.5 text-center font-semibold ${page === result.page ? "border-ink bg-ink text-white" : "border-line bg-white"}`}
            >
              {page}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
