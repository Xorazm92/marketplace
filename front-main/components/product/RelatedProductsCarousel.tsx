import React, { useState, useRef, useEffect } from 'react';
import { MdChevronLeft, MdChevronRight, MdFavorite, MdFavoriteBorder, MdShoppingCart, MdStar, MdVerifiedUser } from 'react-icons/md';
import { TrustBadge } from '../common/TrustBadges';
import styles from './RelatedProductsCarousel.module.scss';

export interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  seller: {
    name: string;
    isVerified: boolean;
    rating: number;
  };
  badges: Array<'parent-approved' | 'eco-friendly' | 'educational' | 'bestseller'>;
  category: string;
  isInWishlist?: boolean;
  inStock: boolean;
}

interface RelatedProductsCarouselProps {
  title: string;
  products: Product[];
  onProductClick: (productId: number) => void;
  onAddToCart: (productId: number) => void;
  onToggleWishlist: (productId: number) => void;
  className?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

const RelatedProductsCarousel: React.FC<RelatedProductsCarouselProps> = ({
  title,
  products,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  className = '',
  autoPlay = false,
  showControls = true,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 4 }
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [visibleItems, setVisibleItems] = useState(itemsPerView.desktop);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  // Responsive items calculation
  useEffect(() => {
    const updateVisibleItems = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleItems(itemsPerView.mobile);
      } else if (width < 1024) {
        setVisibleItems(itemsPerView.tablet);
      } else {
        setVisibleItems(itemsPerView.desktop);
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, [itemsPerView]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && products.length > visibleItems) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % Math.max(1, products.length - visibleItems + 1));
      }, 3000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, products.length, visibleItems]);

  const maxIndex = Math.max(0, products.length - visibleItems);

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(Math.max(index, 0), maxIndex));
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('UZS', 'so\'m');
  };

  const calculateDiscount = (original: number, current: number) => {
    return Math.round(((original - current) / original) * 100);
  };

  const renderStars = (rating: number) => {
    return (
      <div className={styles.stars}>
        {[...Array(5)].map((_, i) => (
          <MdStar
            key={i}
            className={i < Math.floor(rating) ? styles.starFilled : styles.starEmpty}
          />
        ))}
      </div>
    );
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className={`${styles.carousel} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.headerControls}>
          {autoPlay && (
            <button
              className={styles.playPauseBtn}
              onClick={toggleAutoPlay}
              aria-label={isPlaying ? 'Pause autoplay' : 'Start autoplay'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
          )}
          {showControls && (
            <div className={styles.navControls}>
              <button
                className={styles.navBtn}
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                aria-label="Previous products"
              >
                <MdChevronLeft />
              </button>
              <button
                className={styles.navBtn}
                onClick={goToNext}
                disabled={currentIndex >= maxIndex}
                aria-label="Next products"
              >
                <MdChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.carouselContainer} ref={carouselRef}>
        <div 
          className={styles.carouselTrack}
          style={{
            transform: `translateX(-${(currentIndex * 100) / visibleItems}%)`,
            width: `${(products.length * 100) / visibleItems}%`
          }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className={styles.productCard}
              style={{ width: `${100 / products.length}%` }}
            >
              <div className={styles.imageContainer}>
                <img
                  src={product.images[0] || '/img/placeholder-product.jpg'}
                  alt={product.title}
                  className={styles.productImage}
                  onClick={() => onProductClick(product.id)}
                  onError={(e) => {
                    e.currentTarget.src = '/img/placeholder-product.jpg';
                  }}
                />
                
                {product.discount && (
                  <div className={styles.discountBadge}>
                    -{product.discount}%
                  </div>
                )}

                <div className={styles.imageOverlay}>
                  <button
                    className={styles.wishlistBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product.id);
                    }}
                    aria-label={product.isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {product.isInWishlist ? <MdFavorite /> : <MdFavoriteBorder />}
                  </button>

                  <button
                    className={styles.quickAddBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product.id);
                    }}
                    disabled={!product.inStock}
                    aria-label="Quick add to cart"
                  >
                    <MdShoppingCart />
                  </button>
                </div>

                <div className={styles.badges}>
                  {product.badges.map((badge, index) => (
                    <TrustBadge
                      key={index}
                      type={badge}
                      size="sm"
                      showText={false}
                      variant="compact"
                    />
                  ))}
                </div>
              </div>

              <div className={styles.productInfo} onClick={() => onProductClick(product.id)}>
                <div className={styles.seller}>
                  <span className={styles.sellerName}>{product.seller.name}</span>
                  {product.seller.isVerified && (
                    <MdVerifiedUser className={styles.verifiedIcon} />
                  )}
                </div>

                <h3 className={styles.productTitle}>{product.title}</h3>

                <div className={styles.rating}>
                  {renderStars(product.rating)}
                  <span className={styles.ratingCount}>({product.reviewCount})</span>
                </div>

                <div className={styles.pricing}>
                  <div className={styles.currentPrice}>
                    {formatPrice(product.price)}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className={styles.originalPrice}>
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                </div>

                {!product.inStock && (
                  <div className={styles.outOfStock}>
                    Mavjud emas
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      {products.length > visibleItems && (
        <div className={styles.dotsContainer}>
          {[...Array(maxIndex + 1)].map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${currentIndex === index ? styles.dotActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Mobile touch controls */}
      <div className={styles.mobileControls}>
        <button
          className={styles.mobileNavBtn}
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          aria-label="Previous"
        >
          <MdChevronLeft />
        </button>
        <button
          className={styles.mobileNavBtn}
          onClick={goToNext}
          disabled={currentIndex >= maxIndex}
          aria-label="Next"
        >
          <MdChevronRight />
        </button>
      </div>
    </section>
  );
};

export default RelatedProductsCarousel;