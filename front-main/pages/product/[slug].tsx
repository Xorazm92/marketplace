import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import ProductInfo from '../../components/product/ProductInfo';
import ProductTabs from '../../components/product/ProductTabs';
import RelatedProducts from '../../components/product/RelatedProducts';
import SEO from '../../components/common/SEO';
import styles from '../../styles/ProductDetail.module.scss';

// Mock data - bu real loyihada API dan keladi
const mockProduct = {
  id: 1,
  title: 'Bolalar uchun rangli qalam to\'plami',
  price: 45000,
  originalPrice: 60000,
  discount: 25,
  rating: 4.8,
  reviewCount: 124,
  inStock: true,
  stockCount: 15,
  sku: 'CP-001',
  brand: 'Faber-Castell',
  category: 'Maktab buyumlari',
  description: 'Bolalar uchun maxsus ishlab chiqarilgan rangli qalamlar to\'plami. 24 ta turli rangda qalamlar mavjud.',
  features: [
    'Yuqori sifatli rangli qalamlar',
    '24 ta turli rang',
    'Bolalar uchun xavfsiz',
    'Chiroyli qutida',
    'Oson o\'chirish'
  ],
  specifications: {
    'Ranglar soni': '24',
    'Material': 'Yog\'och',
    'Yosh chegarasi': '3+ yosh',
    'Brend': 'Faber-Castell',
    'Ishlab chiqarilgan': 'Germaniya'
  },
  images: [
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
  ],
  reviews: [
    {
      id: 1,
      userName: 'Malika A.',
      rating: 5,
      comment: 'Juda yaxshi qalamlar, bolam juda yoqtirdi!',
      date: '2024-01-15',
      verified: true
    },
    {
      id: 2,
      userName: 'Sardor B.',
      rating: 4,
      comment: 'Sifati yaxshi, lekin narxi biroz qimmat.',
      date: '2024-01-10',
      verified: true
    }
  ]
};

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Real loyihada bu API call bo'ladi
  const product = mockProduct;

  // SEO structured data
  const structuredData = {
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
    "review": product.reviews.map(review => ({
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
  };

  const handleAddToCart = () => {
    // Cart ga qo'shish logikasi
    console.log('Adding to cart:', { productId: product.id, quantity });
  };

  const handleAddToWishlist = () => {
    // Wishlist ga qo'shish logikasi
    console.log('Adding to wishlist:', product.id);
  };

  const handleBuyNow = () => {
    // Darhol sotib olish logikasi
    console.log('Buy now:', { productId: product.id, quantity });
  };

  return (
    <>
      <SEO 
        title={`${product.title} - INBOLA Kids Marketplace`}
        description={`${product.description} Narxi: ${product.price.toLocaleString()} so'm. ${product.brand} brendi. ${product.category} kategoriyasi. Tez yetkazib berish.`}
        keywords={`${product.title}, ${product.brand}, ${product.category}, bolalar uchun, xavfsiz mahsulotlar, tez yetkazib berish, o'zbekiston`}
        image={product.images[0]}
        type="product"
        structuredData={structuredData}
      />
      
      <main className={styles.productDetail}>
        <div className={styles.container}>
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
          
          <div className={styles.tabsSection}>
            <ProductTabs 
              description={product.description}
              features={product.features}
              specifications={product.specifications}
              reviews={product.reviews}
            />
          </div>
          
          <div className={styles.relatedSection}>
            <RelatedProducts categoryId={1} currentProductId={product.id} />
          </div>
        </div>
      </main>
    </>
  );
};

export default ProductDetailPage;
