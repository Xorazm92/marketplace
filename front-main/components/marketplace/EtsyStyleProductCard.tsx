import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
// import { addToCart } from '../../store/slices/cartSlice';
// import { addToWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { toast } from 'react-toastify';
import styles from './EtsyStyleProductCard.module.scss';

interface Product {
  id: number;
  title: string;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  images: string[];
  rating?: number;
  review_count?: number;
  seller_name?: string;
  seller_rating?: number;
  is_bestseller?: boolean;
  is_featured?: boolean;
  shipping_info?: string;
  age_range?: string;
  safety_certified?: boolean;
  educational_value?: string;
  slug?: string;
}

interface EtsyStyleProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
  showQuickActions?: boolean;
}

const EtsyStyleProductCard: React.FC<EtsyStyleProductCardProps> = ({
  product,
  variant = 'grid',
  showQuickActions = true
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  // const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const wishlistItems: any[] = []; // Temporary placeholder
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isInWishlist = wishlistItems.some(item => item.id === product.id);
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountAmount = hasDiscount ? product.original_price! - product.price : 0;
  const discountPercentage = hasDiscount ? Math.round((discountAmount / product.original_price!) * 100) : 0;

  const handleImageHover = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // if (isInWishlist) {
      //   dispatch(removeFromWishlist(product.id));
      //   toast.success('Sevimlilardan olib tashlandi');
      // } else {
      //   dispatch(addToWishlist(product));
      //   toast.success('Sevimlilarga qo\'shildi');
      // }
      toast.info('Wishlist funksiyasi hozircha mavjud emas');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      // dispatch(addToCart({
      //   id: product.id,
      //   title: product.title,
      //   price: product.price,
      //   image: product.images[0],
      //   quantity: 1
      // }));
      toast.info('Savatcha funksiyasi hozircha mavjud emas');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Quick view modal logic here
    if (process.env.NODE_ENV === "development") console.log('Quick view:', product.id);
  };

  const productUrl = `/product/${product.slug || product.id}`;

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

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className={styles.emptyStar}>☆</span>);
    }

    return stars;
  };

  return (
    <div 
      className={`${styles.productCard} ${styles[variant]}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={productUrl} className={styles.productLink}>
        {/* Product Image Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageContainer}>
            <Image
              src={product.images[currentImageIndex] || '/images/placeholder-product.jpg'}
              alt={product.title}
              fill
              style={{ objectFit: 'cover' }}
              className={styles.productImage}
            />

            {/* Badges */}
            <div className={styles.badges}>
              {hasDiscount && (
                <span className={styles.discountBadge}>
                  -{discountPercentage}%
                </span>
              )}
              {product.is_bestseller && (
                <span className={styles.bestsellerBadge}>
                  Bestseller
                </span>
              )}
              {product.is_featured && (
                <span className={styles.featuredBadge}>
                  Tavsiya etiladi
                </span>
              )}
              {product.safety_certified && (
                <span className={styles.safetyBadge}>
                  🛡️ Xavfsiz
                </span>
              )}
            </div>

            {/* Image Navigation Dots */}
            {product.images.length > 1 && (
              <div className={styles.imageNavigation}>
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    className={`${styles.imageDot} ${
                      index === currentImageIndex ? styles.active : ''
                    }`}
                    onMouseEnter={() => handleImageHover(index)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  />
                ))}
              </div>
            )}

            {/* Quick Actions */}
            {showQuickActions && (
              <div className={`${styles.quickActions} ${isHovered ? styles.visible : ''}`}>
                <button
                  className={`${styles.wishlistBtn} ${isInWishlist ? styles.active : ''}`}
                  onClick={handleWishlistToggle}
                  title={isInWishlist ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill={isInWishlist ? 'currentColor' : 'none'}
                    />
                  </svg>
                </button>

                <button
                  className={styles.quickViewBtn}
                  onClick={handleQuickView}
                  title="Tezkor ko'rish"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>

                <button
                  className={`${styles.addToCartBtn} ${isLoading ? styles.loading : ''}`}
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  title="Savatchaga qo'shish"
                >
                  {isLoading ? (
                    <div className={styles.spinner} />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Info Section */}
        <div className={styles.productInfo}>
          {/* Seller Info */}
          {product.seller_name && (
            <div className={styles.sellerInfo}>
              <span className={styles.sellerName}>{product.seller_name}</span>
              {product.seller_rating && (
                <div className={styles.sellerRating}>
                  <span className={styles.star}>★</span>
                  <span>{product.seller_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}

          {/* Product Title */}
          <h3 className={styles.productTitle}>{product.title}</h3>

          {/* Age Range & Educational Value */}
          <div className={styles.productMeta}>
            {product.age_range && (
              <span className={styles.ageRange}>
                👶 {product.age_range}
              </span>
            )}
            {product.educational_value && (
              <span className={styles.educationalValue}>
                🎓 {product.educational_value}
              </span>
            )}
          </div>

          {/* Rating & Reviews */}
          {product.rating && (
            <div className={styles.rating}>
              <div className={styles.stars}>
                {renderStars(product.rating)}
              </div>
              <span className={styles.ratingText}>
                ({product.review_count || 0})
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className={styles.priceSection}>
            <div className={styles.priceContainer}>
              <span className={styles.currentPrice}>
                {product.price.toLocaleString()} so'm
              </span>
              {hasDiscount && (
                <span className={styles.originalPrice}>
                  {product.original_price!.toLocaleString()} so'm
                </span>
              )}
            </div>
            {product.shipping_info && (
              <span className={styles.shippingInfo}>
                {product.shipping_info}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default EtsyStyleProductCard;
