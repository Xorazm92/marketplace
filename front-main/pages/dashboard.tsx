import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/features/authSlice';
import { toast } from 'react-toastify';
import styles from '../styles/dashboard.module.scss';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalSpent: number;
  favoriteItems: number;
  cartItems: number;
}

interface RecentOrder {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    favoriteItems: 0,
    cartItems: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    fetchDashboardData();
  }, [isAuthenticated, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user stats
      const statsResponse = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent orders
      const ordersResponse = await fetch('/api/orders?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData.orders || []);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    toast.success('Muvaffaqiyatli chiqildi');
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#f39c12';
      case 'processing': return '#3498db';
      case 'shipped': return '#9b59b6';
      case 'delivered': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'Kutilmoqda';
      case 'processing': return 'Tayyorlanmoqda';
      case 'shipped': return 'Yuborildi';
      case 'delivered': return 'Yetkazildi';
      case 'cancelled': return 'Bekor qilindi';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.welcome}>
          <h1>Xush kelibsiz, {(user as any)?.first_name || (user as any)?.name || 'Foydalanuvchi'}!</h1>
          <p>Shaxsiy kabinetingizga xush kelibsiz</p>
        </div>
        <div className={styles.userActions}>
          <button 
            className={styles.profileBtn}
            onClick={() => router.push('/profile')}
          >
            👤 Profil
          </button>
          <button 
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            🚪 Chiqish
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statInfo}>
            <h3>{stats.totalOrders}</h3>
            <p>Jami buyurtmalar</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏳</div>
          <div className={styles.statInfo}>
            <h3>{stats.pendingOrders}</h3>
            <p>Kutilayotgan</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statInfo}>
            <h3>{stats.completedOrders}</h3>
            <p>Bajarilgan</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <h3>{stats.totalSpent.toLocaleString()} so'm</h3>
            <p>Jami xarajat</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>❤️</div>
          <div className={styles.statInfo}>
            <h3>{stats.favoriteItems}</h3>
            <p>Sevimlilar</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🛒</div>
          <div className={styles.statInfo}>
            <h3>{stats.cartItems}</h3>
            <p>Savatcha</p>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Tezkor harakatlar</h2>
        <div className={styles.actionGrid}>
          <button 
            className={styles.actionBtn}
            onClick={() => router.push('/orders')}
          >
            <span className={styles.actionIcon}>📋</span>
            <span>Buyurtmalar</span>
          </button>

          <button 
            className={styles.actionBtn}
            onClick={() => router.push('/favorites')}
          >
            <span className={styles.actionIcon}>❤️</span>
            <span>Sevimlilar</span>
          </button>

          <button 
            className={styles.actionBtn}
            onClick={() => router.push('/cart')}
          >
            <span className={styles.actionIcon}>🛒</span>
            <span>Savatcha</span>
          </button>

          <button 
            className={styles.actionBtn}
            onClick={() => router.push('/profile')}
          >
            <span className={styles.actionIcon}>⚙️</span>
            <span>Sozlamalar</span>
          </button>
        </div>
      </div>

      <div className={styles.recentOrders}>
        <div className={styles.sectionHeader}>
          <h2>So'nggi buyurtmalar</h2>
          <button 
            className={styles.viewAllBtn}
            onClick={() => router.push('/orders')}
          >
            Barchasini ko'rish
          </button>
        </div>

        {recentOrders.length > 0 ? (
          <div className={styles.ordersList}>
            {recentOrders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderInfo}>
                  <div className={styles.orderNumber}>
                    #{order.order_number}
                  </div>
                  <div className={styles.orderDetails}>
                    <span className={styles.itemsCount}>
                      {order.items_count} ta mahsulot
                    </span>
                    <span className={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>
                
                <div className={styles.orderStatus}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                  <div className={styles.orderAmount}>
                    {order.total_amount.toLocaleString()} so'm
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>Buyurtmalar yo'q</h3>
            <p>Hali birorta buyurtma bermagansiz</p>
            <button 
              className={styles.shopBtn}
              onClick={() => router.push('/')}
            >
              Xarid qilishni boshlash
            </button>
          </div>
        )}
      </div>

      {(user as any)?.role === 'parent' && (
        <div className={styles.childSafety}>
          <h2>Bolalar xavfsizligi</h2>
          <div className={styles.safetyFeatures}>
            <div className={styles.safetyCard}>
              <div className={styles.safetyIcon}>🛡️</div>
              <div className={styles.safetyInfo}>
                <h3>Xavfsiz mahsulotlar</h3>
                <p>Barcha mahsulotlar bolalar xavfsizligi bo'yicha tekshirilgan</p>
              </div>
            </div>
            
            <div className={styles.safetyCard}>
              <div className={styles.safetyIcon}>👨‍👩‍👧‍👦</div>
              <div className={styles.safetyInfo}>
                <h3>Ota-ona nazorati</h3>
                <p>Bolalar faoliyatini nazorat qilish imkoniyati</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
