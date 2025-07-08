import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Header.module.scss';
import { getAllCategories } from '../../endpoints/category';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getAllCategories();
        if (response && response.length > 0) {
          const categoryIcons = {
            'Kiyim-kechak': { icon: '👕', color: '#FF6B6B' },
            "O'yinchoqlar": { icon: '🧸', color: '#4ECDC4' },
            'Kitoblar': { icon: '📚', color: '#45B7D1' },
            'Sport': { icon: '⚽', color: '#96CEB4' },
            'Maktab': { icon: '🎒', color: '#FFEAA7' },
            'Chaqaloq': { icon: '🍼', color: '#DDA0DD' },
            'Elektronika': { icon: '📱', color: '#74B9FF' },
            'Sog\'liq': { icon: '🏥', color: '#55A3FF' },
          };

          const categoriesWithIcons = response.map((cat: any) => ({
            ...cat,
            icon: categoryIcons[cat.name as keyof typeof categoryIcons]?.icon || '📦',
            color: categoryIcons[cat.name as keyof typeof categoryIcons]?.color || '#666',
            href: `/category/${cat.slug}`
          }));

          setCategories(categoriesWithIcons);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  return (
    <header className={styles.header}>
      {/* Main Header */}
      <div className={styles.mainHeader}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            {/* Logo - aynan Etsy kabi */}
            <Link href="/" className={styles.logo}>
              INBOLA
            </Link>

            {/* Categories Button - aynan Etsy kabi */}
            <button className={styles.categoriesButton}>
              <span className={styles.hamburgerIcon}>☰</span>
              <span>Categories</span>
            </button>

            {/* Search - aynan Etsy kabi */}
            <div className={styles.searchContainer}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Search for anything"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton}>
                  <span className={styles.searchIcon}>🔍</span>
                </button>
              </form>
            </div>

            {/* Header Actions - aynan Etsy kabi */}
            <div className={styles.headerActions}>
              <Link href="/login" className={styles.signInLink}>
                Sign in
              </Link>

              <Link href="/wishlist" className={styles.iconLink}>
                <span className={styles.icon}>🤍</span>
              </Link>

              <Link href="/gifts" className={styles.iconLink}>
                <span className={styles.icon}>🎁</span>
              </Link>

              <Link href="/cart" className={styles.iconLink}>
                <span className={styles.icon}>🛒</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className={styles.mobileMenuButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <span className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories Navigation - Etsy kabi oddiy */}
      <nav className={styles.categoriesNav}>
        <div className={styles.container}>
          <div className={styles.categoriesList}>
            {categories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className={styles.categoryItem}
              >
                {category.name}
              </Link>
            ))}
            <Link href="/deals" className={styles.categoryItem}>
              Chegirmalar
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={styles.mobileMenuOverlay} onClick={() => setIsMenuOpen(false)}>
          <div className={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileMenuHeader}>
              <h3>Kategoriyalar</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <div className={styles.mobileMenuContent}>
              {categories.map((category, index) => (
                <Link
                  key={index}
                  href={category.href}
                  className={styles.mobileNavLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className={styles.mobileIcon}>{category.icon}</span>
                  <span>{category.name}</span>
                </Link>
              ))}
              <Link
                href="/deals"
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className={styles.mobileIcon}>🔥</span>
                <span>Chegirmalar</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
