import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from './FeaturedProducts.module.scss';
import { getProducts } from '../../endpoints/product';
import ProductCard from '../products/ProductCard';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category_id: number;
  brand_id: number;
  is_active: boolean;
  is_checked: string;
  slug?: string;
  product_image?: Array<{ id: number; url: string }>;
  brand?: { id: number; name: string };
  category?: { id: number; name: string };
}

const FeaturedProducts: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      console.log('🔄 Mahsulotlar yuklanmoqda...');
      
      const response = await getProducts();
      if (response && response.length > 0) {
        console.log(`✅ ${response.length} ta mahsulot topildi`);
        setProducts(response.slice(0, 6)); // Faqat 6 ta featured mahsulot
        setError(null);
      } else {
        console.log('⚠️ Mahsulotlar topilmadi');
        setProducts([]);
        setError('Mahsulotlar topilmadi');
      }
    } catch (error) {
      console.error('❌ Mahsulotlarni yuklashda xatolik:', error);
      setProducts([]);
      setError('Mahsulotlarni yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.featuredProducts}>
        <div className={styles.container}>
          <h2 className={styles.title}>Tavsiya etilgan mahsulotlar</h2>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Yuklanmoqda...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.featuredProducts}>
        <div className={styles.container}>
          <h2 className={styles.title}>Tavsiya etilgan mahsulotlar</h2>
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={loadFeaturedProducts} className={styles.retryButton}>
              Qayta urinish
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.featuredProducts}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Tavsiya etilgan mahsulotlar</h2>
          <Link href="/products" className={styles.viewAll}>
            Barchasini ko'rish
          </Link>
        </div>

        <div className={styles.productsGrid}>
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
