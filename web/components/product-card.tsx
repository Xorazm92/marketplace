import Link from "next/link";
import { ageLabel, formatSum } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductImage({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-paper font-display text-4xl font-extrabold text-line ${className}`} aria-hidden>
        inbola
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element -- rasmlar backendʼdan /uploads orqali; next/image local IPʼni optimallashtirmaydi
  return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
}

export function ProductCard({ product }: { product: Product }) {
  const age = ageLabel(product.recommended_age_min, product.recommended_age_max);
  return (
    <Link href={`/p/${product.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border-2 border-line bg-white hover:border-ink">
      <ProductImage src={product.images[0]?.url} alt={product.title} className="aspect-square w-full" />
      <div className="flex flex-1 flex-col gap-1 p-3">
        {age && <span className="text-xs font-semibold text-block-blue">{age}</span>}
        <h3 className="line-clamp-2 font-sans text-base font-semibold leading-snug">{product.title}</h3>
        <div className="mt-auto pt-2">
          {product.original_price && (
            <span className="mr-2 whitespace-nowrap text-sm text-ink-soft line-through">{formatSum(product.original_price)}</span>
          )}
          <span className="whitespace-nowrap text-lg font-bold">{formatSum(product.price)}</span>
          {!product.in_stock && <p className="text-sm text-ink-soft">Hozircha yoʻq</p>}
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
