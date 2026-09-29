import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGallery } from "@/components/product-gallery";
import { ageLabel, formatSum } from "@/lib/format";
import { serverApi } from "@/lib/server-api";

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await serverApi.product(slug);
  return product ? { title: product.title, description: product.short_description ?? undefined } : { title: "Topilmadi" };
}

export default async function ProductPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  const product = await serverApi.product(slug);
  if (!product) notFound();
  const age = ageLabel(product.recommended_age_min, product.recommended_age_max);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductGallery images={product.images} title={product.title} />
      <div className="space-y-5">
        {product.category && (
          <Link href={`/catalog?category=${product.category.slug}`} className="text-sm font-semibold text-block-blue hover:underline">
            {product.category.name}
          </Link>
        )}
        <h1 className="text-4xl font-extrabold">{product.title}</h1>
        <div>
          {product.original_price && <p className="text-ink-soft line-through">{formatSum(product.original_price)}</p>}
          <p className="text-3xl font-bold">{formatSum(product.price)}</p>
        </div>
        <AddToCart productId={product.id} inStock={product.in_stock} min={product.min_order_quantity} max={product.max_order_quantity} />

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-2xl border-2 border-line bg-white p-4 text-sm">
          {age && (<><dt className="text-ink-soft">Yosh</dt><dd className="font-semibold">{age}</dd></>)}
          {product.brand && (<><dt className="text-ink-soft">Brend</dt><dd className="font-semibold">{product.brand.name}</dd></>)}
          {product.material && (<><dt className="text-ink-soft">Material</dt><dd className="font-semibold">{product.material}</dd></>)}
          <dt className="text-ink-soft">Omborda</dt>
          <dd className={`font-semibold ${product.in_stock ? "text-block-green" : "text-ink-soft"}`}>{product.in_stock ? "Bor" : "Hozircha yoʻq"}</dd>
        </dl>

        {(product.choking_hazard || product.safety_warnings) && (
          <div className="rounded-2xl border-2 border-block-yellow bg-yellow-50 p-4 text-sm">
            <h2 className="mb-1 font-sans text-base font-bold">Xavfsizlik</h2>
            {product.choking_hazard && <p>Mayda qismlar bor — 3 yoshgacha bolalarga bermang.</p>}
            {product.safety_warnings && <p>{product.safety_warnings}</p>}
          </div>
        )}

        <div className="max-w-prose whitespace-pre-line leading-relaxed">{product.description}</div>
      </div>
    </div>
  );
}
