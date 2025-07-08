import React from 'react';
import Link from 'next/link';
import styles from './CategoryGrid.module.scss';

interface Category {
  id: number;
  name: string;
  icon: string;
  image: string;
  itemCount: number;
  slug: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: 'Kiyim-kechak',
    icon: '👕',
    image: '/img/categories/clothing.jpg',
    itemCount: 1250,
    slug: 'clothing'
  },
  {
    id: 2,
    name: "O'yinchoqlar",
    icon: '🧸',
    image: '/img/categories/toys.jpg',
    itemCount: 890,
    slug: 'toys'
  },
  {
    id: 3,
    name: 'Kitoblar',
    icon: '📚',
    image: '/img/categories/books.jpg',
    itemCount: 650,
    slug: 'books'
  },
  {
    id: 4,
    name: 'Sport anjomlar',
    icon: '⚽',
    image: '/img/categories/sports.jpg',
    itemCount: 420,
    slug: 'sports'
  },
  {
    id: 5,
    name: 'Maktab buyumlari',
    icon: '🎒',
    image: '/img/categories/school.jpg',
    itemCount: 780,
    slug: 'school'
  },
  {
    id: 6,
    name: 'Chaqaloq buyumlari',
    icon: '🍼',
    image: '/img/categories/baby.jpg',
    itemCount: 560,
    slug: 'baby'
  },
  {
    id: 7,
    name: 'Elektronika',
    icon: '📱',
    image: '/img/categories/electronics.jpg',
    itemCount: 340,
    slug: 'electronics'
  },
  {
    id: 8,
    name: 'Sog\'liq',
    icon: '🏥',
    image: '/img/categories/health.jpg',
    itemCount: 290,
    slug: 'health'
  }
];

const CategoryGrid: React.FC = () => {
  return (
    <section className={styles.categorySection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Kategoriyalar</h2>
          <p className={styles.subtitle}>Bolalar uchun barcha kerakli mahsulotlar</p>
        </div>
        
        <div className={styles.grid}>
          {categories.map((category) => (
            <Link
              href={`/category/${category.slug}`}
              key={category.id}
              className={styles.categoryCard}
            >
              <div className={styles.categoryIcon}>{category.icon}</div>
              <div className={styles.categoryName}>{category.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
