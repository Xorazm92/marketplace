
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './FeaturedProducts.module.scss';
import { getAllProducts } from '../../endpoints/product';
import { HeartIcon } from '../../public/icons/profile/src/HeartIcon';

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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'top' | 'new'>('all');

  useEffect(() => {
    loadFeaturedProducts();
  }, [filter]);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts({
        page: 1,
        limit: 12,
        sortBy: filter === 'top' ? 'view_count' : filter === 'new' ? 'createdAt' : undefined,
        sortOrder: 'desc'
      });
      setProducts(response.products);
    } catch (error) {
      console.error('Error loading featured products:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const calculateAverageRating = (reviews: Array<{ rating: number }>) => {
    if (reviews.length === 0) return 0;
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

  if (loading) {
    return (
      <section className={styles.featured}>
        <div className={styles.container}>
          <h2>Featured Products</h2>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.featured}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Featured Products</h2>
          <div className={styles.filters}>
            <button 
              className={filter === 'all' ? styles.active : ''}
              onClick={() => setFilter('all')}
            >
              All Products
            </button>
            <button 
              className={filter === 'top' ? styles.active : ''}
              onClick={() => setFilter('top')}
            >
              Most Popular
            </button>
            <button 
              className={filter === 'new' ? styles.active : ''}
              onClick={() => setFilter('new')}
            >
              Newest
            </button>
          </div>
        </div>

        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <img
                  src={product.product_image[0]?.url || '/img/placeholder-product.jpg'}
                  alt={product.title}
                  onClick={() => router.push(`/product/${product.slug}`)}
                />
                <button 
                  className={styles.wishlistBtn}
                  onClick={() => addToWishlist(product.id)}
                >
                  <HeartIcon />
                </button>
              </div>

              <div className={styles.productInfo}>
                <h3 onClick={() => router.push(`/product/${product.slug}`)}>
                  {product.title}
                </h3>
                <p className={styles.brand}>{product.brand.name}</p>
                <p className={styles.category}>{product.category.name}</p>
                
                <div className={styles.rating}>
                  {renderStars(calculateAverageRating(product.reviews))}
                  <span className={styles.reviewCount}>
                    ({product.reviews.length})
                  </span>
                </div>

                <div className={styles.productFooter}>
                  <div className={styles.price}>${product.price}</div>
                  <button 
                    className={styles.addToCartBtn}
                    onClick={() => addToCart(product.id)}
                  >
                    Add to Cart
                  </button>
                </div>

                <div className={styles.productStats}>
                  <span>👀 {product.view_count}</span>
                  <span>❤️ {product.like_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.viewMore}>
          <button 
            className={styles.viewMoreBtn}
            onClick={() => router.push('/categories')}
          >
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
