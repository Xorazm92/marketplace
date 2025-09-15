
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiHeart, FiStar, FiShoppingCart, FiEye, FiArrowRight } from 'react-icons/fi';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import styles from './FeaturedProducts.module.scss';
import { getAllProducts } from '../../endpoints/product';
import { useAllProducts } from '../../hooks/products.use';

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
}

const FeaturedProducts: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<'all' | 'top' | 'new'>('all');

  // Use React Query hook
  const { data: allProducts, isLoading } = useAllProducts();

  // Process products when data changes
  useEffect(() => {
    if (allProducts && Array.isArray(allProducts)) {
      let filteredProducts = allProducts;

      if (filter === 'top') {
        filteredProducts = allProducts.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      } else if (filter === 'new') {
        filteredProducts = allProducts.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
      }

      setProducts(filteredProducts.slice(0, 12));
    }
  }, [allProducts, filter]);

  const addToWishlist = async (productId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId })
      });

      if (response.ok) {
        // Update UI to show added to wishlist
        console.log('Added to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });

      if (response.ok) {
        // Update UI to show added to cart
        console.log('Added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const calculateAverageRating = (reviews: Array<{ rating: number }> | undefined) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
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

  if (isLoading) {
    return (
      <section className={styles.featured}>
        <div className={styles.container}>
          <h2>Tavsiya Etiladigan Mahsulotlar</h2>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Mahsulotlar yuklanmoqda...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.featured}>
      <div className={styles.container}>
        {/* Section Header - Modern style */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2>Tavsiya etiladigan mahsulotlar</h2>
            <p className={styles.subtitle}>Sizga yoqishi mumkin bo'lgan maxsus tanlovlar</p>
          </div>
        </div>

        {/* Filter Tabs - Etsy style */}
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Barchasi
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'top' ? styles.active : ''}`}
            onClick={() => setFilter('top')}
          >
            <FiStar className={styles.tabIcon} />
            Eng mashhur
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'new' ? styles.active : ''}`}
            onClick={() => setFilter('new')}
          >
            ✨ Yangi
          </button>
        </div>

        {/* Products Grid - Etsy style */}
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <Link key={product.id} href={`/productdetails/${product.id}`} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                <img
                  src={
                    product.product_image[0]?.url
                      ? (product.product_image[0].url.startsWith('http')
                          ? product.product_image[0].url
                          : `http://127.0.0.1:3001${product.product_image[0].url.replace('/uploads//uploads/', '/uploads/')}`)
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
                {product.view_count > 100 && (
                  <div className={styles.popularBadge}>
                    <FiStar className={styles.badgeIcon} />
                    Mashhur
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

                <div className={styles.productMeta}>
                  <span className={styles.category}>{product.category.name}</span>
                  <div className={styles.stats}>
                    <span className={styles.stat}>
                      <FiEye className={styles.statIcon} />
                      {product.view_count}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View More - Etsy style */}
        <div className={styles.viewMore}>
          <Link href="/categories" className={styles.viewMoreBtn}>
            <span>Barcha mahsulotlarni ko'rish</span>
            <FiArrowRight className={styles.arrowIcon} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
