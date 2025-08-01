import React from 'react';
import styles from './Dashboard.module.scss';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: any[];
  topProducts: any[];
}

interface DashboardProps {
  stats: DashboardStats;
  isLoading: boolean;
  databaseConnected?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, isLoading, databaseConnected = false }) => {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Jami buyurtmalar',
      value: stats.totalOrders,
      icon: '🛒',
      color: '#f16521',
      trend: '+12%',
      description: 'Oxirgi oyda'
    },
    {
      title: 'Jami daromad',
      value: formatCurrency(stats.totalRevenue),
      icon: '💰',
      color: '#00a652',
      trend: '+8%',
      description: 'Oxirgi oyda'
    },
    {
      title: 'Jami mahsulotlar',
      value: stats.totalProducts,
      icon: '📦',
      color: '#e1306c',
      trend: '+5%',
      description: 'Faol mahsulotlar'
    },
    {
      title: 'Jami foydalanuvchilar',
      value: stats.totalUsers,
      icon: '👥',
      color: '#1877f2',
      trend: '+15%',
      description: 'Ro\'yxatdan o\'tgan'
    }
  ];

  return (
    <div className={styles.dashboard}>
      {/* Header with Database Status */}
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Marketplace boshqaruv paneli</p>
        <div className={styles.statusIndicator}>
          <span className={`${styles.status} ${databaseConnected ? styles.connected : styles.disconnected}`}>
            {databaseConnected ? '🟢 Database ulangan' : '🔴 Database ulanmagan (Mock data)'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {statCards.map((card, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon} style={{ backgroundColor: card.color }}>
                <span>{card.icon}</span>
              </div>
              <div className={styles.cardTrend}>
                <span className={styles.trendIcon}>📈</span>
                <span>{card.trend}</span>
              </div>
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardValue}>{card.value}</h3>
              <p className={styles.cardTitle}>{card.title}</p>
              <span className={styles.cardDescription}>{card.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2>Tezkor amallar</h2>
        <div className={styles.actionsGrid}>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>📦</span>
            <span>Yangi mahsulot qo'shish</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>🛒</span>
            <span>Buyurtmalarni ko'rish</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>👥</span>
            <span>Foydalanuvchilar</span>
          </button>
          <button className={styles.actionCard}>
            <span className={styles.actionIcon}>👁️</span>
            <span>Hisobotlar</span>
          </button>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className={styles.dataGrid}>
        {/* Recent Orders */}
        <div className={styles.dataCard}>
          <div className={styles.cardHeader}>
            <h3>So'nggi buyurtmalar</h3>
            <button className={styles.viewAllBtn}>Barchasini ko'rish</button>
          </div>
          <div className={styles.ordersList}>
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order, index) => (
                <div key={index} className={styles.orderItem}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderNumber}>#{order.orderNumber || `ORD-${order.id}`}</span>
                    <span className={styles.customerName}>{order.customerName || 'Mijoz'}</span>
                  </div>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderAmount}>{formatCurrency(order.total || 0)}</span>
                    <span className={`${styles.orderStatus} ${styles[order.status || 'pending']}`}>
                      {order.status === 'pending' && <span>⏰</span>}
                      {order.status === 'completed' && <span>✅</span>}
                      {order.status === 'processing' && <span>📦</span>}
                      {order.status === 'pending' ? 'Kutilmoqda' :
                       order.status === 'completed' ? 'Bajarildi' :
                       order.status === 'processing' ? 'Jarayonda' : 'Noma\'lum'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🛒</span>
                <p>Hozircha buyurtmalar yo'q</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className={styles.dataCard}>
          <div className={styles.cardHeader}>
            <h3>Mashhur mahsulotlar</h3>
            <button className={styles.viewAllBtn}>Barchasini ko'rish</button>
          </div>
          <div className={styles.productsList}>
            {stats.topProducts.length > 0 ? (
              stats.topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className={styles.productItem}>
                  <div className={styles.productInfo}>
                    <span className={styles.productName}>{product.title}</span>
                    <span className={styles.productCategory}>{product.category?.name}</span>
                  </div>
                  <div className={styles.productMeta}>
                    <span className={styles.productPrice}>{formatCurrency(product.price || 0)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📦</span>
                <p>Hozircha mahsulotlar yo'q</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
