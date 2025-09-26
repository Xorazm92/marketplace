import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  FiUser, 
  FiMapPin, 
  FiShoppingBag, 
  FiCreditCard, 
  FiHeart, 
  FiBell, 
  FiBarChart3,
  FiShield,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiHome
} from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import styles from './ProfileLayout.module.scss';

interface ProfileLayoutProps {
  children: React.ReactNode;
  title?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  isActive?: boolean;
}

const ProfileLayout: React.FC<ProfileLayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    orders: 2,
    wishlist: 5,
    messages: 3
  });

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <MdDashboard />,
      href: '/profile',
      isActive: router.pathname === '/profile'
    },
    {
      id: 'personal',
      label: 'Shaxsiy ma\'lumotlar',
      icon: <FiUser />,
      href: '/profile/personal',
      isActive: router.pathname === '/profile/personal'
    },
    {
      id: 'addresses',
      label: 'Manzillar',
      icon: <FiMapPin />,
      href: '/profile/addresses',
      isActive: router.pathname === '/profile/addresses'
    },
    {
      id: 'orders',
      label: 'Buyurtmalar',
      icon: <FiShoppingBag />,
      href: '/profile/orders',
      badge: notifications.orders,
      isActive: router.pathname.startsWith('/profile/orders')
    },
    {
      id: 'payments',
      label: 'To\'lov usullari',
      icon: <FiCreditCard />,
      href: '/profile/payments',
      isActive: router.pathname === '/profile/payments'
    },
    {
      id: 'wishlist',
      label: 'Sevimlilar',
      icon: <FiHeart />,
      href: '/profile/wishlist',
      badge: notifications.wishlist,
      isActive: router.pathname === '/profile/wishlist'
    },
    {
      id: 'notifications',
      label: 'Bildirishnomalar',
      icon: <FiBell />,
      href: '/profile/notifications',
      badge: notifications.messages,
      isActive: router.pathname === '/profile/notifications'
    },
    {
      id: 'analytics',
      label: 'Harajatlar',
      icon: <FiBarChart3 />,
      href: '/profile/analytics',
      isActive: router.pathname === '/profile/analytics'
    },
    {
      id: 'security',
      label: 'Xavfsizlik',
      icon: <FiShield />,
      href: '/profile/security',
      isActive: router.pathname === '/profile/security'
    },
    {
      id: 'settings',
      label: 'Sozlamalar',
      icon: <FiSettings />,
      href: '/profile/settings',
      isActive: router.pathname === '/profile/settings'
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Muvaffaqiyatli chiqildi', 'success');
      router.push('/');
    } catch (error) {
      addToast('Chiqishda xatolik yuz berdi', 'error');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  return (
    <div className={styles.profileLayout}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <button 
          className={styles.menuToggle}
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
        
        <h1 className={styles.mobileTitle}>
          {title || 'Profil'}
        </h1>

        <Link href="/" className={styles.homeButton}>
          <FiHome />
        </Link>
      </div>

      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className={styles.userDetails}>
                <h3>{user?.name || 'Foydalanuvchi'}</h3>
                <p>{user?.email}</p>
              </div>
            </div>
          </div>

          <nav className={styles.navigation}>
            <ul className={styles.menuList}>
              {menuItems.map((item) => (
                <li key={item.id} className={styles.menuItem}>
                  <Link 
                    href={item.href}
                    className={`${styles.menuLink} ${item.isActive ? styles.active : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <span className={styles.menuIcon}>{item.icon}</span>
                    <span className={styles.menuLabel}>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className={styles.badge}>{item.badge}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.logoutSection}>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
              >
                <FiLogOut />
                <span>Chiqish</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.contentHeader}>
            <div className={styles.breadcrumbs}>
              <Link href="/">Bosh sahifa</Link>
              <span>/</span>
              <Link href="/profile">Profil</Link>
              {title && title !== 'Dashboard' && (
                <>
                  <span>/</span>
                  <span>{title}</span>
                </>
              )}
            </div>
          </div>

          <div className={styles.content}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={closeMobileMenu}
        />
      )}
    </div>
  );
};

export default ProfileLayout;
