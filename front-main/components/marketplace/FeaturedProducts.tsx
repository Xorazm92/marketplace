import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiHeart, FiStar, FiShoppingCart, FiEye, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import styles from './FeaturedProducts.module.scss';
import { getAllProducts } from '../../endpoints/product';
import { Product } from '../../types/product';
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

/**
 * ✅ FeaturedProducts Component - Xavfsiz va to'liq validatsiya bilan
 * Barcha xatoliklar va undefined qiymatlar uchun fallback mavjud
 */
const FeaturedProducts: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'top' | 'new'>('all');
  const [displayCount, setDisplayCount] = useState(6);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedProducts();
  }, [filter]);

  // ✅ Xavfsiz mahsulotlarni yuklash funksiyasi
  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Mahsulotlar yuklanmoqda...');
      
      const response = await getAllProducts();
      
      // ✅ API javobini tekshirish
      if (response && Array.isArray(response) && response.length > 0) {
        console.log(`✅ ${response.length} ta mahsulot topildi`);
        
        // ✅ Har bir mahsulotni tekshirish va tozalash
        const validProducts: Product[] = [];
        const invalidProducts: any[] = [];
        
        response.forEach((product: any, index: number) => {
          const validation = validateProduct(product);
          
          if (validation.isValid) {
            validProducts.push(product as Product);
          } else {
            console.warn(`⚠️ Mahsulot ${index + 1} noto'g'ri:`, validation.errors);
            invalidProducts.push({ product, errors: validation.errors });
          }
          
          // Ogohlantirishlarni ko'rsatish
          if (validation.warnings.length > 0) {
            console.warn(`⚠️ Mahsulot ${index + 1} ogohlantirishlari:`, validation.warnings);
          }
        });
        
        if (validProducts.length === 0) {
          console.warn('❌ Hech qanday to\'g\'ri mahsulot topilmadi, demo mahsulotlar ishlatiladi');
          const demoProducts = getDemoProducts();
          setAllProducts(demoProducts);
          setProducts(demoProducts.slice(0, 6));
          return;
        }
        
        // ✅ Filtr va saralash
        let filteredProducts = [...validProducts];

        if (filter === 'top') {
          filteredProducts = filteredProducts.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        } else if (filter === 'new') {
          filteredProducts = filteredProducts.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
        }

        setAllProducts(filteredProducts);
        setProducts(filteredProducts.slice(0, 6));
        
        console.log(`✅ ${filteredProducts.length} ta to'g'ri mahsulot yuklandi`);
        
      } else {
        console.warn('⚠️ API dan mahsulotlar kelmadi, demo mahsulotlar ishlatiladi');
        const demoProducts = getDemoProducts();
        setAllProducts(demoProducts);
        setProducts(demoProducts.slice(0, 6));
      }
    } catch (error: any) {
      console.error('❌ Mahsulotlarni yuklashda xato:', error);
      setError('Mahsulotlarni yuklashda xatolik yuz berdi');
      
      // ✅ Xato holatida demo mahsulotlar ishlatish
      const demoProducts = getDemoProducts();
      setAllProducts(demoProducts);
      setProducts(demoProducts.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xavfsiz wishlist qo'shish
  const addToWishlist = async (productId: number) => {
    try {
      if (!productId || typeof productId !== 'number') {
        console.error('❌ Noto\'g\'ri mahsulot ID:', productId);
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('⚠️ Token topilmadi, login sahifasiga yo\'naltirilmoqda');
        router.push('/login');
        return;
      }

      console.log('💖 Wishlist ga qo\'shilmoqda:', productId);
      
      // API chaqiruvi (hozircha mock)
      // const response = await addToWishlistAPI(productId);
      
      console.log('✅ Wishlist ga qo\'shildi');
    } catch (error: any) {
      console.error('❌ Wishlist ga qo\'shishda xato:', error);
    }
  };

  // ✅ Xavfsiz cart ga qo'shish
  const addToCart = async (productId: number) => {
    try {
      if (!productId || typeof productId !== 'number') {
        console.error('❌ Noto\'g\'ri mahsulot ID:', productId);
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('⚠️ Token topilmadi, login sahifasiga yo\'naltirilmoqda');
        router.push('/login');
        return;
      }

      console.log('🛒 Cart ga qo\'shilmoqda:', productId);
      
      // API chaqiruvi (hozircha mock)
      // const response = await addToCartAPI(productId);
      
      console.log('✅ Cart ga qo\'shildi');
    } catch (error: any) {
      console.error('❌ Cart ga qo\'shishda xato:', error);
    }
  };

  // ✅ Ko'proq mahsulotlar yuklash
  const loadMoreProducts = () => {
    try {
      setLoadingMore(true);
      const newDisplayCount = displayCount + 6;
      setDisplayCount(newDisplayCount);
      
      // Simulate loading delay for better UX
      setTimeout(() => {
        setProducts(allProducts.slice(0, newDisplayCount));
        setLoadingMore(false);
      }, 500);
    } catch (error: any) {
      console.error('❌ Ko\'proq mahsulotlar yuklashda xato:', error);
      setLoadingMore(false);
    }
  };

  // ✅ Yulduzchalar render qilish
  const renderStars = (rating: number) => {
    const stars = [];
    const safeRating = Math.max(0, Math.min(5, rating || 0)); // 0-5 orasida
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= safeRating ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      );
    }
    return stars;
  };

  // ✅ Loading holatini ko'rsatish
  if (loading) {
    return (
      <section className={styles.featured}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Mahsulotlar yuklanmoqda...</p>
          </div>
        </div>
      </section>
    );
  }

  // ✅ Xato holatini ko'rsatish
  if (error && products.length === 0) {
    return (
      <section className={styles.featured}>
        <div className={styles.container}>
          <div className={styles.error}>
            <FiAlertCircle className={styles.errorIcon} />
            <h3>Xatolik yuz berdi</h3>
            <p>{error}</p>
            <button onClick={loadFeaturedProducts} className={styles.retryBtn}>
              Qayta urinish
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.featured}>
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <h2>Tavsiya etilgan mahsulotlar</h2>
          {error && (
            <div className={styles.warningBanner}>
              <FiAlertCircle className={styles.warningIcon} />
              <span>Ba'zi mahsulotlar yuklanmadi, demo ma'lumotlar ko'rsatilmoqda</span>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {products && products.length > 0 ? (
            products.map((product) => {
              // ✅ Har bir mahsulot uchun xavfsizlik tekshiruvi
              if (!product || !product.id) {
                console.warn('⚠️ Noto\'g\'ri mahsulot obyekti:', product);
                return null;
              }

              const validation = validateProduct(product);
              if (!validation.isValid) {
                console.warn('⚠️ Mahsulot validatsiyadan o\'tmadi:', validation.errors);
                return null;
              }

              // ✅ Xavfsiz qiymatlarni olish
              const productName = getProductName(product);
              const brandName = getBrandName(product);
              const productImage = getProductImage(product);
              const formattedPrice = formatProductPrice(product);
              const averageRating = calculateAverageRating(product.reviews);
              const reviewCount = product.reviews?.length || 0;

              return (
                <div key={product.id} className={styles.productCard}>
                  <Link href={`/product/${product.slug || product.id}`} className={styles.productLink}>
                    <div className={styles.productImageContainer}>
                      <img
                        src={productImage}
                        alt={productName}
                        className={styles.productImage}
                        onError={(e) => {
                          // ✅ Rasm yuklanmasa, placeholder ko'rsatish
                          const target = e.target as HTMLImageElement;
                          target.src = '/img/placeholder-product.jpg';
                        }}
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

                      {/* ✅ Qo'shimcha ma'lumotlar */}
                      <div className={styles.productMeta}>
                        <div className={styles.metaItem}>
                          <FiEye className={styles.metaIcon} />
                          <span>{product.view_count || 0}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <FiHeart className={styles.metaIcon} />
                          <span>{product.like_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })
          ) : (
            // ✅ Mahsulotlar yo'q holatini ko'rsatish
            <div className={styles.noProducts}>
              <FiAlertCircle className={styles.noProductsIcon} />
              <h3>Mahsulotlar topilmadi</h3>
              <p>Hozirda ko'rsatish uchun mahsulotlar mavjud emas</p>
              <button onClick={loadFeaturedProducts} className={styles.retryBtn}>
                Qayta yuklash
              </button>
            </div>
          )}
        </div>

        {/* Load More / View All */}
        {products.length > 0 && (
          <div className={styles.viewMore}>
            {products.length < allProducts.length ? (
              <button 
                onClick={loadMoreProducts}
                disabled={loadingMore}
                className={styles.loadMoreBtn}
              >
                {loadingMore ? (
                  <>
                    <div className={styles.miniSpinner}></div>
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    Yanada ko'proq ko'rish ({allProducts.length - products.length} ta qoldi)
                    <FiArrowRight className={styles.arrowIcon} />
                  </>
                )}
              </button>
            ) : (
              <Link href="/products" className={styles.viewMoreBtn}>
                Barcha mahsulotlarni ko'rish
                <FiArrowRight className={styles.arrowIcon} />
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
