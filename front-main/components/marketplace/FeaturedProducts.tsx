import React from 'react';
import Link from 'next/link';
import styles from './FeaturedProducts.module.scss';

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

const featuredProducts: Product[] = [
  {
    id: 1,
    title: 'Bolalar uchun rangli qalam to\'plami',
    price: 45000,
    originalPrice: 60000,
    image: '/img/products/colored-pencils.jpg',
    rating: 4.8,
    reviews: 124,
    discount: 25,
    badge: 'Bestseller',
    slug: 'colored-pencils-set'
  },
  {
    id: 2,
    title: 'Yumshoq ayiq o\'yinchoq',
    price: 120000,
    originalPrice: 150000,
    image: '/img/products/teddy-bear.jpg',
    rating: 4.9,
    reviews: 89,
    discount: 20,
    slug: 'soft-teddy-bear'
  },
  {
    id: 3,
    title: 'Bolalar sport kiyimi',
    price: 85000,
    image: '/img/products/kids-sportswear.jpg',
    rating: 4.7,
    reviews: 156,
    badge: 'New',
    slug: 'kids-sportswear'
  },
  {
    id: 4,
    title: 'Ta\'lim kitoblari to\'plami',
    price: 95000,
    originalPrice: 120000,
    image: '/img/products/education-books.jpg',
    rating: 4.6,
    reviews: 203,
    discount: 21,
    slug: 'education-books-set'
  },
  {
    id: 5,
    title: 'Bolalar velosipedi',
    price: 450000,
    originalPrice: 550000,
    image: '/img/products/kids-bicycle.jpg',
    rating: 4.8,
    reviews: 67,
    discount: 18,
    badge: 'Popular',
    slug: 'kids-bicycle'
  },
  {
    id: 6,
    title: 'Maktab sumkasi',
    price: 75000,
    image: '/img/products/school-bag.jpg',
    rating: 4.5,
    reviews: 134,
    slug: 'school-backpack'
  }
];

const FeaturedProducts: React.FC = () => {
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
          {featuredProducts.map((product) => (
            <Link 
              href={`/product/${product.slug}`} 
              key={product.id}
              className={styles.productCard}
            >
              <div className={styles.imageContainer}>
                <div className={styles.imagePlaceholder}>
                  <span className={styles.productIcon}>📦</span>
                </div>
                {product.badge && (
                  <span className={`${styles.badge} ${styles[product.badge.toLowerCase()]}`}>
                    {product.badge}
                  </span>
                )}
                {product.discount && (
                  <span className={styles.discount}>-{product.discount}%</span>
                )}
              </div>
              
              <div className={styles.content}>
                <h3 className={styles.productTitle}>{product.title}</h3>
                
                <div className={styles.rating}>
                  <div className={styles.stars}>
                    {renderStars(product.rating)}
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

export default FeaturedProducts;
