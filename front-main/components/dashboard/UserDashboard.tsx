import React, { useState, useEffect } from 'react';
import { 
  MdDashboard, 
  MdHistory, 
  MdFavorite, 
  MdSettings, 
  MdSecurity, 
  MdNotifications,
  MdAccountCircle,
  MdShoppingCart,
  MdLocalShipping,
  MdPayment,
  MdStar,
  MdEdit,
  MdDownload,
  MdRefresh,
  MdVisibility,
  MdLanguage,
  MdChildCare,
  MdVerifiedUser,
  MdSupport,
  MdExitToApp,
  MdCreditCard,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdCalendarToday,
  MdTrendingUp,
  MdNewReleases,
  MdLocalOffer
} from 'react-icons/md';
import { TrustBadge } from '../common/TrustBadges';
import styles from './UserDashboard.module.scss';

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: Array<{
    id: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
    seller: string;
  }>;
  total: number;
  tracking?: string;
  deliveryDate?: string;
  refundableUntil?: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: string;
  rating: number;
  inStock: boolean;
  addedDate: string;
  priceDropAlert: boolean;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  dateJoined: string;
  verified: boolean;
  parentalControls: {
    enabled: boolean;
    monthlyLimit: number;
    allowedCategories: string[];
    requireApproval: boolean;
  };
  preferences: {
    language: 'uz' | 'ru' | 'en';
    currency: 'UZS' | 'USD' | 'EUR';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisible: boolean;
      showPurchaseHistory: boolean;
      allowRecommendations: boolean;
    };
  };
  addresses: Array<{
    id: string;
    type: 'home' | 'work' | 'other';
    name: string;
    street: string;
    city: string;
    region: string;
    zipCode: string;
    isDefault: boolean;
  }>;
  paymentMethods: Array<{
    id: string;
    type: 'card' | 'paypal' | 'bank';
    name: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
    isDefault: boolean;
  }>;
}

interface UserDashboardProps {
  user: UserProfile;
  orders: Order[];
  wishlist: WishlistItem[];
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
  onViewOrder: (orderId: string) => void;
  onTrackOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onReorderItems: (orderId: string) => void;
  onRemoveFromWishlist: (itemId: string) => void;
  onAddToCart: (itemId: string) => void;
  onTogglePriceAlert: (itemId: string) => void;
  className?: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  orders,
  wishlist,
  onUpdateProfile,
  onLogout,
  onViewOrder,
  onTrackOrder,
  onCancelOrder,
  onReorderItems,
  onRemoveFromWishlist,
  onAddToCart,
  onTogglePriceAlert,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wishlist' | 'profile' | 'settings'>('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(user);

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update profile data when user prop changes
  useEffect(() => {
    setProfileData(user);
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: user.preferences.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace(user.preferences.currency, user.preferences.currency === 'UZS' ? 'so\'m' : user.preferences.currency);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getOrderStatusColor = (status: Order['status']) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
      refunded: '#6b7280'
    };
    return colors[status];
  };

  const getOrderStatusText = (status: Order['status']) => {
    const texts = {
      pending: 'Kutilmoqda',
      processing: 'Qayta ishlanmoqda',
      shipped: 'Jo\'natilgan',
      delivered: 'Yetkazib berilgan',
      cancelled: 'Bekor qilingan',
      refunded: 'Qaytarilgan'
    };
    return texts[status];
  };

  const getOrderStats = () => {
    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const pending = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
    const totalSpent = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);

