import React from 'react';
import Link from 'next/link';
import styles from './RelatedProducts.module.scss';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  discount?: number;
  slug: string;
}

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
}

// Mock data olib tashlandi - faqat API'dan kelayotgan data ishlatiladi

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  categoryId,
  currentProductId
}) => {
  // Real loyihada bu API call bo'ladi
  const relatedProducts: Product[] = [];

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

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className={styles.relatedProducts}>
      <div className={styles.header}>
        <h2 className={styles.title}>O'xshash mahsulotlar</h2>
        <p className={styles.subtitle}>Sizga yoqishi mumkin bo'lgan boshqa mahsulotlar</p>
      </div>

      <div className={styles.productsGrid}>
        {relatedProducts.map((product) => (
          <Link 
            href={`/product/${product.slug}`} 
            key={product.id}
            className={styles.productCard}
          >
            <div className={styles.imageContainer}>
              <img 
                src={product.image || '/img/placeholder-product.jpg'} 
                alt={product.title}
                onError={(e) => {
                  e.currentTarget.src = '/img/placeholder-product.jpg';
                }}
              />
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
    </section>
  );
};

export default RelatedProducts;
