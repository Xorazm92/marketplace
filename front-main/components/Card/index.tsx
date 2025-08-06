import React from "react";
import Link from "next/link";
import styles from "./Card.module.scss";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import OptimizedImage from "../common/OptimizedImage";
import { Product } from "../../types";

interface CardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

const Card: React.FC<CardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
}) => {
  const { id, product_image, title, condition, price, negotiable } =
    product;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite(id);
  };

  return (
    <Link href={`/Profile/Product/${id}`} className={styles.card}>
      <OptimizedImage
        src={
          product_image && product_image.length > 0
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/public/${product_image[0].url}`
            : "/img/placeholder-product.jpg"
        }
        alt={title}
        width={300}
        height={200}
        className={styles.image}
        fallbackSrc="/img/placeholder-product.jpg"
        lazy={true}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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

export default Card;
