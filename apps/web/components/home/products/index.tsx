import { useRouter } from "next/router";
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

  useEffect(() => {
    const query = router.query;
    const pageFromUrl = Number(query.page) || 1;

    const filterParams: Record<string, string> = {};

    if (query.search) filterParams.search = query.search as string;
    if (query.brand) filterParams.brand = query.brand as string;
    if (query.color) filterParams.color = query.color as string;
    if (query.memory) filterParams.memory = query.memory as string;
    if (query.region) filterParams.region = query.region as string;
    if (query.othermodel) filterParams.othermodel = query.othermodel as string;
    if (query.condition) filterParams.condition = query.condition as string;
    if (query["is-top"]) filterParams["is-top"] = query["is-top"] as string;

    setPage(pageFromUrl);
    setFilters(filterParams);
  }, [router.query]);

  const { data: products, isLoading } = useProducts(page, filters);

  const handlePageChange = (newPage: number) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: newPage },
      },
      undefined,
      { shallow: true }
    );
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
