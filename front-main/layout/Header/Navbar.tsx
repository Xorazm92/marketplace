import { useState, useEffect } from "react";
import style from "./Navbar.module.scss";
import Link from "next/link";
import Button from "../../components/Button/Button";
import {
  FaRegEnvelopeOpen,
  FaRegHeart,
  FaRegUser,
  FaChevronDown,
  FaBars,
  FaXmark,
  FaShoppingCart,
} from "react-icons/fa6";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { getLocalStorage } from "../../utils/local-storege";
import { DropDown } from "./components";
import { getCart } from "../../endpoints/cart";

const Navbar = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const token = getLocalStorage("accessToken");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest(`.${style.container}`)) {
        setIsMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 770 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);

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

  return (
    <nav className={style.header}>
      <div className={style.container}>
        <Link href={"/"} className={style.logo}>
          {/* Logo removed */}
        </Link>

        <button
          className={style.menuButton}
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <FaXmark size={24} /> : <FaBars size={24} />}
        </button>

        <div className={`${style.right} ${isMenuOpen ? style.showMenu : ""}`}>
          <div className={style.navigations}>
            <Link
              href={{ pathname: '/Profile', query: { tab: 'Сообщения' } }}
              onClick={closeMenu}
            >
              <div className={style.navItem}>
                <FaRegEnvelopeOpen size={18} />
                <span>Сообщения</span>
              </div>
            </Link>

            <Link
              href={token && isAuthenticated ? "/favorites" : "/login"}
              onClick={closeMenu}
            >
              <div className={style.navItem}>
                <FaRegHeart size={18} />
                <span>Sevimlilar</span>
              </div>
            </Link>

            <Link
              href={token && isAuthenticated ? "/cart" : "/login"}
              onClick={closeMenu}
            >
              <div className={style.navItem}>
                <div className={style.cartIcon}>
                  <FaShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className={style.cartBadge}>{cartCount}</span>
                  )}
                </div>
                <span>Savatcha</span>
              </div>
            </Link>

            <Link
              href={token && isAuthenticated ? isMenuOpen ? "/Profile?tab=Объявления" : "" : "/login"}
              onClick={closeMenu}
            >
              <div className={style.navItem}>
                {!isMenuOpen ?
                  <DropDown />
                  :
                  <>
                    <FaRegUser size={18} />
                    <span>Ваш профиль</span>
                  </>
                }
              </div>
            </Link>
          </div>

          <div className={style.buttonWrapper}>
            <Link
              href={token && isAuthenticated ? "/CreateProduct" : "/login"}
              onClick={closeMenu}
            >
              <Button variant="secondary">Добавить объявление</Button>
            </Link>
          </div>
        </div>

        {isMenuOpen && <div className={style.overlay} onClick={closeMenu} />}
      </div>
    </nav>
  );
};

export default Navbar;
