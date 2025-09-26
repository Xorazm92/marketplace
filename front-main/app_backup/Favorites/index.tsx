import React from "react";
import styles from "./Favorites.module.scss";
import Breadcrumb from "@/components/Breadcrumb";
import { useFavorites } from "@/hooks/useFavorites";
import { Product } from "../../types";
import { HeartIcon } from "@/public/icons/profile";
import ProductCard from "@/components/home/product-card";
import { useAllProducts } from "@/hooks/products.use";

const Favorites = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const { data: products = [], isLoading, isError } = useAllProducts(); 

  const favoriteProducts = products.filter((product: Product) =>
    favorites.includes(product.id)
  );

  if (isLoading) {
    return (
      <div className={`${styles.favorites} ${styles.container}`}>
        <Breadcrumb />
        <h1 className={styles.title}>Sevimlilar</h1>
        <div className={styles.hrLine} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={`${styles.favorites} ${styles.container}`}>
        <Breadcrumb />
        <h1 className={styles.title}>Sevimlilar</h1>
        <div className={styles.hrLine} />
        <p>Mahsulotlarni yuklashda xatolik yuz berdi.</p>
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className={`${styles.favorites} ${styles.container}`}>
        <Breadcrumb />
        <h1 className={styles.title}>Sevimlilar</h1>
        <div className={styles.hrLine} />
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <HeartIcon />
          </div>
          <h3>Sevimli mahsulotlar yo'q</h3>
          <p>Mahsulotlarni sevimlilar ro'yxatiga qo'shish uchun yurakchani bosing</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.favorites} ${styles.container}`}>
      <Breadcrumb />
      <h1 className={styles.title}>Sevimlilar</h1>
      <div className={styles.hrLine} />
      <div className={styles.cardGrid}>
        {favoriteProducts.map((product: Product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={favorites.includes(product.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

export default Favorites;
