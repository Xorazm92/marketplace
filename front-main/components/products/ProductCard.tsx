import React from 'react';
import Image from 'next/image';
import { FaHeart, FaEye, FaShoppingCart } from 'react-icons/fa';
import SafeImage from '../common/SafeImage';
import styles from './ProductCard.module.scss';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category_id: number;
  brand_id: number;
  is_active: boolean;
  is_checked: string;
  product_image: Array<{
    id: number;
    url: string;
  }>;
  brand?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const getMainImage = () => {
    if (product.product_image && product.product_image.length > 0) {
      return `http://localhost:4000${product.product_image[0].url}`;
    }
    return '/images/placeholder-product.jpg';
  };

  return (
    <div className={styles.productCard} onClick={onClick}>
      <div className={styles.imageContainer}>
        <SafeImage
          src={getMainImage()}
          alt={product.title}
          width={280}
          height={200}
          className={styles.productImage}
        />
        
        <div className={styles.overlay}>
          <button className={styles.actionButton}>
            <FaEye />
          </button>
          <button className={styles.actionButton}>
            <FaHeart />
          </button>
          <button className={styles.actionButton}>
            <FaShoppingCart />
          </button>
        </div>

        {product.brand && (
          <div className={styles.brandBadge}>
            {product.brand.name}
          </div>
        )}
      </div>

      <div className={styles.productInfo}>
        <h3 className={styles.productTitle}>{product.title}</h3>
        
        <p className={styles.productDescription}>
          {product.description.length > 100 
            ? `${product.description.substring(0, 100)}...` 
            : product.description
          }
        </p>

        <div className={styles.productMeta}>
          {product.category && (
            <span className={styles.category}>{product.category.name}</span>
          )}
        </div>

        <div className={styles.priceSection}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          <button className={styles.addToCart}>
            Savatga qo'shish
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
