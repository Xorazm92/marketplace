import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiStar, FiHeart, FiShoppingCart, FiArrowRight } from 'react-icons/fi';
import { getAllProducts } from '../../endpoints/product';
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
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use React Query hook
  const { data: allProducts, isLoading } = useAllProducts();

  // Process products when data changes
  useEffect(() => {
    try {
      setError(null);

      if (allProducts && Array.isArray(allProducts)) {
        let filteredProducts = allProducts;

        // Filter by category if specified
        if (categoryFilter) {
          filteredProducts = allProducts.filter(product =>
            product.category?.slug === categoryFilter
          );
        }

        // Map to our interface
        const mappedProducts = filteredProducts.map(mapProduct).slice(0, maxProducts);
        setProducts(mappedProducts);
      } else {
        // Fallback to sample data
        setProducts(getSampleProducts(categoryFilter).slice(0, maxProducts));
      }
    } catch (error) {
      console.error('Error processing products:', error);
      setError('Mahsulotlarni yuklashda xatolik yuz berdi');
      setProducts(getSampleProducts(categoryFilter).slice(0, maxProducts));
    }
  }, [allProducts, categoryFilter, maxProducts]);

  const mapProduct = (product: any): Product => {
    // Use sample images based on category for better visual experience
    const getSampleImageByCategory = (categorySlug: string) => {
      const imageMap: Record<string, string> = {
        'toys': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        'books': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        'clothing': 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop',
        'sports': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        'school': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
      };
      return imageMap[categorySlug] || '/img/placeholder-product.jpg';
    };

    return {
      id: product.id,
      title: product.title || 'Mahsulot',
      price: Number(product.price) || 0,
      originalPrice: product.original_price ? Number(product.original_price) : undefined,
      image: getSampleImageByCategory(product.category?.slug || 'default'),
      rating: 4.5,
      reviews: Math.floor(Math.random() * 100) + 10,
      slug: product.slug || `product-${product.id}`,
      brand: product.brand?.name || 'INBOLA',
      category: product.category?.name || 'Mahsulot'
    };
  };

  const getSampleProducts = (category?: string): Product[] => {
    const sampleProducts: Record<string, Product[]> = {
      toys: [
        {
          id: 1,
          title: 'LEGO Konstruktor',
          price: 120000,
          originalPrice: 150000,
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
          rating: 4.8,
          reviews: 245,
          discount: 20,
          slug: 'lego-konstruktor',
          brand: 'LEGO',
          category: "O'yinchoqlar"
        },
        {
          id: 2,
          title: 'Yumshoq ayiq',
          price: 45000,
          originalPrice: 60000,
          image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
          rating: 4.6,
          reviews: 189,
          discount: 25,
          slug: 'yumshoq-ayiq',
          brand: 'TeddyBear',
          category: "O'yinchoqlar"
        }
      ],
      books: [
        {
          id: 3,
          title: 'Bolalar ertaklari',
          price: 35000,
          originalPrice: 45000,
          image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
          rating: 4.7,
          reviews: 156,
          discount: 22,
          slug: 'bolalar-ertaklari',
          brand: 'Nashr',
          category: 'Kitoblar'
        },
        {
          id: 4,
          title: 'Matematik kitob',
          price: 25000,
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
          rating: 4.4,
          reviews: 98,
          slug: 'matematik-kitob',
          brand: 'Ta\'lim',
          category: 'Kitoblar'
        }
      ],
      clothing: [
        {
          id: 5,
          title: 'Bolalar ko\'ylagi',
          price: 45000,
          originalPrice: 60000,
          image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop',
          rating: 4.5,
          reviews: 134,
          discount: 25,
          slug: 'bolalar-koylagi',
          brand: 'KidsWear',
          category: 'Kiyim-kechak'
        }
      ]
    };

    return category ? (sampleProducts[category] || []) : Object.values(sampleProducts).flat();
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} UZS`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={index < Math.floor(rating) ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  if (isLoading) {
    return (
      <section className={styles.productSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className={styles.loadingGrid}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={styles.loadingCard}>
                <div className={styles.loadingImage}></div>
                <div className={styles.loadingContent}>
                  <div className={styles.loadingTitle}></div>
                  <div className={styles.loadingPrice}></div>
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
            <button onClick={loadProducts} className={styles.retryBtn}>
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

        <div className={`${styles.productsGrid} ${styles[layout]}`}>
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/productdetails/${product.id}`}
              className={styles.productCard}
            >
              <div className={styles.imageContainer}>
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
                    {renderStars(product.rating || 4.5)}
                  </div>
                  <span className={styles.reviewCount}>({product.reviews})</span>
                </div>

                <div className={styles.priceContainer}>
                  <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModernProductSection;
