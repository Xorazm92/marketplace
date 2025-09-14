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
import { ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const token = getLocalStorage("accessToken");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

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
      // Handle search functionality
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <>
      {/* Main Header - Etsy Style */}
      <nav className={style.header}>
        <div className={style.container}>
          {/* Left Side - Logo */}
          <Link href="/" className={style.logo}>
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
                  <Link href="/category/clothing" className={style.categoryItem} onClick={() => setIsCategoriesOpen(false)}>
                    <span>👕</span>
                    <div>
                      <strong>Kiyim-kechak</strong>
                      <small>Bolalar kiyimlari</small>
                    </div>
                  </Link>
                  <Link href="/category/toys" className={style.categoryItem} onClick={() => setIsCategoriesOpen(false)}>
                    <span>🧸</span>
                    <div>
                      <strong>Oyinchoqlar</strong>
                      <small>O'yin va o'qish</small>
                    </div>
                  </Link>
                  <Link href="/category/books" className={style.categoryItem} onClick={() => setIsCategoriesOpen(false)}>
                    <span>📚</span>
                    <div>
                      <strong>Kitoblar</strong>
                      <small>Ta'limiy materiallar</small>
                    </div>
                  </Link>
                  <Link href="/category/sports" className={style.categoryItem} onClick={() => setIsCategoriesOpen(false)}>
                    <span>⚽</span>
                    <div>
                      <strong>Sport</strong>
                      <small>Sport anjomlari</small>
                    </div>
                  </Link>
                  <Link href="/category/school" className={style.categoryItem} onClick={() => setIsCategoriesOpen(false)}>
                    <span>🎒</span>
                    <div>
                      <strong>Maktab</strong>
                      <small>Maktab buyumlari</small>
                    </div>
                  </Link>
                  <Link href="/category/baby" className={style.categoryItem} onClick={() => setIsCategoriesOpen(false)}>
                    <span>🍼</span>
                    <div>
                      <strong>Chaqaloq</strong>
                    <small>Chaqaloq buyumlari</small>
                    </div>
                  </Link>
                  <Link href="/category/electronics" className={style.categoryItem} onClick={() => setIsCategoriesOpen(false)}>
                    <span>📱</span>
                    <div>
                      <strong>Elektronika</strong>
                      <small>Texnologiya</small>
                    </div>
                  </Link>
                  <Link href="/category/health" className={style.categoryItem} onClick={() => setIsCategoriesOpen(false)}>
                    <span>🏥</span>
                    <div>
                      <strong>Sog'lik</strong>
                      <small>Salomatlik</small>
                    </div>
                  </Link>
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
              <div className={style.mobileSearch}>
                <input
                  type="text"
                  placeholder="Qidirish..."
                  className={style.mobileSearchInput}
                />
                <button className={style.mobileSearchButton}>
                  <FaSearch size={16} />
                </button>
              </div>

              <div className={style.mobileCategories}>
                <h4>Kategoriyalar</h4>
                <Link href="/category/clothing" className={style.mobileCategoryLink} onClick={closeMenu}>
                  👕 Kiyim-kechak
                </Link>
                <Link href="/category/toys" className={style.mobileCategoryLink} onClick={closeMenu}>
                  🧸 Oyinchoqlar
                </Link>
                <Link href="/category/books" className={style.mobileCategoryLink} onClick={closeMenu}>
                  📚 Kitoblar
                </Link>
                <Link href="/category/sports" className={style.mobileCategoryLink} onClick={closeMenu}>
                  ⚽ Sport
                </Link>
                <Link href="/category/school" className={style.mobileCategoryLink} onClick={closeMenu}>
                  🎒 Maktab
                </Link>
                <Link href="/category/baby" className={style.mobileCategoryLink} onClick={closeMenu}>
                  🍼 Chaqaloq
                </Link>
                <Link href="/category/electronics" className={style.mobileCategoryLink} onClick={closeMenu}>
                  📱 Elektronika
                </Link>
                <Link href="/category/health" className={style.mobileCategoryLink} onClick={closeMenu}>
                  🏥 Sog'lik
                </Link>
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
                    <Link href="/child-safety" className={style.mobileActionLink}>
                      <ShieldCheck size={20} />
                      Xavfsizlik
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