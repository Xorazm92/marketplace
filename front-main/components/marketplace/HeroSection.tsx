import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiArrowRight, FiStar, FiShield, FiHeart } from 'react-icons/fi';
import { MdChildCare, MdSecurity } from 'react-icons/md';
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
      {/* Main Hero Banner - Etsy style */}
      <div className={styles.mainBanner}>
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <div className={styles.bannerBadge}>
              <MdChildCare className={styles.badgeIcon} />
              <span>Bolalar uchun xavfsiz</span>
            </div>
            <h1 className={styles.bannerTitle}>
              Bolalar dunyosiga xush kelibsiz
            </h1>
            <p className={styles.bannerSubtitle}>
              Kichik do'konlardan maxsus ta'limiy va xavfsiz mahsulotlar oling
            </p>
            <Link href="/categories" className={styles.bannerCTA}>
              <span>Maxsus tanlovlarni ko'ring</span>
              <FiArrowRight className={styles.ctaIcon} />
            </Link>
          </div>
          <div className={styles.bannerImage}>
            <div className={styles.imageCard}>
              <img
                src="/img/hero-kids.jpg"
                alt="Bolalar mahsulotlari"
                className={styles.heroImage}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzIyNy42MTQgMTUwIDI1MCAyMjcuNjE0IDI1MCAyMDBDMjUwIDE3Mi4zODYgMjI3LjYxNCAxNTAgMjAwIDE1MFoiIGZpbGw9IiNEREREREQiLz4KPHN2Zz4K';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Interests - Etsy style */}
      <div className={styles.featuredSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Qiziqarli kategoriyalarni kashf eting</h2>
          <div className={styles.categoriesGrid}>
            {featuredCategories.map((category, index) => (
              <Link
                key={index}
                href={`/category/${category.slug}`}
                className={styles.categoryCard}
                style={{ '--category-color': category.color } as React.CSSProperties}
              >
                <div className={styles.categoryImage}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                </div>
                <div className={styles.categoryInfo}>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                  <p className={styles.categoryDesc}>Qiziqarli va xavfsiz</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Indicators - Etsy style */}
      <div className={styles.trustSection}>
        <div className={styles.container}>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <MdSecurity className={styles.trustIcon} />
              <div className={styles.trustContent}>
                <h3>Xavfsiz xaridlar</h3>
                <p>Barcha mahsulotlar tekshirilgan</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <FiStar className={styles.trustIcon} />
              <div className={styles.trustContent}>
                <h3>Sifatli mahsulotlar</h3>
                <p>Faqat eng yaxshi brendlar</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <FiHeart className={styles.trustIcon} />
              <div className={styles.trustContent}>
                <h3>Bolalar uchun</h3>
                <p>Maxsus tanlangan mahsulotlar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;