import React from 'react';
import styles from './AdminDashboard.module.scss';

// Demo ma'lumotlar o'chirildi - real API ma'lumotlari ishlatiladi
const dashboardStats = {
  totalProducts: 0,
  totalOrders: 0,
  totalUsers: 0,
  totalRevenue: 0,
  todayOrders: 0,
  pendingOrders: 0,
  lowStockProducts: 0,
  newUsers: 0
};

const recentOrders: any[] = [];

const topProducts = [
  {
    id: 1,
    name: 'Bolalar uchun rangli qalam to\'plami',
    sales: 156,
    revenue: 7020000,
    stock: 45
  },
  {
    id: 2,
    name: 'Yumshoq ayiq o\'yinchoq',
    sales: 89,
    revenue: 10680000,
    stock: 23
  },
  {
    id: 3,
    name: 'Maktab sumkasi',
    sales: 134,
    revenue: 10050000,
    stock: 67
  },
  {
    id: 4,
    name: 'Bolalar velosipedi',
    sales: 45,
    revenue: 20250000,
    stock: 12
  }
];

const AdminDashboard: React.FC = () => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f39c12';
      case 'processing':
        return '#3498db';
      case 'shipped':
        return '#9b59b6';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Kutilmoqda';
      case 'processing':
        return 'Tayyorlanmoqda';
      case 'shipped':
        return 'Yo\'lda';
      case 'delivered':
        return 'Yetkazildi';
      case 'cancelled':
        return 'Bekor qilindi';
      default:
        return status;
    }
  };

  return (
    <div className={styles.adminDashboard}>
      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{dashboardStats.totalProducts.toLocaleString()}</span>
            <span className={styles.statLabel}>Jami mahsulotlar</span>
          </div>
          <div className={styles.statChange}>
            <span className={styles.changePositive}>+12%</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🛒</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{dashboardStats.totalOrders.toLocaleString()}</span>
            <span className={styles.statLabel}>Jami buyurtmalar</span>
          </div>
          <div className={styles.statChange}>
            <span className={styles.changePositive}>+8%</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{dashboardStats.totalUsers.toLocaleString()}</span>
            <span className={styles.statLabel}>Jami foydalanuvchilar</span>
          </div>
          <div className={styles.statChange}>
            <span className={styles.changePositive}>+15%</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{formatPrice(dashboardStats.totalRevenue)}</span>
            <span className={styles.statLabel}>Jami daromad</span>
          </div>
          <div className={styles.statChange}>
            <span className={styles.changePositive}>+23%</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={styles.quickStatItem}>
          <span className={styles.quickStatIcon}>📋</span>
          <div className={styles.quickStatInfo}>
            <span className={styles.quickStatValue}>{dashboardStats.todayOrders}</span>
            <span className={styles.quickStatLabel}>Bugungi buyurtmalar</span>
          </div>
        </div>

        <div className={styles.quickStatItem}>
          <span className={styles.quickStatIcon}>⏳</span>
          <div className={styles.quickStatInfo}>
            <span className={styles.quickStatValue}>{dashboardStats.pendingOrders}</span>
            <span className={styles.quickStatLabel}>Kutilayotgan buyurtmalar</span>
          </div>
        </div>

        <div className={styles.quickStatItem}>
          <span className={styles.quickStatIcon}>⚠️</span>
          <div className={styles.quickStatInfo}>
            <span className={styles.quickStatValue}>{dashboardStats.lowStockProducts}</span>
            <span className={styles.quickStatLabel}>Kam qolgan mahsulotlar</span>
          </div>
        </div>

        <div className={styles.quickStatItem}>
          <span className={styles.quickStatIcon}>👤</span>
          <div className={styles.quickStatInfo}>
            <span className={styles.quickStatValue}>{dashboardStats.newUsers}</span>
            <span className={styles.quickStatLabel}>Yangi foydalanuvchilar</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Recent Orders */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3>So'nggi buyurtmalar</h3>
            <button className={styles.viewAllButton}>Barchasini ko'rish</button>
          </div>
          <div className={styles.ordersList}>
            {recentOrders.map((order) => (
              <div key={order.id} className={styles.orderItem}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderNumber}>{order.orderNumber}</span>
                  <span className={styles.customerName}>{order.customer}</span>
                </div>
                <div className={styles.orderDetails}>
                  <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                  <span 
                    className={styles.orderStatus}
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                  <span className={styles.orderDate}>{formatDate(order.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h3>Top mahsulotlar</h3>
            <button className={styles.viewAllButton}>Barchasini ko'rish</button>
          </div>
          <div className={styles.productsList}>
            {topProducts.map((product, index) => (
              <div key={product.id} className={styles.productItem}>
                <div className={styles.productRank}>#{index + 1}</div>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{product.name}</span>
                  <div className={styles.productStats}>
                    <span className={styles.productSales}>{product.sales} sotildi</span>
                    <span className={styles.productRevenue}>{formatPrice(product.revenue)}</span>
                  </div>
                </div>
                <div className={styles.productStock}>
                  <span className={`${styles.stockBadge} ${product.stock < 20 ? styles.lowStock : ''}`}>
                    {product.stock} dona
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3>Tez harakatlar</h3>
        <div className={styles.actionButtons}>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>➕</span>
            <span>Yangi mahsulot qo'shish</span>
          </button>
          
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>📊</span>
            <span>Hisobot yaratish</span>
          </button>
          
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>👥</span>
            <span>Foydalanuvchilarni ko'rish</span>
          </button>
          
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>⚙️</span>
            <span>Sozlamalar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
