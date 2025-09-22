import React, { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
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
import { getProductById } from '../../endpoints/product';
import { Product } from '../../types/product';
import {
  validateProduct,
  getProductName,
  getBrandName,
  formatProductPrice,
  calculateAverageRating,
  getProductImage
} from '../../utils/productValidation';
import styles from '../../styles/ProductDetail.module.scss';

interface ProductDetailPageProps {
  product: Product | null;
  error?: string;
}

const ProductDetailPage: NextPage<ProductDetailPageProps> = ({ product: initialProduct, error }) => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Client-side fallback if SSR fails
  useEffect(() => {
    if (!product && id && !loading) {
      loadProduct();
    }
  }, [id, product, loading]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productId = parseInt(id as string);
      
      if (isNaN(productId)) {
        toast.error('Noto\'g\'ri mahsulot ID');
        router.push('/products');
        return;
      }

      const response = await getProductById(productId);
      
      if (response.success && response.data) {
        const validation = validateProduct(response.data);
        if (validation.isValid) {
          setProduct(response.data);
        } else {
          console.warn('Product validation failed:', validation.errors);
          toast.error('Mahsulot ma\'lumotlari noto\'g\'ri');
          router.push('/products');
        }
      } else {
        toast.error('Mahsulot topilmadi');
        router.push('/products');
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      toast.error('Mahsulotni yuklashda xatolik');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;
    
    // Add to local storage cart for now
    const cartItem = {
      id: product.id,
      title: getProductName(product),
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      image: getProductImage(product),
      quantity: quantity
    };
    
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);
    
    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    toast.success('Mahsulot savatga qo\'shildi!');
  };

  const toggleFavoriteStatus = () => {
    if (!product) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFav = favorites.includes(product.id);
    
    if (isFav) {
      const newFavorites = favorites.filter((fav: number) => fav !== product.id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
      toast.success('Sevimlilardan olib tashlandi');
    } else {
      favorites.push(product.id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success('Sevimlilarga qo\'shildi');
    }
  };

  const shareProduct = () => {
    if (navigator.share && product) {
      navigator.share({
        title: getProductName(product),
        text: product.description || 'INBOLA dan ajoyib mahsulot',
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link nusxalandi!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Mahsulot yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <FiAlertCircle className={styles.errorIcon} />
          <h2>Mahsulot topilmadi</h2>
          <p>{error || 'Kechirasiz, bu mahsulot mavjud emas yoki o\'chirilgan.'}</p>
          <Link href="/products" className={styles.backBtn}>
            <FiArrowLeft />
            Mahsulotlarga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const productName = getProductName(product);
  const brandName = getBrandName(product);
  const formattedPrice = formatProductPrice(product);
  const averageRating = calculateAverageRating(product.reviews);
  const reviewCount = product.reviews?.length || 0;

  // Get product images
  const productImages = [];
  if (product.product_image && Array.isArray(product.product_image)) {
    productImages.push(...product.product_image.map(img => getProductImage({ product_image: [img] })));
  } else if (product.images && Array.isArray(product.images)) {
    productImages.push(...product.images.map(img => getProductImage({ images: [img] })));
  }
  
  if (productImages.length === 0) {
    productImages.push('/images/placeholder-product.png');
  }

  return (
    <>
      <Head>
        <title>{productName} - INBOLA</title>
        <meta name="description" content={product.description || `${productName} - INBOLA dan xavfsiz va sifatli mahsulot`} />
        <meta property="og:title" content={productName} />
        <meta property="og:description" content={product.description || 'INBOLA dan xavfsiz va sifatli mahsulot'} />
        <meta property="og:image" content={productImages[0]} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.id}`} />
      </Head>

      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Bosh sahifa</Link>
          <span>/</span>
          <Link href="/products">Mahsulotlar</Link>
          <span>/</span>
          <span>{productName}</span>
        </nav>

        {/* Back Button */}
        <button onClick={() => router.back()} className={styles.backButton}>
          <FiArrowLeft />
          Orqaga
        </button>

        <div className={styles.productDetail}>
          {/* Product Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <ProductImage
                product={product}
                alt={productName}
                width={500}
                height={500}
                className={styles.productImage}
                priority
              />
              
              {/* Image Actions */}
              <div className={styles.imageActions}>
                <button 
                  onClick={toggleFavoriteStatus}
                  className={`${styles.actionBtn} ${isFavorite ? styles.favorited : ''}`}
                  aria-label="Sevimlilar"
                >
                  {isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
                </button>
                <button 
                  onClick={shareProduct}
                  className={styles.actionBtn}
                  aria-label="Ulashish"
                >
                  <FiShare2 />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className={styles.thumbnails}>
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`${styles.thumbnail} ${index === selectedImageIndex ? styles.active : ''}`}
                  >
                    <SafeImage
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      width={80}
                      height={80}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className={styles.productInfo}>
            <div className={styles.header}>
              <div className={styles.brand}>{brandName}</div>
              <h1 className={styles.title}>{productName}</h1>
              
              {/* Rating */}
              <div className={styles.rating}>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <FiStar
                      key={star}
                      className={star <= averageRating ? styles.starFilled : styles.starEmpty}
                    />
                  ))}
                </div>
                <span className={styles.reviewCount}>({reviewCount} ta sharh)</span>
              </div>
            </div>

            {/* Price */}
            <div className={styles.priceSection}>
              <div className={styles.currentPrice}>
                <span className={styles.currency}>{product.currency?.symbol || 'UZS'}</span>
                <span className={styles.price}>{formattedPrice}</span>
              </div>
              {product.negotiable && (
                <div className={styles.negotiable}>
                  <span>Narx kelishiladi</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className={styles.description}>
                <h3>Tavsif</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Product Details */}
            <div className={styles.details}>
              <h3>Mahsulot haqida</h3>
              <div className={styles.detailsList}>
                {product.condition && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Holati:</span>
                    <span className={styles.value}>{product.condition === 'new' ? 'Yangi' : 'Ishlatilgan'}</span>
                  </div>
                )}
                {product.material && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Material:</span>
                    <span className={styles.value}>{product.material}</span>
                  </div>
                )}
                {product.age_range && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Yosh oralig'i:</span>
                    <span className={styles.value}>{product.age_range}</span>
                  </div>
                )}
                {product.color && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Rang:</span>
                    <span className={styles.value}>{product.color}</span>
                  </div>
                )}
                {product.size && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>O'lcham:</span>
                    <span className={styles.value}>{product.size}</span>
                  </div>
                )}
                {product.category?.name && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Kategoriya:</span>
                    <span className={styles.value}>{product.category.name}</span>
                  </div>
                )}
                {product.weight && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Og'irlik:</span>
                    <span className={styles.value}>{product.weight} kg</span>
                  </div>
                )}
                {product.safety_info && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>Xavfsizlik:</span>
                    <span className={styles.value}>{product.safety_info}</span>
                  </div>
                )}
                {product.createdAt && (
                  <div className={styles.detailItem}>
                    <span className={styles.label}>E'lon sanasi:</span>
                    <span className={styles.value}>
                      {new Date(product.createdAt).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <div className={styles.quantitySection}>
                <label>Miqdor:</label>
                <div className={styles.quantityControls}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className={styles.quantityBtn}
                  >
                    -
                  </button>
                  <span className={styles.quantity}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className={styles.quantityBtn}
                  >
                    +
                  </button>
                </div>
              </div>

              <button onClick={addToCart} className={styles.addToCartBtn}>
                <FiShoppingCart />
                Savatga qo'shish
              </button>
            </div>

            {/* Contact Info */}
            {product.phone_number && (
              <div className={styles.contactInfo}>
                <h3>Aloqa</h3>
                <div className={styles.contactItem}>
                  <FiPhone className={styles.contactIcon} />
                  <a href={`tel:${product.phone_number}`} className={styles.phoneNumber}>
                    {product.phone_number}
                  </a>
                </div>
              </div>
            )}

            {/* Safety Info */}
            <div className={styles.safetyInfo}>
              <div className={styles.safetyItem}>
                <FiShield className={styles.safetyIcon} />
                <span>Bolalar uchun xavfsiz</span>
              </div>
              <div className={styles.safetyItem}>
                <FiTruck className={styles.safetyIcon} />
                <span>Tez yetkazib berish</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Server-side rendering
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  try {
    const productId = parseInt(id as string);
    
    if (isNaN(productId)) {
      return {
        notFound: true,
      };
    }

    const response = await getProductById(productId);
    
    if (response.success && response.data) {
      const validation = validateProduct(response.data);
      
      if (validation.isValid) {
        return {
          props: {
            product: response.data,
          },
        };
      }
    }
    
    return {
      notFound: true,
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        product: null,
        error: 'Mahsulotni yuklashda xatolik yuz berdi',
      },
    };
  }
};

export default ProductDetailPage;
