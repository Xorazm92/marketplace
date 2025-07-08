import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../../components/marketplace/Header';
import ProductImageGallery from '../../components/product/ProductImageGallery';
import ProductInfo from '../../components/product/ProductInfo';
import ProductTabs from '../../components/product/ProductTabs';
import RelatedProducts from '../../components/product/RelatedProducts';
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
    '/img/products/colored-pencils-1.jpg',
    '/img/products/colored-pencils-2.jpg',
    '/img/products/colored-pencils-3.jpg',
    '/img/products/colored-pencils-4.jpg'
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
      <Head>
        <title>{product.title} - INBOLA</title>
        <meta name="description" content={product.description} />
      </Head>
      
      <Header />
      
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
