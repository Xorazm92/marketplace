// Build paytida backend bo'lmasligi mumkin (CI, Docker): sahifa so'rovda chiziladi,
// katalog ma'lumoti esa fetch darajasida 60 s keshlanadi (lib/server-api.ts).
export const dynamic = "force-dynamic";

import Link from "next/link";
import { AgePicker } from "@/components/age-picker";
import { ProductGrid } from "@/components/product-card";
import { serverApi } from "@/lib/server-api";

export default async function HomePage() {
  const [latest, categories] = await Promise.all([serverApi.products("limit=8&sort=newest"), serverApi.categories()]);

  return (
    <div className="space-y-14">
      <section className="grid gap-8 pt-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <h1 className="text-5xl font-extrabold sm:text-6xl">Bolangiz necha yoshda?</h1>
          <p className="mt-4 max-w-md text-lg text-ink-soft">
            Yoshini tanlang — shu yoshga mos oʻyinchoq, kitob va buyumlarni koʻrsatamiz.
          </p>
        </div>
        <AgePicker />
      </section>

      {categories.length > 0 && (
        <section>
          <h2 className="mb-4 text-3xl font-bold">Boʻlimlar</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog?category=${category.slug}`}
                className="rounded-full border-2 border-line bg-white px-4 py-2 font-semibold hover:border-ink"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-3xl font-bold">Yangi kelganlar</h2>
          <Link href="/catalog" className="font-semibold text-block-blue hover:underline">Hammasini koʻrish</Link>
        </div>
        {latest.items.length ? <ProductGrid products={latest.items} /> : <p className="text-ink-soft">Mahsulotlar tez orada qoʻshiladi.</p>}
      </section>

      <section className="grid gap-4 rounded-2xl border-2 border-line bg-white p-6 sm:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold">Payme yoki Click</h3>
          <p className="text-ink-soft">Buyurtmani onlayn toʻlang yoki yetkazganda naqd bering.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold">Holatini kuzating</h3>
          <p className="text-ink-soft">Buyurtma yigʻilgani va yoʻlga chiqqanini profilingizda koʻrasiz.</p>
        </div>
        <div>
          <h3 className="text-xl font-bold">Kirish — SMS kod bilan</h3>
          <p className="text-ink-soft">Parol shart emas: telefon raqamingizga kod keladi.</p>
        </div>
      </section>
    </div>
  );
}
