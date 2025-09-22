import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiStar, FiHeart, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { getProducts } from '../../endpoints/product';
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
  viewAllLink?: string;
  categoryFilter?: string;
  maxProducts?: number;
  showBadges?: boolean;
  layout?: 'grid' | 'list';
}

const ModernProductSection: React.FC<ModernProductSectionProps> = ({
  title,
  subtitle,
  viewAllLink = '/products',
  categoryFilter,
  maxProducts = 8,
  showBadges = true,
  layout = 'grid'
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getProducts();
      
      if (response && Array.isArray(response)) {
        let filteredProducts = response;
        
        // Filter by category if specified
        if (categoryFilter) {
          filteredProducts = response.filter((product: any) => 
            product.category?.slug === categoryFilter
          );
        }
        
        // Map to our interface
        const mappedProducts = filteredProducts.map(mapProduct).slice(0, maxProducts);
        setProducts(mappedProducts);
      } else {
        // Fallback to sample products
        setProducts(getSampleProducts(categoryFilter, maxProducts));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Mahsulotlarni yuklashda xatolik yuz berdi');
      setProducts(getSampleProducts(categoryFilter, maxProducts));
    } finally {
      setLoading(false);
    }
  };

  const mapProduct = (product: any): Product => ({
    id: product.id,
    title: product.title || 'Mahsulot',
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price || 0,
    originalPrice: product.original_price,
    image: product.product_image?.[0]?.url || product.images?.[0] || '/images/placeholder-product.png',
    rating: product.rating || 4.5,
    reviews: product.reviews?.length || 0,
    discount: product.discount_percentage,
    badge: product.is_featured ? 'Featured' : product.is_bestseller ? 'Bestseller' : undefined,
    slug: product.slug || `product-${product.id}`,
    brand: product.brand?.name,
    category: product.category?.name
  });

  const getSampleProducts = (category?: string, count: number = 8): Product[] => {
    const sampleProducts: Product[] = [
      {
        id: 1,
        title: "Bolalar uchun rangli ko'ylak",
        price: 150000,
        originalPrice: 200000,
        image: "/images/placeholder-product.png",
        rating: 4.8,
        reviews: 24,
        discount: 25,
        badge: "Bestseller",
        slug: "bolalar-rangli-koylak",
        brand: "INBOLA",
        category: "Kiyim-kechak"
      },
      // Add more sample products as needed
    ];

    return sampleProducts.slice(0, count);
  };

  if (loading) {
    return (
      <section className={styles.modernSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
          </div>
          <div className={styles.loadingGrid}>
            {Array.from({ length: maxProducts }).map((_, index) => (
              <div key={index} className={styles.productCardSkeleton}>
                <div className={styles.skeletonImage}></div>
                <div className={styles.skeletonContent}>
                  <div className={styles.skeletonTitle}></div>
                  <div className={styles.skeletonPrice}></div>
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
      <section className={styles.modernSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
          </div>
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <button onClick={loadProducts} className={styles.retryButton}>
              Qaytadan urinish
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.modernSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className={styles.viewAllLink}>
              Barchasini ko'rish
              <FiArrowRight />
            </Link>
          )}
        </div>

        <div className={`${styles.productsGrid} ${styles[layout]}`}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                <img
                  src={product.image}
                  alt={product.title}
                  className={styles.productImage}
                />
                {showBadges && product.badge && (
                  <span className={`${styles.productBadge} ${styles[product.badge.toLowerCase()]}`}>
                    {product.badge}
                  </span>
                )}
                {product.discount && (
                  <span className={styles.discountBadge}>
                    -{product.discount}%
                  </span>
                )}
                <div className={styles.productActions}>
                  <button className={styles.actionButton}>
                    <FiHeart />
                  </button>
                  <button className={styles.actionButton}>
                    <FiShoppingCart />
                  </button>
                </div>
              </div>

              <div className={styles.productInfo}>
                <div className={styles.productMeta}>
                  {product.brand && (
                    <span className={styles.productBrand}>{product.brand}</span>
                  )}
                  {product.category && (
                    <span className={styles.productCategory}>{product.category}</span>
                  )}
                </div>

                <h3 className={styles.productTitle}>
                  <Link href={`/product/${product.slug}`}>
                    {product.title}
                  </Link>
                </h3>

                <div className={styles.productRating}>
                  <div className={styles.stars}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <FiStar
                        key={index}
                        className={index < Math.floor(product.rating || 0) ? styles.starFilled : styles.starEmpty}
                      />
                    ))}
                  </div>
                  <span className={styles.reviewCount}>({product.reviews})</span>
                </div>

                <div className={styles.productPricing}>
                  <span className={styles.currentPrice}>
                    {product.price.toLocaleString()} so'm
                  </span>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>
                      {product.originalPrice.toLocaleString()} so'm
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModernProductSection;
