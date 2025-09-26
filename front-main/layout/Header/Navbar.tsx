import { useState, useEffect } from "react";
import style from "./Navbar.module.scss";
import Link from "next/link";
import {
  FaRegHeart,
  FaRegUser,
  FaBars,
  FaTimes,
  FaShoppingCart,
  FaSearch,
  FaGift,
  FaRegUserCircle,
  FaChevronDown,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { getLocalStorage } from "../../utils/local-storege";
import { DropDown } from "./components";
import { getCart } from "../../endpoints/cart";
import { getRootCategories } from "../../endpoints/category";

// Helper functions for category icons and descriptions
const getCategoryIcon = (slug: string): string => {
  const icons: Record<string, string> = {
    'clothing': '👕',
    'kiyim-kechak': '👕',
    'toys': '🧸',
    'oyinchoqlar': '🧸',
    'books': '📚',
    'kitoblar': '📚',
    'sports': '⚽',
    'sport': '⚽',
    'school': '🎒',
    'maktab': '🎒',
    'baby': '🍼',
    'chaqaloq': '🍼',
    'electronics': '📱',
    'elektronika': '📱',
    'health': '🏥',
    'soglik': '🏥',
  };
  return icons[slug.toLowerCase()] || '📦';
};

const getCategoryDescription = (slug: string): string => {
  const descriptions: Record<string, string> = {
    'clothing': 'Bolalar kiyimlari',
    'kiyim-kechak': 'Bolalar kiyimlari',
    'toys': "O'yin va o'qish",
    'oyinchoqlar': "O'yin va o'qish",
    'books': "Ta'limiy materiallar",
    'kitoblar': "Ta'limiy materiallar",
    'sports': 'Sport anjomlari',
    'sport': 'Sport anjomlari',
    'school': 'Maktab buyumlari',
    'maktab': 'Maktab buyumlari',
    'baby': 'Chaqaloq buyumlari',
    'chaqaloq': 'Chaqaloq buyumlari',
    'electronics': 'Texnologiya',
    'elektronika': 'Texnologiya',
    'health': 'Salomatlik',
    'soglik': 'Salomatlik',
  };
  return descriptions[slug.toLowerCase()] || 'Mahsulotlar';
};

const Navbar = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const token = getLocalStorage("accessToken");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest(`.${style.container}`)) {
        setIsMenuOpen(false);
      }
      if (isCategoriesOpen && !target.closest(`.${style.categoriesSection}`)) {
        setIsCategoriesOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsCategoriesOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 1024 && isMenuOpen) {
        setIsMenuOpen(false);
      }
      if (window.innerWidth <= 768) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen, isCategoriesOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Load root categories only for navbar
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getRootCategories();
        setCategories(categoriesData || []);
        console.log('🏷️ Root categories loaded:', categoriesData);
      } catch (error) {
        console.error("Error loading root categories:", error);
        // Fallback to static categories (only main categories)
        setCategories([
          { id: 1, name: 'Kiyim-kechak', slug: 'clothing', parent_id: null },
          { id: 2, name: "O'yinchoqlar", slug: 'toys', parent_id: null },
          { id: 3, name: 'Kitoblar', slug: 'books', parent_id: null },
          { id: 4, name: 'Sport anjomlar', slug: 'sports', parent_id: null },
          { id: 5, name: 'Maktab buyumlari', slug: 'school', parent_id: null },
          { id: 6, name: 'Chaqaloq buyumlari', slug: 'baby', parent_id: null },
        ]);
      }
    };

    loadCategories();
  }, []);

  // Load cart count
  useEffect(() => {
    const loadCartCount = async () => {
      if (token && isAuthenticated) {
        try {
          const cartData = await getCart();
          setCartCount(cartData.total_items || 0);
        } catch (error) {
          console.error("Error loading cart count:", error);
        }
      }
    };

    loadCartCount();

    // Listen for storage events to update cart count
    const handleStorageChange = () => {
      loadCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [token, isAuthenticated]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(mobileSearchQuery.trim())}`;
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      {/* Main Header - Etsy Style */}
      <nav className={style.header}>
        <div className={style.container}>
          {/* Left Side - Logo */}
          <Link href="/" className={style.logo}>
            <img src="/logo.png" alt="INBOLA" className={style.logoImage} />
            <h1 className={style.logoText}>INBOLA</h1>
          </Link>

          {/* Categories Button - Etsy Style */}
          <div className={style.categoriesSection}>
            <button 
              className={style.categoriesButton}
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
            >
              <FaBars size={16} />
              <span>Kategoriyalar</span>
              <FaChevronDown size={12} />
            </button>
            
            {/* Categories Dropdown */}
            {isCategoriesOpen && (
              <div className={style.categoriesDropdown}>
                <div className={style.categoriesList}>
                  {categories.map((category) => (
                    <Link 
                      key={category.id} 
                      href={`/category/${category.slug || category.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || ''}`} 
                      className={style.categoryItem} 
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      <span>{getCategoryIcon(category.slug || category.name)}</span>
                      <div>
                        <strong>{category.name}</strong>
                        <small>{getCategoryDescription(category.slug || category.name)}</small>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center - Search Bar */}
          <div className={style.searchSection}>
            <form onSubmit={handleSearch} className={style.searchForm}>
              <div className={style.searchContainer}>
                <input
                  type="text"
                  placeholder="Har qanday narsani qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={style.searchInput}
                />
                <button type="submit" className={style.searchButton}>
                  <FaSearch size={16} />
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - User Actions */}
          <div className={style.userActions}>
            {!isAuthenticated ? (
              <Link href="/login" className={style.signInLink}>
                Kirish
              </Link>
            ) : (
              <div className={style.userMenu}>
                <DropDown />
              </div>
            )}

            <Link href="/favorites" className={style.iconLink} title="Sevimlilar">
              <FaRegHeart size={20} />
            </Link>

            <Link href="/gifts" className={style.iconLink} title="Sovg'alar">
              <FaGift size={20} />
            </Link>

            <Link href="/cart" className={style.iconLink} title="Savatcha">
              <div className={style.cartContainer}>
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className={style.cartBadge}>{cartCount}</span>
                )}
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={style.mobileMenuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menu"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </nav>



      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className={style.mobileMenuOverlay} onClick={closeMenu}>
          <div className={style.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <div className={style.mobileMenuHeader}>
              <h3>Menu</h3>
              <button onClick={closeMenu} className={style.closeButton}>
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className={style.mobileMenuContent}>
              <form onSubmit={handleMobileSearch} className={style.mobileSearch}>
                <input
                  type="text"
                  placeholder="Qidirish..."
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  className={style.mobileSearchInput}
                />
                <button type="submit" className={style.mobileSearchButton}>
                  <FaSearch size={16} />
                </button>
              </form>

              <div className={style.mobileCategories}>
                <h4>Kategoriyalar</h4>
                {categories.map((category) => (
                  <Link 
                    key={category.id} 
                    href={`/category/${category.slug || category.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || ''}`} 
                    className={style.mobileCategoryLink} 
                    onClick={closeMenu}
                  >
                    {getCategoryIcon(category.slug || category.name)} {category.name}
                  </Link>
                ))}
              </div>

              <div className={style.mobileActions}>
                {!isAuthenticated ? (
                  <Link href="/login" className={style.mobileActionLink}>
                    <FaRegUserCircle size={20} />
                    Kirish
                  </Link>
                ) : (
                  <>
                    <Link href="/profile" className={style.mobileActionLink}>
                      <FaRegUser size={20} />
                      Profil
                    </Link>
                    <Link href="/favorites" className={style.mobileActionLink}>
                      <FaRegHeart size={20} />
                      Sevimlilar
                    </Link>
                                         <Link href="/cart" className={style.mobileActionLink}>
                       <FaShoppingCart size={20} />
                       Savatcha ({cartCount})
                     </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