    return { total, delivered, pending, totalSpent };
  };

  const getRecentOrders = () => {
    return orders
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  const getRecentWishlist = () => {
    return wishlist
      .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
      .slice(0, 6);
  };

  const handleProfileUpdate = () => {
    onUpdateProfile(profileData);
    setEditingProfile(false);
  };

  const navigationItems = [
    { id: 'overview', label: 'Umumiy ko\'rinish', icon: MdDashboard },
    { id: 'orders', label: 'Buyurtmalar', icon: MdHistory, badge: getOrderStats().pending },
    { id: 'wishlist', label: 'Saqlanganlar', icon: MdFavorite, badge: wishlist.length },
    { id: 'profile', label: 'Profil', icon: MdAccountCircle },
    { id: 'settings', label: 'Sozlamalar', icon: MdSettings }
  ];

  const TabNavigation = () => (
    <nav className={styles.navigation}>
      {navigationItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setActiveTab(item.id as any);
            setShowMobileMenu(false);
          }}
          className={`${styles.navItem} ${activeTab === item.id ? styles.navItemActive : ''}`}
        >
          <item.icon className={styles.navIcon} />
          <span className={styles.navLabel}>{item.label}</span>
          {item.badge && item.badge > 0 && (
            <span className={styles.navBadge}>{item.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );

  const OverviewTab = () => {
    const stats = getOrderStats();
    const recentOrders = getRecentOrders();
    const recentWishlist = getRecentWishlist();

    return (
      <div className={styles.overview}>
        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeContent}>
            <h1 className={styles.welcomeTitle}>
              Xush kelibsiz, {user.firstName}! 👋
            </h1>
            <p className={styles.welcomeText}>
              Sizning shaxsiy kabinetingiz - bu buyurtmalarni kuzatish, sevimli mahsulotlarni saqlash va profilingizni boshqarish uchun markaziy joy.
            </p>
          </div>
          <div className={styles.userBadges}>
            {user.verified && (
              <TrustBadge type="parent-approved" size="md" showText={true} />
            )}
            <div className={styles.memberSince}>
              <MdCalendarToday />
              <span>A'zo: {formatDate(user.dateJoined)}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <MdShoppingCart />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.total}</div>
              <div className={styles.statLabel}>Jami buyurtmalar</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <MdLocalShipping />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.delivered}</div>
              <div className={styles.statLabel}>Yetkazib berilgan</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <MdFavorite />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{wishlist.length}</div>
              <div className={styles.statLabel}>Saqlanganlar</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <MdTrendingUp />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{formatPrice(stats.totalSpent)}</div>
              <div className={styles.statLabel}>Jami sarflangan</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.recentActivity}>
          <div className={styles.activitySection}>
            <div className={styles.sectionHeader}>
              <h3>So'nggi buyurtmalar</h3>
              <button 
                onClick={() => setActiveTab('orders')}
                className={styles.viewAllBtn}
              >
                Barchasini ko'rish
              </button>
            </div>
            <div className={styles.ordersList}>
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className={styles.orderItem}>
                    <div className={styles.orderInfo}>
                      <div className={styles.orderNumber}>#{order.orderNumber}</div>
                      <div className={styles.orderDate}>{formatDate(order.date)}</div>
                    </div>
                    <div 
                      className={styles.orderStatus}
                      style={{ backgroundColor: getOrderStatusColor(order.status) }}
                    >
                      {getOrderStatusText(order.status)}
                    </div>
                    <div className={styles.orderTotal}>{formatPrice(order.total)}</div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <MdShoppingCart className={styles.emptyIcon} />
                  <p>Hali buyurtmalar yo'q</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles.activitySection}>
            <div className={styles.sectionHeader}>
              <h3>So'nggi saqlanganlar</h3>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={styles.viewAllBtn}
              >
                Barchasini ko'rish
              </button>
            </div>
            <div className={styles.wishlistGrid}>
              {recentWishlist.length > 0 ? (
                recentWishlist.map((item) => (
                  <div key={item.id} className={styles.wishlistItem}>
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className={styles.wishlistImage}
                    />
                    <div className={styles.wishlistInfo}>
                      <h4 className={styles.wishlistTitle}>{item.title}</h4>
                      <div className={styles.wishlistPrice}>
                        {formatPrice(item.price)}
                        {item.originalPrice && (
                          <span className={styles.originalPrice}>
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onAddToCart(item.id)}
                        className={styles.addToCartBtn}
                        disabled={!item.inStock}
                      >
                        {item.inStock ? 'Savatchaga' : 'Tugagan'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <MdFavorite className={styles.emptyIcon} />
                  <p>Saqlanganlar ro'yxati bo'sh</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <h3>Tezkor amallar</h3>
          <div className={styles.actionGrid}>
            <button className={styles.actionCard}>
              <MdNewReleases />
              <span>Yangi mahsulotlar</span>
            </button>
            <button className={styles.actionCard}>
              <MdLocalOffer />
              <span>Chegirmalar</span>
            </button>
            <button className={styles.actionCard}>
              <MdSupport />
              <span>Yordam</span>
            </button>
            <button className={styles.actionCard}>
              <MdCreditCard />
              <span>To'lov usullari</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const OrdersTab = () => (
    <div className={styles.ordersTab}>
      <div className={styles.tabHeader}>
        <h2>Buyurtmalar tarixi</h2>
        <div className={styles.orderFilters}>
          <select className={styles.filterSelect}>
            <option value="all">Barcha buyurtmalar</option>
            <option value="pending">Kutilayotgan</option>
            <option value="processing">Qayta ishlanayotgan</option>
            <option value="shipped">Jo'natilgan</option>
            <option value="delivered">Yetkazib berilgan</option>
            <option value="cancelled">Bekor qilingan</option>
          </select>
          <button className={styles.refreshBtn}>
            <MdRefresh />
          </button>
        </div>
      </div>

      <div className={styles.ordersList}>
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderMeta}>
                  <h4>Buyurtma #{order.orderNumber}</h4>
                  <span className={styles.orderDate}>{formatDate(order.date)}</span>
                </div>
                <div 
                  className={styles.orderStatus}
                  style={{ backgroundColor: getOrderStatusColor(order.status) }}
                >
                  {getOrderStatusText(order.status)}
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.orderItemCard}>
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemInfo}>
                      <h5>{item.title}</h5>
                      <p>Sotuvchi: {item.seller}</p>
                      <p>Miqdor: {item.quantity}</p>
                    </div>
                    <div className={styles.itemPrice}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.orderTotal}>
                  Jami: {formatPrice(order.total)}
                </div>
                <div className={styles.orderActions}>
                  <button 
                    onClick={() => onViewOrder(order.id)}
                    className={styles.actionBtn}
                  >
                    <MdVisibility />
                    Ko'rish
                  </button>
                  {order.tracking && (
                    <button 
                      onClick={() => onTrackOrder(order.id)}
                      className={styles.actionBtn}
                    >
                      <MdLocalShipping />
                      Kuzatish
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button 
                      onClick={() => onReorderItems(order.id)}
                      className={styles.actionBtn}
                    >
                      <MdRefresh />
                      Qayta buyurtma
                    </button>
                  )}
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <button 
                      onClick={() => onCancelOrder(order.id)}
                      className={styles.actionBtnDanger}
                    >
                      <MdExitToApp />
                      Bekor qilish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <MdHistory className={styles.emptyIcon} />
            <h3>Buyurtmalar topilmadi</h3>
            <p>Hali birorta buyurtma bermagansiz. Xarid qilishni boshlang!</p>
          </div>
        )}
      </div>
    </div>
  );

  const WishlistTab = () => (
    <div className={styles.wishlistTab}>
      <div className={styles.tabHeader}>
        <h2>Saqlanganlar ({wishlist.length})</h2>
        <div className={styles.wishlistActions}>
          <button className={styles.sortBtn}>
            Saralash: Sana bo'yicha
          </button>
        </div>
      </div>

      <div className={styles.wishlistGrid}>
        {wishlist.length > 0 ? (
          wishlist.map((item) => (
            <div key={item.id} className={styles.wishlistCard}>
              <div className={styles.wishlistImageContainer}>
                <img 
                  src={item.image} 
                  alt={item.title}
                  className={styles.wishlistImage}
                />
                <button
                  onClick={() => onRemoveFromWishlist(item.id)}
                  className={styles.removeBtn}
                >
                  ✕
                </button>
                {!item.inStock && (
                  <div className={styles.outOfStock}>Tugagan</div>
                )}
              </div>

              <div className={styles.wishlistContent}>
                <h4 className={styles.wishlistTitle}>{item.title}</h4>
                <p className={styles.wishlistSeller}>Sotuvchi: {item.seller}</p>
                
                <div className={styles.wishlistRating}>
                  {[...Array(5)].map((_, i) => (
                    <MdStar
                      key={i}
                      className={i < Math.floor(item.rating) ? styles.starFilled : styles.starEmpty}
                    />
                  ))}
                  <span>({item.rating})</span>
                </div>

                <div className={styles.wishlistPricing}>
                  <div className={styles.currentPrice}>
                    {formatPrice(item.price)}
                  </div>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <div className={styles.originalPrice}>
                      {formatPrice(item.originalPrice)}
                    </div>
                  )}
                </div>

                <div className={styles.wishlistMeta}>
                  <span>Qo'shilgan: {formatDate(item.addedDate)}</span>
                  <label className={styles.priceAlertToggle}>
                    <input
                      type="checkbox"
                      checked={item.priceDropAlert}
                      onChange={() => onTogglePriceAlert(item.id)}
                    />
                    <span>Narx tushganda xabar ber</span>
                  </label>
                </div>

                <button
                  onClick={() => onAddToCart(item.id)}
                  className={styles.addToCartBtn}
                  disabled={!item.inStock}
                >
                  {item.inStock ? 'Savatchaga qo\'shish' : 'Tugagan'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <MdFavorite className={styles.emptyIcon} />
            <h3>Saqlanganlar ro'yxati bo'sh</h3>
            <p>Mahsulotlarni saqlash uchun ♥ belgisini bosing</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`${styles.dashboard} ${className}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className={styles.mobileHeader}>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={styles.menuToggle}
          >
            ☰
          </button>
          <h1>Shaxsiy kabinet</h1>
          <button onClick={onLogout} className={styles.logoutBtn}>
            <MdExitToApp />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${showMobileMenu ? styles.sidebarOpen : ''}`}>
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            {user.avatar ? (
              <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
            ) : (
              <MdAccountCircle />
            )}
          </div>
          <div className={styles.userInfo}>
            <h3>{user.firstName} {user.lastName}</h3>
            <p>{user.email}</p>
            {user.verified && (
              <div className={styles.verifiedBadge}>
                <MdVerifiedUser />
                Tasdiqlangan
              </div>
            )}
          </div>
        </div>

        <TabNavigation />

        {!isMobile && (
          <button onClick={onLogout} className={styles.logoutBtn}>
            <MdExitToApp />
            Chiqish
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'wishlist' && <WishlistTab />}
        {/* Profile and Settings tabs would be implemented similarly */}
      </main>

      {/* Mobile Menu Overlay */}
      {isMobile && showMobileMenu && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;