import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import style from "./product.module.scss";
import { useProducts } from "../../../hooks/products.use";
import ProductSkeleton from "../product-card/product-card.skelton";
import { useFavorites } from "../../../hooks/useFavorites";
import ProductCard from "../product-card";

const ProductSide = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const { toggleFavorite, isFavorite } = useFavorites();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  useEffect(() => {
    const pageFromUrl = Number(searchParams.get('page')) || 1;

    const filterParams: Record<string, string> = {};

    if (searchParams.get('search')) filterParams.search = searchParams.get('search')!;
    if (searchParams.get('brand')) filterParams.brand = searchParams.get('brand')!;
    if (searchParams.get('color')) filterParams.color = searchParams.get('color')!;
    if (searchParams.get('memory')) filterParams.memory = searchParams.get('memory')!;
    if (searchParams.get('region')) filterParams.region = searchParams.get('region')!;
    if (searchParams.get('othermodel')) filterParams.othermodel = searchParams.get('othermodel')!;
    if (searchParams.get('condition')) filterParams.condition = searchParams.get('condition')!;
    if (searchParams.get('is-top')) filterParams['is-top'] = searchParams.get('is-top')!;

    setPage(pageFromUrl);
    setFilters(filterParams);
  }, [searchParams]);

  const { data: products, isLoading } = useProducts(page, filters);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className={style.products_grid}>
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products?.data?.length === 0) {
    return (
      <div className={style.no_data}>
        <p>Нет данных</p>
      </div>
    );
  }

  return (
    <>
      <div className={style.products_grid}>
        {products?.data?.map((product: any) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={isFavorite(product.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {products?.meta?.lastPage > 1 && (
        <div className={style.pagination}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Prev
          </button>

          {Array.from({ length: products.meta.lastPage }).map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={page === i + 1 ? style.active : ""}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === products.meta.lastPage}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default ProductSide;
