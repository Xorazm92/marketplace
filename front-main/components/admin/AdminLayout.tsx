import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './AdminLayout.module.scss';

type AdminTab = 'dashboard' | 'products' | 'approval' | 'categories' | 'brands' | 'orders' | 'users' | 'analytics' | 'settings';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
}

interface AdminLayoutProps {
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  adminUser?: AdminUser;
  children: React.ReactNode;
}

const menuItems = [
  {
    id: 'dashboard' as AdminTab,
    label: 'Boshqaruv paneli',
    icon: '🏠',
    description: 'Umumiy ko\'rinish va statistika'
  },
  {
    id: 'products' as AdminTab,
    label: 'Mahsulotlar',
    icon: '📦',
    description: 'Bolalar mahsulotlari boshqaruvi'
  },
  {
    id: 'approval' as AdminTab,
    label: 'Tasdiqlash',
    icon: '✅',
    description: 'Mahsulotlarni tasdiqlash va rad etish'
  },
  {
    id: 'categories' as AdminTab,
    label: 'Kategoriyalar',
    icon: '📂',
    description: 'Kategoriya va subkategoriya boshqaruvi'
  },
  {
    id: 'brands' as AdminTab,
    label: 'Brendlar',
    icon: '🏷️',
    description: 'Brend va ishlab chiqaruvchilar'
  },
  {
    id: 'orders' as AdminTab,
    label: 'Buyurtmalar',
    icon: '🛒',
    description: 'Buyurtmalar va yetkazib berish'
  },
  {
    id: 'users' as AdminTab,
    label: 'Foydalanuvchilar',
    icon: '👥',
    description: 'Mijozlar va sotuvchilar'
  },
  {
    id: 'analytics' as AdminTab,
    label: 'Hisobotlar',
    icon: '📊',
    description: 'Hisobotlar va statistika'
  },
  {
    id: 'settings' as AdminTab,
    label: 'Sozlamalar',
    icon: '⚙️',
    description: 'Tizim sozlamalari'
  }
];

const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab = 'dashboard',
  onTabChange = () => {},
  adminUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@inbola.uz',
    role: 'Administrator',
    avatar: null
  },
  children
}) => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Tab o'zgarganda URL'ni yangilash
  const handleTabChange = (tab: AdminTab) => {
    onTabChange(tab);
    // URL'ni yangilash (agar kerak bo'lsa)
    if (router.pathname === '/admin') {
      router.push(`/admin?tab=${tab}`, undefined, { shallow: true });
    }
  };

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar - Etsy Style */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🧸</span>
            {!sidebarCollapsed && <span className={styles.logoText}>INBOLA Admin</span>}
          </div>
          <button
            className={styles.collapseButton}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '☰' : '✕'}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
              onClick={() => handleTabChange(item.id)}
              title={sidebarCollapsed ? item.label : ''}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {!sidebarCollapsed && (
                <div className={styles.navContent}>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.navDescription}>{item.description}</span>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.backToSite}>
            <span className={styles.backIcon}>🌐</span>
            {!sidebarCollapsed && <span>Saytga qaytish</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Top Header - Etsy Style */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <div className={styles.breadcrumb}>
              <span>Admin</span>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span>{menuItems.find(item => item.id === activeTab)?.label}</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            {/* Search */}
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Qidirish..."
                className={styles.searchInput}
              />
            </div>

            {/* Notifications */}
            <button className={styles.notificationButton}>
              <span className={styles.notificationIcon}>🔔</span>
              <span className={styles.notificationBadge}>3</span>
            </button>

            {/* User Menu */}
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.userAvatar}>
                  {adminUser?.avatar ? (
                    <img src={adminUser.avatar} alt={adminUser.name} />
                  ) : (
                    <span className={styles.avatarPlaceholder}>
                      {adminUser?.name?.charAt(0) || 'A'}
                    </span>
                  )}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{adminUser?.name || 'Admin'}</span>
                  <span className={styles.userRole}>{adminUser?.role || 'Administrator'}</span>
                </div>
              </button>

              {showUserMenu && (
                <div className={styles.userDropdown}>
                  <Link href="/admin/profile" className={styles.dropdownItem}>
                    <span className={styles.dropdownIcon}>👤</span>
                    Profil
                  </Link>
                  <Link href="/admin/settings" className={styles.dropdownItem}>
                    <span className={styles.dropdownIcon}>⚙️</span>
                    Sozlamalar
                  </Link>
                  <div className={styles.dropdownDivider}></div>
                  <button className={styles.dropdownItem}>
                    <span className={styles.dropdownIcon}>🚪</span>
                    Chiqish
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
