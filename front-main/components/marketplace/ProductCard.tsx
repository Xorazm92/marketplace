
import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Shield, Award, Clock } from 'lucide-react';
import OptimizedImage from '../common/OptimizedImage';
import { Product } from '../../types/product';
import { useFavorites } from '../../hooks/useFavorites';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import toast from 'react-hot-toast';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  showSafetyIndicators?: boolean;
  compact?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showSafetyIndicators = true,
  compact = false,
  className = ''
}) => {
  // Early return if product is not provided
  if (!product) {
    return null;
  }

  const { user } = useSelector((state: RootState) => state.auth);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Sevimlilar uchun tizimga kiring');
      return;
    }
    
    toggleFavorite(product.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Savatga qo\'shish uchun tizimga kiring');
      return;
    }
    
    setAddingToCart(true);
    try {
      // Add to cart logic here
      toast.success('Mahsulot savatga qo\'shildi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const getDiscountedPrice = () => {
    const discount = product?.discount_percentage ?? 0;
    if (discount > 0) {
      return product.price * (1 - discount / 100);
    }
    return product.price;
  };

  const hasDiscount = (product?.discount_percentage ?? 0) > 0;
  const finalPrice = getDiscountedPrice();
  const isNewProduct = product.created_at && 
    new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className={`${styles.productCard} ${compact ? styles.compact : ''} ${className}`}>
      <Link href={`/product/${product.slug || product.id}`}>
        <div className={styles.imageContainer}>
          <OptimizedImage
            src={product.product_images?.[0]?.image_url || '/img/placeholder-product.jpg'}
            alt={product.title}
            width={compact ? 200 : 300}
            height={compact ? 200 : 300}
            className={`${styles.productImage} ${imageLoaded ? styles.loaded : ''}`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Badges */}
          <div className={styles.badges}>
            {isNewProduct && (
              <span className={`${styles.badge} ${styles.newBadge}`}>
                <Clock size={12} />
                Yangi
              </span>
            )}
            
            {hasDiscount && (
              <span className={`${styles.badge} ${styles.discountBadge}`}>
                -{product?.discount_percentage ?? 0}%
              </span>
            )}
            
            {product.is_featured && (
              <span className={`${styles.badge} ${styles.featuredBadge}`}>
                <Star size={12} />
                TOP
              </span>
            )}
          </div>

          {/* Safety Indicators */}
          {showSafetyIndicators && (
            <div className={styles.safetyIndicators}>
              {product.safety_certifications?.map((cert) => (
                <div key={cert.id} className={styles.safetyBadge} title={cert.name}>
                  <Shield size={14} />
                </div>
              ))}
              
              {product.educational_categories?.length > 0 && (
                <div className={styles.educationalBadge} title="Ta'limiy mahsulot">
                  <Award size={14} />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.favoriteBtn} ${isFavorite(product.id) ? styles.active : ''}`}
              onClick={handleFavoriteClick}
              title={isFavorite(product.id) ? "Sevimlilardan o'chirish" : "Sevimlilar ro'yxatiga qo'shish"}
            >
              <Heart size={16} fill={isFavorite(product.id) ? "currentColor" : "none"} />
            </button>
            
            <button 
              className={styles.cartBtn}
              onClick={handleAddToCart}
              disabled={addingToCart}
              title="Savatga qo'shish"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>

      <div className={styles.productInfo}>
        <Link href={`/product/${product.slug || product.id}`}>
          <div className={styles.productDetails}>
            {/* Category */}
            {product.category && (
              <span className={styles.category}>
                {product.category.name}
              </span>
            )}

            {/* Title */}
            <h3 className={styles.productTitle} title={product.title}>
              {product.title}
            </h3>

            {/* Age Group */}
            {product.age_groups?.length > 0 && (
              <div className={styles.ageGroup}>
                🎂 {product.age_groups.map(ag => ag.name).join(', ')}
              </div>
            )}

            {/* Price */}
            <div className={styles.priceSection}>
              <div className={styles.currentPrice}>
                {formatPrice(finalPrice)} {product.currency?.symbol || 'UZS'}
              </div>
              
              {hasDiscount && (
                <div className={styles.originalPrice}>
                  {formatPrice(product.price)} {product.currency?.symbol || 'UZS'}
                </div>
              )}
            </div>

            {/* Rating & Reviews */}
            {product.average_rating && (
              <div className={styles.rating}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      fill={i < Math.floor(product.average_rating) ? "#fbbf24" : "none"}
                      color="#fbbf24"
                    />
                  ))}
                </div>
                <span className={styles.ratingText}>
                  {product.average_rating.toFixed(1)} ({product.review_count || 0})
                </span>
              </div>
            )}

            {/* Seller Info */}
            {product.user && (
              <div className={styles.sellerInfo}>
                <span>Sotuvchi: {product.user.first_name} {product.user.last_name}</span>
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
