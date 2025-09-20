import React, { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import Head from 'next/head';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiHeart,
  FiShare2,
  FiShoppingCart,
  FiPhone,
  FiMapPin,
  FiClock,
  FiEye,
  FiStar,
  FiShield,
  FiTruck,
  FiMessageCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { MdFavoriteBorder, MdFavorite } from 'react-icons/md';
import { toast } from 'react-toastify';
import SafeImage, { ProductImage } from '../../components/common/SafeImage';
import { getProductById, getProductBySlug } from '../../endpoints/product';
import { Product } from '../../types/product';
import {
  validateProduct,
  getProductName,
  getBrandName,
  formatProductPrice,
  calculateAverageRating
} from '../../utils/productValidation';
import { 
  addProductToCart, 
  addToLocalCart,
  selectCartLoading,
  selectCartItems 
} from '../../store/features/cartSlice';
import { 
  toggleFavorite,
  selectIsFavorite 
} from '../../store/features/favoritesSlice';
import { RootState, AppDispatch } from '../../store/store';
import styles from '../../styles/ProductDetail.module.scss';

interface ProductDetailPageProps {
  product: Product | null;
  error?: string;
}

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ product: initialProduct, error }) => {
  const router = useRouter();
  const { slug } = router.query;
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux selectors
  const cartLoading = useSelector(selectCartLoading);
  const cartItems = useSelector(selectCartItems);
  const isFavorite = useSelector(selectIsFavorite(initialProduct?.id || 0));
  
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct && !error);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // ✅ Client-side data fetching if SSR failed
  useEffect(() => {
    if (!initialProduct && !error && slug) {
      fetchProduct();
    }
  }, [slug, initialProduct, error]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const slugParam = Array.isArray(slug) ? slug[0] : slug as string;
      
      if (!slugParam) {
        router.push('/404');
        return;
      }

      // Try to fetch by slug first, then by ID if it's a number
      let response;
      const isNumeric = /^\d+$/.test(slugParam);
      
      if (isNumeric) {
        const productId = parseInt(slugParam);
        response = await getProductById(productId);
      } else {
        response = await getProductBySlug(slugParam);
      }
      
      if (response?.success && response.data) {
        const validation = validateProduct(response.data);
        if (validation.isValid) {
          setProduct(response.data);
        } else {
          console.warn('⚠️ Product validation failed:', validation.errors);
          setProduct(response.data); // Still show it but with warnings
        }
      } else {
        router.push('/404');
      }
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className={styles.productDetail}>
        <div className={styles.loadingState}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingGrid}>
              <div className={styles.loadingImage}></div>
              <div className={styles.loadingContent}>
                <div className={styles.loadingTitle}></div>
                <div className={styles.loadingPrice}></div>
                <div className={styles.loadingText}></div>
                <div className={styles.loadingText}></div>
                <div className={styles.loadingText}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error || !product) {
    return (
      <div className={styles.productDetail}>
        <div className={styles.errorState}>
          <div className={styles.errorContent}>
            <div className={styles.errorEmoji}>😞</div>
            <h1 className={styles.errorTitle}>Mahsulot topilmadi</h1>
            <p className={styles.errorMessage}>
              {error || "Siz qidirayotgan mahsulot mavjud emas yoki o'chirilgan."}
            </p>
            <div className={styles.errorActions}>
              <button 
                onClick={() => router.back()}
                className="primary"
              >
                <FiArrowLeft className="inline mr-2" />
                Orqaga qaytish
              </button>
              <Link 
                href="/"
                className="secondary"
              >
                Bosh sahifa
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Safe data extraction
  const productName = getProductName(product);
  const brandName = getBrandName(product);
  const formattedPrice = formatProductPrice(product);
  const averageRating = calculateAverageRating(product.reviews || []);
  const reviewCount = product.reviews?.length || 0;

  // ✅ Safe image handling
  const productImages = product.images || [];
  const hasMultipleImages = productImages.length > 1;

  // ✅ Handle favorite toggle
  const handleToggleFavorite = () => {
    if (product) {
      dispatch(toggleFavorite(product));
      toast.success(isFavorite ? 'Sevimlilardan olib tashlandi' : 'Sevimlilarga qo\'shildi');
    }
  };

  // ✅ Handle add to cart
  const handleAddToCart = async () => {
    if (!product) {
      toast.error('Mahsulot ma\'lumotlari topilmadi');
      return;
    }

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        // User is authenticated - use API
        await dispatch(addProductToCart({ 
          productId: product.id, 
          quantity 
        })).unwrap();
        toast.success('Mahsulot savatchaga qo\'shildi!');
      } else {
        // User is not authenticated - use local storage
        dispatch(addToLocalCart({ 
          product, 
          quantity 
        }));
        toast.success('Mahsulot savatchaga qo\'shildi!');
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.error(error.message || 'Savatchaga qo\'shishda xatolik yuz berdi');
    }
  };

  // ✅ Handle buy now
  const handleBuyNow = async () => {
    if (!product) {
      toast.error('Mahsulot ma\'lumotlari topilmadi');
      return;
    }

    try {
      // First add to cart
      await handleAddToCart();
      
      // Then redirect to checkout
      setTimeout(() => {
        router.push('/checkout');
      }, 500);
    } catch (error: any) {
      console.error('Buy now error:', error);
      toast.error('Xarid qilishda xatolik yuz berdi');
    }
  };

  // ✅ Check if product is in cart
  const isInCart = cartItems.some(item => item.product_id === product?.id);
  const cartItemCount = cartItems.find(item => item.product_id === product?.id)?.quantity || 0;

  // ✅ Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          text: `${productName} - INBOLA da ko'ring`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link nusxalandi!');
    }
  };

  // ✅ Render stars
  const renderStars = (rating: number) => {
    const stars = [];
    const safeRating = Math.max(0, Math.min(5, rating || 0));
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= safeRating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <>
      <Head>
        <title>{productName} - INBOLA</title>
        <meta name="description" content={product.description || `${productName} - ${brandName}`} />
        <meta property="og:title" content={productName} />
        <meta property="og:description" content={product.description || ''} />
        <meta property="og:image" content={productImages[0] || '/img/placeholder-product.jpg'} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/product/${product.slug || product.id}`} />
      </Head>

      <div className={styles.productDetail}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <div className={styles.breadcrumbContent}>
            <div className={styles.breadcrumbList}>
              <a href="/">Bosh sahifa</a>
              <span className={styles.separator}>›</span>
              <a href="/categories">Kategoriyalar</a>
              <span className={styles.separator}>›</span>
              <a href={`/category/${product.category?.slug || 'oyinchoqlar'}`}>
                {product.category?.name || "O'yinchoqlar"}
              </a>
              <span className={styles.separator}>›</span>
              <span>{productName}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.container}>
          <div className={styles.productGrid}>
            
            {/* Product Images */}
            <div className={styles.imageSection}>
              {/* Main Image */}
              <div className={styles.mainImage}>
                <ProductImage
                  product={product}
                  imageIndex={currentImageIndex}
                  alt={productName}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              
              {/* Image Thumbnails */}
              {hasMultipleImages && (
                <div className={styles.thumbnails}>
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={currentImageIndex === index ? styles.active : ''}
                    >
                      <ProductImage
                        product={product}
                        imageIndex={index}
                        alt={`${productName} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className={styles.productInfo}>
              {/* Favorite and Cart Count */}
              <div className={styles.favoriteSection}>
                <button 
                  onClick={handleToggleFavorite}
                  className={`${styles.favoriteButton} ${isFavorite ? styles.active : ''}`}
                >
                  {isFavorite ? <MdFavorite size={20} /> : <MdFavoriteBorder size={20} />}
                </button>
                <span className={styles.cartCount}>{cartItemCount > 0 ? `${cartItemCount} ta savatda` : '19 ta savatda'}</span>
              </div>

              {/* Product Title */}
              <h1 className={styles.productTitle}>
                {productName}
              </h1>

              {/* Brand */}
              <div className={styles.brandName}>
                <a href={`/brand/${product.brand?.id || 1}`} className={styles.brandLink}>
                  {brandName}
                </a>
              </div>

              {/* Rating */}
              {reviewCount > 0 && (
                <div className={styles.rating}>
                  <div className={styles.stars}>
                    {renderStars(averageRating)}
                  </div>
                  <span className={styles.reviewText}>
                    ({reviewCount} ta sharh)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className={styles.priceSection}>
                <div className={styles.price}>
                  {formattedPrice} UZS
                </div>
                <div className={styles.priceDetails}>
                  VAT qo'shilgan
                </div>
                {product.negotiable && (
                  <div className={styles.negotiable}>
                    Narx kelishiladi
                  </div>
                )}
              </div>

              {/* Personalization */}
              <div className={styles.personalization}>
                <div className={styles.personalizationTitle}>
                  — Shaxsiylashtirish qo'shish
                </div>
                <div className={styles.personalizationOptions}>
                  <div className={styles.option}>
                    <label>1) Rang tanlovi (1,2,3,4,5)</label>
                    <select>
                      <option>Rang tanlang</option>
                      <option>Qizil</option>
                      <option>Ko'k</option>
                      <option>Yashil</option>
                    </select>
                  </div>
                  <div className={styles.option}>
                    <label>2) Oila a'zolari yoshi</label>
                    <input type="text" placeholder="Yoshlarni kiriting" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={styles.actions}>
                <button 
                  className={styles.addToCartButton}
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                >
                  <FiShoppingCart size={20} />
                  {cartLoading ? 'Qo\'shilmoqda...' : 
                   isInCart ? `Savatchada (${cartItemCount})` : 'Savatga qo\'shish'}
                </button>

                <button 
                  className={`${styles.addToCartButton} ${styles.buyNowButton}`}
                  onClick={handleBuyNow}
                  disabled={cartLoading}
                >
                  💳 Hoziroq sotib olish
                </button>
                
                <div className={styles.secondaryActions}>
                  <button onClick={handleToggleFavorite}>
                    <FiHeart size={16} />
                    {isFavorite ? 'Sevimlilardan olib tashlash' : 'Sevimlilar'}
                  </button>
                  <button onClick={handleShare}>
                    <FiShare2 size={16} />
                    Ulashish
                  </button>
                </div>
              </div>

              {/* Item Details */}
              <div className={styles.itemDetails}>
                <button className={styles.detailsToggle}>
                  Mahsulot haqida ma'lumot
                  <FiAlertCircle size={16} />
                </button>
                <div className={styles.detailsContent}>
                  <div className={styles.highlights}>
                    <div className={styles.highlightTitle}>Xususiyatlari</div>
                    <div className={styles.highlightList}>
                      <div className={styles.highlight}>
                        <FiShield className={styles.icon} />
                        <span>{brandName} tomonidan ishlab chiqarilgan</span>
                      </div>
                      <div className={styles.highlight}>
                        <FiTruck className={styles.icon} />
                        <span>Raqamli yuklab olish</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.description}>
                    <div className={styles.descriptionTitle}>Salom va xush kelibsiz!</div>
                    <div className={styles.descriptionText}>
                      {product.description || "Bu rangli devor posteri sizning oilangiz uchun maxsus buyurtma asosida tayyorlanadi."}
                    </div>
                    <button className={styles.readMore}>
                      Bu mahsulot haqida batafsil ma'lumot
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className={styles.delivery}>
                <button className={styles.deliveryToggle}>
                  Yetkazib berish
                  <FiAlertCircle size={16} />
                </button>
                <div className={styles.deliveryContent}>
                  <div className={styles.deliveryOption}>
                    <FiTruck className={styles.deliveryIcon} />
                    <span>Buyurtmaga moslashtirilgan raqamli yuklab olish</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ✅ Server-side rendering with error handling
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params!;
  
  try {
    // Validate slug
    const slugParam = Array.isArray(slug) ? slug[0] : slug as string;
    
    if (!slugParam) {
      return {
        notFound: true,
      };
    }

    // Try to fetch by slug first, then by ID if it's a number
    let response;
    const isNumeric = /^\d+$/.test(slugParam);
    
    if (isNumeric) {
      const productId = parseInt(slugParam);
      if (isNaN(productId)) {
        return { notFound: true };
      }
      response = await getProductById(productId);
    } else {
      response = await getProductBySlug(slugParam);
    }
    
    if (!response?.success || !response.data) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        product: response.data,
      },
    };
  } catch (error) {
    console.error('❌ SSR Error fetching product:', error);
    
    // Return props with error for client-side handling
    return {
      props: {
        product: null,
        error: 'Mahsulotni yuklashda xatolik yuz berdi',
      },
    };
  }
};

export default ProductDetailPage;
