import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './FeaturedProducts.module.scss';
import { getAllProducts } from '../../services/api/product';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  discount?: number;
  badge?: string;
  slug: string;
}

// Demo ma'lumotlar o'chirildi - real API ma'lumotlari ishlatiladi
const featuredProducts: Product[] = [
  // Real mahsulotlar API dan yuklanadi
];

const FeaturedProducts: React.FC = () => {
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts();
        // Faqat birinchi 6 ta mahsulotni olish
        setRealProducts(response.data.slice(0, 6));
      } catch (error) {
        console.error('Error loading products:', error);
        setRealProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

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

  return (
    <section className={styles.featuredSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Mashhur mahsulotlar</h2>
          <Link href="/products" className={styles.viewAll}>
            Barchasini ko'rish →
          </Link>
        </div>
        
        <div className={styles.grid}>
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.productCard}>
                <div className={styles.loadingSkeleton}>
                  <div className={styles.skeletonImage}></div>
                  <div className={styles.skeletonText}></div>
                  <div className={styles.skeletonPrice}></div>
                </div>
              </div>
            ))
          ) : realProducts.length > 0 ? (
            realProducts.map((product) => (
              <Link
                href={`/product/${product.id}`}
                key={product.id}
                className={styles.productCard}
              >
                <div className={styles.imageContainer}>
                  {product.product_image?.[0]?.url ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}/${product.product_image[0].url}`}
                      alt={product.title}
                      className={styles.productImage}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span className={styles.productIcon}>📦</span>
                    </div>
                  )}
                  <span className={styles.badge}>Yangi</span>
                </div>

                <div className={styles.content}>
                  <h3 className={styles.productTitle}>{product.title}</h3>

                  <div className={styles.rating}>
                    <div className={styles.stars}>
                      {renderStars(4.5)} {/* Default rating */}
                    </div>
                    <span className={styles.reviewCount}>(0)</span>
                  </div>

                  <div className={styles.priceContainer}>
                    <span className={styles.currentPrice}>
                      {product.price ? formatPrice(product.price) : 'Narx so\'ralsin'}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <h3>Hozircha mahsulotlar yo'q</h3>
              <p>Tez orada yangi mahsulotlar qo'shiladi!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
