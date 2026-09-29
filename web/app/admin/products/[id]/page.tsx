"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { adminApi } from "@/components/admin/admin-session";
import { ProductForm } from "@/components/admin/product-form";
import { ErrorNote, Spinner } from "@/components/ui";
import { errorText } from "@/lib/client-api";
import type { AdminProduct } from "@/lib/types";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    adminApi<AdminProduct>(`/admin/products/${id}`).then(setProduct).catch((e) => setError(errorText(e)));
  }, [id]);
  if (!product) return error ? <ErrorNote>{error}</ErrorNote> : <Spinner />;
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-extrabold">{product.title}</h1>
      <ProductForm product={product} />
    </div>
  );
}
