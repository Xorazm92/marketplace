"use client";

import { useState } from "react";
import type { ProductImage as Image } from "@/lib/types";
import { ProductImage } from "./product-card";

export function ProductGallery({ images, title }: { images: Image[]; title: string }) {
  const [index, setIndex] = useState(0);
  return (
    <div className="space-y-3">
      <ProductImage src={images[index]?.url} alt={title} className="aspect-square w-full rounded-2xl border-2 border-line bg-white" />
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, i) => (
            <button key={image.id} type="button" onClick={() => setIndex(i)} aria-label={`${i + 1}-rasm`} aria-pressed={i === index} className={`shrink-0 overflow-hidden rounded-xl border-2 ${i === index ? "border-ink" : "border-line"}`}>
              <ProductImage src={image.url} alt="" className="h-16 w-16" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
