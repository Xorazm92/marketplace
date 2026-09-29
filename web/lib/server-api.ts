import "server-only";
import type { Category, Page, Product, Review, ReviewStats } from "./types";

const API_URL = process.env.API_URL || "http://localhost:4000";

// Server komponentlar uchun: faqat ochiq (tokensiz) maʼlumot. Katalog 60 soniya keshlanadi.
async function get<T>(path: string, revalidate: number | false = 60): Promise<T | null> {
  // revalidate=false — keshsiz: foydalanuvchi o'z yozganini darhol ko'rishi kerak bo'lgan ma'lumot.
  const res = await fetch(`${API_URL}/api/v1${path}`, revalidate === false ? { cache: "no-store" } : { next: { revalidate } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const serverApi = {
  products: (query: string) => get<Page<Product>>(`/products?${query}`).then((r) => r ?? { items: [], total: 0, page: 1, limit: 20, pages: 0 }),
  product: (idOrSlug: string) => get<Product>(`/products/${encodeURIComponent(idOrSlug)}`, 30),
  reviews: (productId: number) => get<Page<Review>>(`/reviews/product/${productId}?limit=20`, false),
  reviewStats: (productId: number) => get<ReviewStats>(`/reviews/product/${productId}/stats`, false),
  categories: () => get<Category[]>("/category", 300).then((r) => r ?? []),
};
