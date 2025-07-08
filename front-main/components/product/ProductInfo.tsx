import React from 'react';
import styles from './ProductInfo.module.scss';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  sku: string;
  brand: string;
  category: string;
  description: string;
}

interface ProductInfoProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onAddToWishlist: () => void;
  onBuyNow: () => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  onAddToWishlist,
  onBuyNow
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.star}>★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.halfStar}>★</span>);
    }

    return stars;
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      onQuantityChange(newQuantity);
    }
  };

  return (
    <div className={styles.productInfo}>
      <div className={styles.breadcrumb}>
        <span>INBOLA</span> / <span>{product.category}</span> / <span>{product.title}</span>
      </div>

      <h1 className={styles.title}>{product.title}</h1>

      <div className={styles.rating}>
        <div className={styles.stars}>
          {renderStars(product.rating)}
          <span className={styles.ratingValue}>({product.rating})</span>
        </div>
        <span className={styles.reviewCount}>{product.reviewCount} ta sharh</span>
      </div>

      <div className={styles.priceSection}>
        <div className={styles.currentPrice}>{formatPrice(product.price)}</div>
        {product.originalPrice && (
          <div className={styles.priceDetails}>
            <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
            {product.discount && (
              <span className={styles.discount}>-{product.discount}% chegirma</span>
            )}
          </div>
        )}
      </div>

      <div className={styles.stockInfo}>
        {product.inStock ? (
          <div className={styles.inStock}>
            ✅ Mavjud ({product.stockCount} ta qoldi)
          </div>
        ) : (
          <div className={styles.outOfStock}>
            ❌ Mavjud emas
          </div>
        )}
      </div>

      <div className={styles.productMeta}>
        <div className={styles.metaItem}>
          <span className={styles.label}>SKU:</span>
          <span className={styles.value}>{product.sku}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.label}>Brend:</span>
          <span className={styles.value}>{product.brand}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.label}>Kategoriya:</span>
          <span className={styles.value}>{product.category}</span>
        </div>
      </div>

      {product.inStock && (
        <div className={styles.purchaseSection}>
          <div className={styles.quantitySelector}>
            <label>Miqdor:</label>
            <div className={styles.quantityControls}>
              <button 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className={styles.quantity}>{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.stockCount}
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button 
              className={styles.addToCartBtn}
              onClick={onAddToCart}
            >
              🛒 Savatchaga qo'shish
            </button>
            
            <button 
              className={styles.wishlistBtn}
              onClick={onAddToWishlist}
            >
              ❤️
            </button>
          </div>

          <button 
            className={styles.buyNowBtn}
            onClick={onBuyNow}
          >
            ⚡ Darhol sotib olish
          </button>
        </div>
      )}

      <div className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.icon}>🚚</span>
          <span>Bepul yetkazib berish 100,000 so'm dan yuqori</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.icon}>🔄</span>
          <span>14 kun ichida qaytarish</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.icon}>🛡️</span>
          <span>1 yil kafolat</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
