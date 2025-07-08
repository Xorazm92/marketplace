import React from "react";
import Link from "next/link";
import styles from "./product.module.scss";
import { FaHeart, FaRegHeart } from "react-icons/fa";
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
  const { id, product_image, title, condition, storage, price, negotiable } =
    product;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(id);
  };

  return (
    <Link href={`/productdetails/${id}`} className={styles.card}>
      <img
        src={
          product_image && product_image.length > 0
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/${product_image[0].url}`
            : "mobile_phone_image.jpg"
        }
        alt={title}
        className={styles.image}
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
          <b>Состояние:</b>{" "}
          <span className={styles.condition}>
            {condition ? "Новый" : "Б/у"}
          </span>
        </p>

        <p className={styles.wrapper}>
          <b>Память:</b> <span className={styles.memory}>{storage}</span>
        </p>

        <div className={styles.footer}>
          <span className={styles.price}>{price}</span>
          {negotiable && <span className={styles.badge}>Торг есть</span>}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
