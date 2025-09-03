import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import ProductInfo from '../../components/product/ProductInfo';
import ProductTabs from '../../components/product/ProductTabs';
import RelatedProducts from '../../components/product/RelatedProducts';
import SEO from '../../components/common/SEO';
import styles from '../../styles/ProductDetail.module.scss';
import { searchProducts, getAllProducts } from '../../endpoints/product';

// Helper to map backend product to the UI structure used by this page
const mapBackendToPageProduct = (p: any) => {
  const images = (p.product_image?.map((img: any) => img?.url) || p.images || [])
    .map((val: string) => {
      if (!val) return '/img/placeholder-product.jpg';
      if (val.startsWith('http')) return val;
      if (val.startsWith('/uploads/')) return val;
      if (!val.startsWith('/')) return `/uploads/${val}`;
      return '/img/placeholder-product.jpg';
    });
  return {
    id: p.id,
    title: p.title,
    price: Number(p.price) || 0,
    originalPrice: p.original_price || undefined,
    discount: undefined,
    rating: p.rating || 4.5,
    reviewCount: p.review_count || 0,
    inStock: p.is_active !== false,
    stockCount: p.stock || 10,
    sku: p.sku || `INB-${p.id}`,
    brand: p.brand?.name || p.brand || '—',
    category: p.category?.name || p.category || '—',
    description: p.description || '',
    features: p.features || [],
    specifications: p.specifications || {},
    images: images.length ? images : ['/img/placeholder-product.jpg'],
    reviews: [],
  };
};

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load real product by slug using search API
  useEffect(() => {
    const load = async () => {
      if (!slug || Array.isArray(slug)) { setLoading(false); return; }
      setLoading(true);
      const decoded = decodeURIComponent(slug).replace(/-/g, ' ');
      try {
        // 1) Try backend search endpoint
        const res = await searchProducts({ search: decoded, limit: 1 });
        const item = Array.isArray(res) ? res[0] : (res?.data?.[0] || null);
        if (item) {
          setProduct(mapBackendToPageProduct(item));
          setLoading(false);
          return;
        }

        // 2) Fallback: fetch all approved products and match by slugified title
        const all = await getAllProducts();
        const toSlug = (s: string) =>
          (s || '')
            .toString()
            .trim()
            .toLowerCase()
            .replace(/['’`]/g, '')
            .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, '')
            .replace(/\s+/g, '-');
        const match = (Array.isArray(all) ? all : []).find((p: any) => toSlug(p.title) === slug);
        if (match) {
          setProduct(mapBackendToPageProduct(match));
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.error('Product load error', e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  // SEO structured data
  const structuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description,
    "image": product.images[0],
    "url": `https://inbola.uz/product/${slug}`,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "UZS",
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "INBOLA Kids Marketplace"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount
    },
    "review": (product.reviews || []).map((review: any) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.userName
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 5
      },
      "reviewBody": review.comment,
      "datePublished": review.date
    }))
  } : undefined;

  const handleAddToCart = () => {
    // Cart ga qo'shish logikasi
    if (!product) return;
    console.log('Adding to cart:', { productId: product.id, quantity });
  };

  const handleAddToWishlist = () => {
    // Wishlist ga qo'shish logikasi
    if (!product) return;
    console.log('Adding to wishlist:', product.id);
  };

  const handleBuyNow = () => {
    // Darhol sotib olish logikasi
    if (!product) return;
    console.log('Buy now:', { productId: product.id, quantity });
  };

  return (
    <>
      {loading && (
        <main className={styles.productDetail}>
          <div className={styles.container}>
            <div style={{ padding: 24 }}>Yuklanmoqda...</div>
          </div>
        </main>
      )}

      {!loading && !product && (
        <main className={styles.productDetail}>
          <div className={styles.container}>
            <div style={{ padding: 24 }}>Mahsulot topilmadi</div>
          </div>
        </main>
      )}
      {product && (
        <SEO 
          title={`${product.title} - INBOLA Kids Marketplace`}
          description={`${product.description} Narxi: ${Number(product.price).toLocaleString()} so'm. ${product.brand} brendi. ${product.category} kategoriyasi. Tez yetkazib berish.`}
          keywords={`${product.title}, ${product.brand}, ${product.category}, bolalar uchun, xavfsiz mahsulotlar, tez yetkazib berish, o'zbekiston`}
          image={product.images[0]}
          type="product"
          structuredData={structuredData}
        />
      )}
      
      {!loading && product && (
      <main className={styles.productDetail}>
        <div className={styles.container}>
          {product && (
            <div className={styles.productSection}>
              <div className={styles.imageSection}>
                <ProductImageGallery 
                  images={product.images}
                  selectedImage={selectedImage}
                  onImageSelect={setSelectedImage}
                  productTitle={product.title}
                />
              </div>
              
              <div className={styles.infoSection}>
                <ProductInfo 
                  product={product}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onBuyNow={handleBuyNow}
                />
              </div>
            </div>
          )}
          
          {product && (
            <div className={styles.tabsSection}>
              <ProductTabs 
                description={product.description}
                features={product.features}
                specifications={product.specifications}
                reviews={product.reviews}
              />
            </div>
          )}
          
          {product && (
            <div className={styles.relatedSection}>
              <RelatedProducts categoryId={1} currentProductId={product.id} />
            </div>
          )}
        </div>
      </main>
      )}
    </>
  );
};

export default ProductDetailPage;
