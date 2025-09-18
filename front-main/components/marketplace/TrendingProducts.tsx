import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiTrendingUp, FiHeart, FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';
import { MdFavoriteBorder } from 'react-icons/md';
import styles from './TrendingProducts.module.scss';
import { getAllProducts } from '../../endpoints/product';

interface Product {
  id: number;
  title: string;
  price: number;
  slug: string;
  product_image: Array<{ url: string }>;
  brand: { name: string };
  category: { name: string };
  reviews: Array<{ rating: number }>;
  view_count: number;
  like_count: number;
  trending_score?: number;
}

const TrendingProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'popular' | 'new'>('trending');

  useEffect(() => {
    loadTrendingProducts();
  }, [activeTab]);

  const loadTrendingProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      if (response && Array.isArray(response)) {
        let filteredProducts = response;

        // Sort based on active tab
        if (activeTab === 'trending') {
          filteredProducts = response
            .map(p => ({ ...p, trending_score: (p.view_count || 0) * 0.6 + (p.like_count || 0) * 0.4 }))
            .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0));
        } else if (activeTab === 'popular') {
          filteredProducts = response.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        } else if (activeTab === 'new') {
          filteredProducts = response.sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        }

        setProducts(filteredProducts.slice(0, 8));
      }
    } catch (error) {
      console.error('Error loading trending products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = (productId: number) => {
    console.log('Adding to wishlist:', productId);
    // Implement wishlist logic
  };

  const calculateAverageRating = (reviews: Array<{ rating: number }>) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round(sum / reviews.length);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <section className={styles.trending}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>Trending mahsulotlar</h2>
          </div>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Trending mahsulotlar yuklanmoqda...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.trending}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <FiTrendingUp className={styles.trendingIcon} />
            <div>
              <h2>Bugun eng ko'p qidirilgan</h2>
              <p>Hozirda eng mashhur mahsulotlar</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${activeTab === 'trending' ? styles.active : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            <FiTrendingUp className={styles.tabIcon} />
            Trending
          </button>
          <button
            className={`${styles.filterTab} ${activeTab === 'popular' ? styles.active : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            <FiEye className={styles.tabIcon} />
            Mashhur
          </button>
          <button
            className={`${styles.filterTab} ${activeTab === 'new' ? styles.active : ''}`}
            onClick={() => setActiveTab('new')}
          >
            ✨ Yangi
          </button>
        </div>

        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {products.map((product, index) => (
            <Link key={product.id} href={`/product/${product.slug}`} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                {index < 3 && (
                  <div className={styles.rankBadge}>
                    #{index + 1}
                  </div>
                )}
                <img
                  src={
                    product.product_image[0]?.url
                      ? (product.product_image[0].url.startsWith('http')
                          ? product.product_image[0].url
                          : `http://127.0.0.1:4001${product.product_image[0].url.replace('/uploads//uploads/', '/uploads/')}`)
                      : '/img/placeholder-product.jpg'
                  }
                  alt={product.title}
                  className={styles.productImage}
                />
                <button
                  className={styles.wishlistBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    addToWishlist(product.id);
                  }}
                >
                  <MdFavoriteBorder className={styles.heartIcon} />
                </button>
                {activeTab === 'trending' && (
                  <div className={styles.trendingBadge}>
                    <FiTrendingUp className={styles.badgeIcon} />
                    Trending
                  </div>
                )}
              </div>

              <div className={styles.productInfo}>
                <div className={styles.shopName}>{product.brand.name}</div>
                <h3 className={styles.productTitle}>{product.title}</h3>

                <div className={styles.rating}>
                  <div className={styles.stars}>
                    {renderStars(calculateAverageRating(product.reviews))}
                  </div>
                  <span className={styles.reviewCount}>
                    ({product.reviews?.length || 0})
                  </span>
                </div>

                <div className={styles.priceContainer}>
                  <span className={styles.currency}>UZS</span>
                  <span className={styles.price}>{Number(product.price).toLocaleString()}</span>
                </div>

                <div className={styles.productStats}>
                  <div className={styles.stat}>
                    <FiEye className={styles.statIcon} />
                    <span>{product.view_count || 0}</span>
                  </div>
                  <div className={styles.stat}>
                    <FiHeart className={styles.statIcon} />
                    <span>{product.like_count || 0}</span>
                  </div>
                  {activeTab === 'trending' && product.trending_score && (
                    <div className={styles.trendingScore}>
                      <FiTrendingUp className={styles.statIcon} />
                      <span>{Math.round(product.trending_score)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View More */}
        <div className={styles.viewMore}>
          <Link href="/trending" className={styles.viewMoreBtn}>
            Barcha trending mahsulotlarni ko'rish
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
