import React from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import styles from './CategoryShowcase.module.scss';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  icon: string;
}

const CategoryShowcase: React.FC = () => {
  const categories: Category[] = [
    {
      id: 1,
      name: "O'yinchoqlar",
      slug: "toys",
      description: "Ta'limiy va qiziqarli o'yinchoqlar",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      productCount: 150,
      icon: "🧸"
    },
    {
      id: 2,
      name: "Kitoblar",
      slug: "books", 
      description: "Bolalar uchun ta'limiy kitoblar",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      productCount: 89,
      icon: "📚"
    },
    {
      id: 3,
      name: "Kiyim-kechak",
      slug: "clothing",
      description: "Zamonaviy va qulay kiyimlar",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop",
      productCount: 120,
      icon: "👕"
    },
    {
      id: 4,
      name: "Sport anjomlar",
      slug: "sports",
      description: "Faol hayot uchun sport anjomlari",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      productCount: 75,
      icon: "⚽"
    },
    {
      id: 5,
      name: "Maktab buyumlari",
      slug: "school",
      description: "Ta'lim uchun zarur buyumlar",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      productCount: 95,
      icon: "🎒"
    },
    {
      id: 6,
      name: "Elektronika",
      slug: "electronics",
      description: "Bolalar uchun xavfsiz elektronika",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
      productCount: 45,
      icon: "📱"
    }
  ];

  return (
    <section className={styles.categoryShowcase}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Kategoriyalar bo'yicha xarid qiling</h2>
          <p>Har bir yosh uchun maxsus tanlov</p>
        </div>

        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className={styles.categoryCard}
            >
              <div className={styles.categoryImage}>
                <img 
                  src={category.image} 
                  alt={category.name}
                  loading="lazy"
                />
                <div className={styles.categoryOverlay}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                </div>
              </div>
              
              <div className={styles.categoryInfo}>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
                <div className={styles.categoryMeta}>
                  <span className={styles.productCount}>
                    {category.productCount} mahsulot
                  </span>
                  <FiArrowRight className={styles.arrowIcon} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className={styles.viewAllCategories}>
          <Link href="/categories" className={styles.viewAllBtn}>
            Barcha kategoriyalarni ko'rish
            <FiArrowRight className={styles.btnIcon} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
