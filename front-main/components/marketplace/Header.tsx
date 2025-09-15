import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiUser, FiShoppingCart, FiHeart, FiMenu, FiX, FiGift, FiStar } from 'react-icons/fi';
import { BiCategory } from 'react-icons/bi';
import { MdChildCare, MdFavorite } from 'react-icons/md';
import styles from './Header.module.scss';
import { getAllCategories } from '../../endpoints/category';
import { getCart } from '../../endpoints/cart';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const loadCartCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const cartData = await getCart();
        setCartItemsCount(cartData?.total_items || 0);
      } else {
        // Agar login qilmagan bo'lsa, cart count 0
        setCartItemsCount(0);
      }
    } catch (error) {
      console.error('Error loading cart count:', error);
      // Xatolik bo'lsa ham cart count 0 qo'yamiz
      setCartItemsCount(0);
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
    loadCartCount();
  }, []);

  // Reload cart count when user logs in/out
  useEffect(() => {
    const handleStorageChange = () => {
      loadCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Click outside to close categories dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(`.${styles.categoriesDropdown}`)) {
        setIsCategoriesOpen(false);
      }
    };

    if (isCategoriesOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isCategoriesOpen]);

  return (
    <header className={styles.header}>
      {/* Top Banner - Etsy style */}
      <div className={styles.topBanner}>
        <div className={styles.container}>
          <div className={styles.bannerContent}>
            <span className={styles.bannerText}>
              <FiGift className={styles.bannerIcon} />
              Bolalar uchun xavfsiz va ta'limiy mahsulotlar
            </span>
            <Link href="/safety" className={styles.bannerLink}>
              Xavfsizlik haqida
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={styles.mainHeader}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            {/* Logo - Etsy style */}
            <Link href="/" className={styles.logo}>
              <MdChildCare className={styles.logoIcon} />
              <span className={styles.logoText}>INBOLA</span>
            </Link>

            {/* Categories Button - Etsy style */}
            <div className={styles.categoriesDropdown}>
              <button
                className={styles.categoriesButton}
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              >
                <BiCategory className={styles.categoriesIcon} />
                <span>Kategoriyalar</span>
              </button>

              {isCategoriesOpen && (
                <div className={styles.categoriesMenu}>
                  <div className={styles.categoriesGrid}>
                    {categories.map((category, index) => {
                      // Safe category rendering
                      const categoryName = typeof category === 'object' ?
                        (category.name || category.title || 'Kategoriya') :
                        String(category);
                      const categoryHref = typeof category === 'object' ?
                        (category.href || `/category/${category.slug || category.id || 'category'}`) :
                        '/category/default';
                      const categoryIcon = typeof category === 'object' ?
                        (category.icon || '📦') :
                        '📦';

                      return (
                        <Link
                          key={index}
                          href={categoryHref}
                          className={styles.categoryMenuItem}
                          onClick={() => setIsCategoriesOpen(false)}
                        >
                          <span className={styles.categoryIcon}>{categoryIcon}</span>
                          <span>{categoryName}</span>
                        </Link>
                      );
                    })}
                    <Link
                      href="/deals"
                      className={styles.categoryMenuItem}
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      Chegirmalar
                    </Link>
                    <Link
                      href="/categories"
                      className={`${styles.categoryMenuItem} ${styles.viewAll}`}
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      Barchasini ko'rish →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Search - Etsy style */}
            <div className={styles.searchContainer}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  type="text"
                  placeholder="Bolalar uchun mahsulotlarni qidiring"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <button type="submit" className={styles.searchButton}>
                  <FiSearch className={styles.searchIcon} />
                </button>
              </form>
              {isSearchFocused && (
                <div className={styles.searchSuggestions}>
                  <div className={styles.suggestionItem}>
                    <FiStar className={styles.suggestionIcon} />
                    <span>Mashhur qidiruvlar</span>
                  </div>
                  <div className={styles.suggestionItem}>O'yinchoqlar</div>
                  <div className={styles.suggestionItem}>Kitoblar</div>
                  <div className={styles.suggestionItem}>Kiyim-kechak</div>
                </div>
              )}
            </div>

            {/* Header Actions - Etsy style */}
            <div className={styles.headerActions}>
              <Link href="/login" className={styles.signInLink}>
                Kirish
              </Link>

              <Link href="/wishlist" className={styles.iconLink} title="Sevimlilar">
                <FiHeart className={styles.icon} />
                <span className={styles.iconLabel}>Sevimlilar</span>
              </Link>

              <Link href="/cart" className={styles.iconLink} title="Savatcha">
                <FiShoppingCart className={styles.icon} />
                <span className={styles.iconLabel}>Savatcha</span>
                {cartItemsCount > 0 && (
                  <span className={styles.cartBadge}>{cartItemsCount}</span>
                )}
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
              {categories.map((category, index) => {
                // Safe category rendering for mobile
                const categoryName = typeof category === 'object' ?
                  (category.name || category.title || 'Kategoriya') :
                  String(category);
                const categoryHref = typeof category === 'object' ?
                  (category.href || `/category/${category.slug || category.id || 'category'}`) :
                  '/category/default';
                const categoryIcon = typeof category === 'object' ?
                  (category.icon || '📦') :
                  '📦';

                return (
                  <Link
                    key={index}
                    href={categoryHref}
                    className={styles.mobileNavLink}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className={styles.mobileIcon}>{categoryIcon}</span>
                    <span>{categoryName}</span>
                  </Link>
                );
              })}
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
