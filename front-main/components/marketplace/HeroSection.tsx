import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './HeroSection.module.scss';

const HeroSection: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const featuredCategories = [
    { name: "O'yinchoqlar", icon: '🧸', color: '#FF6B6B', slug: 'oyinchoqlar' },
    { name: 'Kiyim-kechak', icon: '👕', color: '#4ECDC4', slug: 'kiyim-kechak' },
    { name: 'Kitoblar', icon: '📚', color: '#45B7D1', slug: 'kitoblar' },
    { name: 'Sport', icon: '⚽', color: '#FFA726', slug: 'sport' },
    { name: 'Elektronika', icon: '📱', color: '#9CCC65', slug: 'elektronika' },
    { name: 'Chaqaloq', icon: '🍼', color: '#FFD54F', slug: 'chaqaloq' }
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1>INBOLA Bolalar Bozoriga Xush Kelibsiz</h1>
          <p>Bolalar va oilalar uchun xavfsiz, qiziqarli va ta'limli xaridlar</p>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Bolalar uchun o'yinchoq, kitob, kiyim qidiring..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Qidirish
              </button>
            </div>
          </form>

          <div className={styles.quickActions}>
            <button
              className={styles.actionButton}
              onClick={() => router.push('/categories')}
            >
              Kategoriyalarni Ko'rish
            </button>
            <button
              className={styles.actionButton}
              onClick={() => router.push('/CreateProduct')}
            >
              Mahsulot Sotish
            </button>
          </div>
        </div>

        <div className={styles.heroImage}>
          <img src="/img/hero-kids.jpg" alt="Kids playing with toys" />
        </div>
      </div>

      <div className={styles.featuredCategories}>
        <h2>Mashhur Kategoriyalar</h2>
        <div className={styles.categoriesGrid}>
          {featuredCategories.map((category) => (
            <div
              key={category.name}
              className={styles.categoryCard}
              style={{ backgroundColor: category.color }}
              onClick={() => router.push(`/category/${category.slug}`)}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              <span className={styles.categoryName}>{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔒</div>
          <h3>Xavfsiz va Ishonchli</h3>
          <p>Barcha to'lovlar shifrlangan va xavfsiz</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>👨‍👩‍👧‍👦</div>
          <h3>Oila Uchun Qulay</h3>
          <p>Barcha yoshdagi bolalar uchun tasdiqlangan kontent</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📚</div>
          <h3>Ta'limli</h3>
          <p>Qiziqarli faoliyatlar bilan o'rganish va xarid qilish</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🚚</div>
          <h3>Tez Yetkazib Berish</h3>
          <p>Uyingizgacha tez va ishonchli yetkazib berish</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;