import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiStar, FiHeart, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { useAllProducts } from '../../hooks/products.use';
import styles from './ModernProductSection.module.scss';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  badge?: string;
  slug: string;
  brand?: string;
  category?: string;
}

interface ModernProductSectionProps {
  title: string;
  subtitle?: string;
  viewAllLink: string;
  categoryFilter?: string;
  maxProducts?: number;
  showBadges?: boolean;
  layout?: 'grid' | 'slider';
}

const ModernProductSection: React.FC<ModernProductSectionProps> = ({
  title,
  subtitle,
  viewAllLink,
  categoryFilter,
  maxProducts = 8,
  showBadges = true,
  layout = 'grid'
}) => {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use React Query hook
  const { data: allProducts, isLoading, refetch } = useAllProducts();

  // Process products when data changes
  const processProducts = (productsData: any[]) => {
    try {
      if (!productsData) return [];
      
      // Filter by category if specified
      let result = [...productsData];
      if (categoryFilter) {
        result = result.filter(product => product.category?.toLowerCase() === categoryFilter.toLowerCase());
      }
      
      // Limit number of products
      return result.slice(0, maxProducts);
    } catch (err) {
      console.error('Error processing products:', err);
      setError('Mahsulotlarni yuklashda xatolik yuz berdi');
      return [];
    }
  };

  // Map product data to our interface
  const mapProduct = (product: any): Product => ({
    id: product.id,
    title: product.name || product.title || '',
    price: product.price || 0,
    originalPrice: product.originalPrice || product.price || 0,
    image: product.images?.[0]?.url || product.image || '',
    rating: product.rating || 0,
    reviews: product.reviewsCount || 0,
    discount: product.discount || 0,
    badge: product.badge || '',
    slug: product.slug || `product-${product.id}`,
    brand: product.brand?.name || '',
    category: product.category?.name || product.category
  });

  // Process products when data changes
  useEffect(() => {
    try {
      setError(null);

      if (allProducts && Array.isArray(allProducts)) {
        // Map all products first
        const mappedProducts = allProducts.map(mapProduct);
        // Then filter and limit
        const processed = processProducts(mappedProducts);
        setFilteredProducts(processed);
      } else {
        setError('Mahsulotlar yuklanmadi');
      }
    } catch (error) {
      console.error('Error processing products:', error);
      setError('Mahsulotlarni yuklashda xatolik yuz berdi');
    }
  }, [allProducts, categoryFilter, maxProducts]);

  // Render product cards
  const renderProducts = () => {
    if (!filteredProducts.length) {
      return (
        <div className={styles.noProducts}>
          <p>Mahsulot topilmadi</p>
        </div>
      );
    }

    return filteredProducts.map((product) => (
      <Link key={product.id} href={`/products/${product.slug}`} className={styles.productCard}>
        <div className={styles.productImageContainer}>
          <img
            src={product.image}
            alt={product.title}
            className={styles.productImage}
            loading="lazy"
          />
          {/* Discount Badge */}
          {showBadges && product.discount && (
            <div className={styles.discountBadge}>
              -{product.discount}%
            </div>
          )}
          {/* Wishlist Button */}
          <button className={styles.wishlistBtn} onClick={(e) => e.preventDefault()}>
            <FiHeart />
          </button>
          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <button className={styles.quickBtn} onClick={(e) => e.preventDefault()}>
              <FiShoppingCart />
            </button>
          </div>
        </div>
        <div className={styles.productInfo}>
          <div className={styles.brandName}>{product.brand}</div>
          <h3 className={styles.productTitle}>{product.title}</h3>
          <div className={styles.rating}>
            <div className={styles.stars}>
              {Array.from({ length: 5 }, (_, index) => (
                <FiStar
                  key={index}
                  className={index < Math.floor(product.rating || 0) ? styles.starFilled : styles.starEmpty}
                />
              ))}
            </div>
            <span className={styles.reviewCount}>({product.reviews})</span>
          </div>
          <div className={styles.priceContainer}>
            <span className={styles.currentPrice}>{product.price.toLocaleString()} UZS</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>{product.originalPrice.toLocaleString()} UZS</span>
            )}
          </div>
        </div>
      </Link>
    ));
  };

  if (isLoading) {
    return (
      <section className={styles.productSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2 className={styles.title}>{title}</h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            <Link href={viewAllLink} className={styles.viewAllBtn}>
              Barchasini ko'rish
              <FiArrowRight className={styles.arrowIcon} />
            </Link>
          </div>
          <div className={styles.loading}>
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className={styles.productCardSkeleton}>
                <div className={styles.imageSkeleton}></div>
                <div className={styles.contentSkeleton}>
                  <div className={styles.titleSkeleton}></div>
                  <div className={styles.priceSkeleton}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.productSection}>
        <div className={styles.container}>
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={() => refetch()} className={styles.retryBtn}>
              Qayta urinish
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.productSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <Link href={viewAllLink} className={styles.viewAllBtn}>
            Barchasini ko'rish
            <FiArrowRight className={styles.arrowIcon} />
          </Link>
        </div>
        <div className={layout === 'grid' ? styles.grid : styles.slider}>
          {renderProducts()}
        </div>
      </div>
    </section>
  );
};

export default ModernProductSection;
