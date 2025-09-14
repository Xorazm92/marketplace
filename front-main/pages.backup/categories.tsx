import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getAllCategories } from '../endpoints/category';
import SEO from '../components/common/SEO';
import styles from '../styles/Categories.module.scss';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryIcons: { [key: string]: { icon: string; color: string } } = {
    'Kiyim-kechak': { icon: '👕', color: '#FF6B6B' },
    "O'yinchoqlar": { icon: '🧸', color: '#4ECDC4' },
    'Kitoblar': { icon: '📚', color: '#45B7D1' },
    'Sport anjomlar': { icon: '⚽', color: '#96CEB4' },
    'Maktab buyumlari': { icon: '📝', color: '#FFEAA7' },
    'Chaqaloq buyumlari': { icon: '🍼', color: '#DDA0DD' },
    'Elektronika': { icon: '📱', color: '#74B9FF' },
    "Sog'liq": { icon: '🏥', color: '#55A3FF' },
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();
      if (response && Array.isArray(response)) {
        setCategories(response);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // SEO structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "INBOLA Kategoriyalar",
    "description": "Bolalar uchun barcha mahsulot kategoriyalari",
    "url": "https://inbola.uz/categories",
    "numberOfItems": categories.length,
    "itemListElement": categories.map((category, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Thing",
        "name": category.name,
        "description": category.description || `${category.name} kategoriyasi`,
        "url": `https://inbola.uz/category/${category.slug}`
      }
    }))
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Kategoriyalar yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Barcha Kategoriyalar - INBOLA Kids Marketplace | Kiyim, o'yinchoqlar, kitoblar"
        description="INBOLA da mavjud barcha mahsulot kategoriyalari: kiyim-kechak, o'yinchoqlar, kitoblar, sport anjomlar, maktab buyumlari va boshqalar. Bolalar uchun xavfsiz va sifatli mahsulotlar."
        keywords="kategoriyalar, kiyim-kechak, o'yinchoqlar, kitoblar, sport anjomlar, maktab buyumlari, chaqaloq buyumlari, elektronika, sog'liq, bolalar uchun, o'zbekiston"
        structuredData={structuredData}
      />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Barcha Kategoriyalar</h1>
          <p>Bolalar uchun eng yaxshi mahsulotlarni toping</p>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((category) => {
            // Safe category rendering
            const categoryName = typeof category === 'object' ?
              (category.name || (category as any).title || 'Kategoriya') :
              String(category);
            const categorySlug = typeof category === 'object' ?
              (category.slug || category.id || 'category') :
              'category';
            const categoryDescription = typeof category === 'object' ?
              (category.description || '') :
              '';

            const categoryInfo = categoryIcons[categoryName] || { icon: '📦', color: '#666' };

            return (
              <Link
                key={category.id || Math.random()}
                href={`/category/${categorySlug}`}
                className={styles.categoryCard}
              >
                <div
                  className={styles.categoryIcon}
                  style={{ backgroundColor: categoryInfo.color }}
                >
                  <span className={styles.icon}>{categoryInfo.icon}</span>
                </div>
                <div className={styles.categoryInfo}>
                  <h3>{categoryName}</h3>
                  {categoryDescription && (
                    <p>{categoryDescription}</p>
                  )}
                </div>
                <div className={styles.arrow}>→</div>
              </Link>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className={styles.emptyState}>
            <h3>Kategoriyalar topilmadi</h3>
            <p>Hozircha hech qanday kategoriya mavjud emas</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CategoriesPage;
