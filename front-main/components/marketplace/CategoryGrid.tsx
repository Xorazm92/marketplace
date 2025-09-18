import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './CategoryGrid.module.scss';
import { getAllCategories } from '../../endpoints/category';

interface Category {
  id: number;
  name: string;
  icon: string;
  image: string;
  itemCount: number;
  slug: string;
}

// Demo kategoriyalar o'chirildi - real API ma'lumotlari ishlatiladi
const categories: Category[] = [
  // Real kategoriyalar API dan yuklanadi
];

const CategoryGrid: React.FC = () => {
  const [realCategories, setRealCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const response = await getAllCategories();
        if (process.env.NODE_ENV === "development") console.log('Categories API response:', response);

        // Safe processing of categories
        if (response && response.data && Array.isArray(response.data)) {
          const processedCategories = response.data.map((cat: any, index: number) => {
            // Ensure all properties are strings or primitives
            const safeCat = {
              id: cat.id || index + 1,
              name: String(cat.name || cat.title || `Kategoriya ${index + 1}`),
              slug: String(cat.slug || `category-${index + 1}`),
              description: String(cat.description || ''),
              image_url: String(cat.image_url || ''),
              parent_id: cat.parent_id || null,
              is_active: Boolean(cat.is_active !== false),
              sort_order: Number(cat.sort_order || 0),
              createdAt: String(cat.createdAt || new Date().toISOString()),
              updatedAt: String(cat.updatedAt || new Date().toISOString())
            };
            if (process.env.NODE_ENV === "development") console.log('Processed category:', safeCat);
            return safeCat;
          });
          setRealCategories(processedCategories);
        } else {
          setRealCategories([]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        setRealCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const getCategoryIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      'kiyim': '👕',
      'oyinchoq': '🧸',
      'kitob': '📚',
      'sport': '⚽',
      'maktab': '🎒',
      'chaqaloq': '🍼',
      'elektronika': '📱',
      'soglik': '🏥'
    };

    const key = name.toLowerCase();
    return iconMap[key] || '📦';
  };

  return (
    <section className={styles.categorySection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Kategoriyalar</h2>
          <p className={styles.subtitle}>Bolalar uchun barcha kerakli mahsulotlar</p>
        </div>

        <div className={styles.grid}>
          {loading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={styles.categoryCard}>
                <div className={styles.loadingSkeleton}>
                  <div className={styles.skeletonIcon}></div>
                  <div className={styles.skeletonText}></div>
                </div>
              </div>
            ))
          ) : realCategories.length > 0 ? (
            realCategories.map((category) => {
              // Safe category rendering
              const categoryName = typeof category === 'object' ?
                (category.name || category.title || 'Kategoriya') :
                String(category);
              const categorySlug = typeof category === 'object' ?
                (category.slug || category.id || 'category') :
                'category';

              return (
                <Link
                  href={`/category/${categorySlug}`}
                  key={category.id || Math.random()}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryIcon}>{getCategoryIcon(categoryName)}</div>
                  <div className={styles.categoryName}>{categoryName}</div>
                  <div className={styles.categoryCount}>0 mahsulot</div>
                </Link>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📂</div>
              <h3>Kategoriyalar topilmadi</h3>
              <p>Hozircha kategoriyalar mavjud emas.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
