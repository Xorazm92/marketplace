import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './HeroSection.module.scss';
import { InputSearchIcon } from '../../public/icons/profile/src/InputSearchIcon';

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
    { name: 'Toys', icon: '🧸', color: '#FF6B6B' },
    { name: 'Clothing', icon: '👕', color: '#4ECDC4' },
    { name: 'Books', icon: '📚', color: '#45B7D1' },
    { name: 'Sports', icon: '⚽', color: '#FFA726' },
    { name: 'Electronics', icon: '📱', color: '#9CCC65' },
    { name: 'Baby', icon: '🍼', color: '#FFD54F' }
  ];

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={styles.heroText}>
          <h1>Welcome to INBOLA Kids Marketplace</h1>
          <p>Safe, fun, and educational shopping for children and families</p>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchContainer}>
              <InputSearchIcon />
              <input
                type="text"
                placeholder="Search for toys, books, clothing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </div>
          </form>

          <div className={styles.quickActions}>
            <button 
              className={styles.actionButton}
              onClick={() => router.push('/categories')}
            >
              Browse Categories
            </button>
            <button 
              className={styles.actionButton}
              onClick={() => router.push('/CreateProduct')}
            >
              Sell Products
            </button>
          </div>
        </div>

        <div className={styles.heroImage}>
          <img src="/img/hero-kids.jpg" alt="Kids playing with toys" />
        </div>
      </div>

      <div className={styles.featuredCategories}>
        <h2>Popular Categories</h2>
        <div className={styles.categoriesGrid}>
          {featuredCategories.map((category) => (
            <div
              key={category.name}
              className={styles.categoryCard}
              style={{ backgroundColor: category.color }}
              onClick={() => router.push(`/category/${category.name.toLowerCase()}`)}
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
          <h3>Safe & Secure</h3>
          <p>All transactions are encrypted and secure</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>👨‍👩‍👧‍👦</div>
          <h3>Family-Friendly</h3>
          <p>Content approved for children of all ages</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>📚</div>
          <h3>Educational</h3>
          <p>Learn while shopping with fun activities</p>
        </div>
        <div className={styles.feature}>
          <div className={styles.featureIcon}>🚚</div>
          <h3>Fast Delivery</h3>
          <p>Quick and reliable shipping to your door</p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;