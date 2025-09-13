import React from "react";
import Link from "next/link";
import styles from "./product.module.scss";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import ProductImageSlider from "./ProductImageSlider";
import { Product } from "../../../types";

interface CardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

const ProductCard: React.FC<CardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
}) => {
  const {
    id,
    product_image,
    title,
    condition,
    price,
    negotiable,
  } = product as any;

  const images = (product as any).images as Array<{ url?: string }> | undefined;
  const imageUrl =
    images?.[0]?.url ||
    product_image?.url ||
    product_image ||
    '';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(id);
  };

  return (
    <Link href={`/productdetails/${id}`} className={styles.card}>
      <ProductImageSlider
        images={images ? images.map(img => img.url || '').filter(Boolean) : [imageUrl].filter(Boolean)}
        title={title}
        autoSlide={true}
        autoSlideInterval={4000}
      />
      <div className={styles.info}>
        <div className={styles.title}>
          <h3>{title}</h3>
          <div className={styles.like} onClick={handleFavoriteClick}>
            {isFavorite ? (
              <FaHeart color="#FF4E64" />
            ) : (
              <FaRegHeart color="#999CA0" />
            )}
          </div>
        </div>

        <p className={styles.wrapper}>
          <b>Holati:</b>{" "}
          <span className={styles.condition}>
            {condition ? "Yangi" : "Ishlatilgan"}
          </span>
        </p>

        {/* <p className={styles.wrapper}>
          <b>Память:</b> <span className={styles.memory}>{storage}</span>
        </p> */}

        <div className={styles.footer}>
          <span className={styles.price}>{price}</span>
          {negotiable && <span className={styles.badge}>Торг есть</span>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
