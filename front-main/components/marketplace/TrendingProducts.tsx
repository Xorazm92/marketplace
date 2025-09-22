import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiTrendingUp, FiHeart, FiShoppingCart, FiEye, FiStar, FiAlertCircle } from 'react-icons/fi';
import { MdFavoriteBorder } from 'react-icons/md';
import styles from './TrendingProducts.module.scss';
import { getProducts } from '../../endpoints/product';
import { Product } from '../../types/product';
import { ProductImage } from '../../components/common/SafeImage';
import { 
  validateProduct, 
  getProductImage, 
  getProductName, 
  getBrandName, 
  formatProductPrice,
  calculateAverageRating,
  getDemoProducts,
  showValidationErrors
} from '../../utils/productValidation';

const TrendingProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'trending' | 'popular' | 'new'>('trending');

  useEffect(() => {
    loadTrendingProducts();
  }, [activeTab]);

  // ✅ Xavfsiz trending mahsulotlarni yuklash
  const loadTrendingProducts = async () => {
    try {
      setLoading(true);
      if (process.env.NODE_ENV === 'development') console.log('🔥 Trending mahsulotlar yuklanmoqda...');
      
      const response = await getProducts();
      
      if (response && Array.isArray(response) && response.length > 0) {
        if (process.env.NODE_ENV === 'development') console.log(`✅ ${response.length} ta mahsulot topildi`);
        
        // ✅ Har bir mahsulotni tekshirish
        const validProducts: Product[] = [];
        
        response.forEach((product: any, index: number) => {
          const validation = validateProduct(product);
          
          if (validation.isValid) {
            validProducts.push(product as Product);
          } else {
            console.warn(`⚠️ Trending mahsulot ${index + 1} noto'g'ri:`, validation.errors);
          }
        });
        
        if (validProducts.length === 0) {
          console.warn('❌ Hech qanday to\'g\'ri trending mahsulot topilmadi, demo ishlatiladi');
          const demoProducts = getDemoProducts();
          setProducts(demoProducts.slice(0, 8));
          return;
        }

        // ✅ Tab asosida saralash
        let filteredProducts = [...validProducts];

        if (activeTab === 'trending') {
          // Trending score hisoblash: view_count * 0.6 + like_count * 0.4
          filteredProducts = filteredProducts
            .map(p => ({ 
              ...p, 
              trending_score: (p.view_count || 0) * 0.6 + (p.like_count || 0) * 0.4 
            }))
            .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0));
        } else if (activeTab === 'popular') {
          filteredProducts = filteredProducts.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        } else if (activeTab === 'new') {
          filteredProducts = filteredProducts.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
        }

        setProducts(filteredProducts.slice(0, 8));
        if (process.env.NODE_ENV === 'development') console.log(`✅ ${filteredProducts.length} ta trending mahsulot yuklandi`);
        
      } else {
        console.warn('⚠️ API dan trending mahsulotlar kelmadi, demo ishlatiladi');
        const demoProducts = getDemoProducts();
        setProducts(demoProducts.slice(0, 8));
      }
    } catch (error: any) {
      console.error('❌ Trending mahsulotlarni yuklashda xato:', error);
      // Xato holatida demo mahsulotlar
      const demoProducts = getDemoProducts();
      setProducts(demoProducts.slice(0, 8));
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = (productId: number) => {
    if (process.env.NODE_ENV === 'development') console.log('Adding to wishlist:', productId);
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
          {products && products.length > 0 ? (
            products.map((product, index) => {
              // ✅ Har bir mahsulot uchun xavfsizlik tekshiruvi
              if (!product || !product.id) {
                console.warn('⚠️ Noto\'g\'ri trending mahsulot obyekti:', product);
                return null;
              }

              const validation = validateProduct(product);
              if (!validation.isValid) {
                console.warn('⚠️ Trending mahsulot validatsiyadan o\'tmadi:', validation.errors);
                return null;
              }

              // ✅ Xavfsiz qiymatlarni olish
              const productName = getProductName(product);
              const brandName = getBrandName(product);
              const productImage = getProductImage(product);
              const formattedPrice = formatProductPrice(product);
              const averageRating = calculateAverageRating(product.reviews || []);
              const reviewCount = product.reviews?.length || 0;

              return (
                <Link key={product.id} href={`/product/${product.slug || product.id}`} className={styles.productCard}>
                  <div className={styles.productImageContainer}>
                    {index < 3 && (
                      <div className={styles.rankBadge}>
                        #{index + 1}
                      </div>
                    )}
                    <ProductImage
                      product={product}
                      alt={productName}
                      width={300}
                      height={300}
                      className={styles.productImage}
                      priority={index < 3} // Prioritize top 3 trending products
                    />
                    <button
                      className={styles.wishlistBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        addToWishlist(product.id);
                      }}
                      aria-label={`${productName} ni sevimlilar ro'yxatiga qo'shish`}
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
                    <div className={styles.shopName}>{brandName}</div>
                    <h3 className={styles.productTitle} title={productName}>
                      {productName}
                    </h3>

                    <div className={styles.rating}>
                      <div className={styles.stars}>
                        {renderStars(averageRating)}
                      </div>
                      <span className={styles.reviewCount}>
                        ({reviewCount})
                      </span>
                    </div>

                    <div className={styles.priceContainer}>
                      <span className={styles.currency}>UZS</span>
                      <span className={styles.price}>{formattedPrice}</span>
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
              );
            })
          ) : (
            // ✅ Mahsulotlar yo'q holatini ko'rsatish
            <div className={styles.noProducts}>
              <FiAlertCircle className={styles.noProductsIcon} />
              <h3>Trending mahsulotlar topilmadi</h3>
              <p>Hozirda trending mahsulotlar mavjud emas</p>
              <button onClick={loadTrendingProducts} className={styles.retryBtn}>
                Qayta yuklash
              </button>
            </div>
          )}
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
