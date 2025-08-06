import React from 'react';
import Link from 'next/link';
import styles from './ProfileOverview.module.scss';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  membershipLevel: string;
}

interface ProfileOverviewProps {
  user: User;
}

// Mock data for recent orders and activities
const recentOrders = [
  {
    id: 1,
    orderNumber: 'INB-2024-001',
    date: '2024-01-20',
    status: 'Yetkazildi',
    total: 125000,
    items: 3
  },
  {
    id: 2,
    orderNumber: 'INB-2024-002',
    date: '2024-01-18',
    status: 'Yo\'lda',
    total: 89000,
    items: 2
  },
  {
    id: 3,
    orderNumber: 'INB-2024-003',
    date: '2024-01-15',
    status: 'Tayyorlanmoqda',
    total: 156000,
    items: 4
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'order',
    message: 'Yangi buyurtma berildi',
    date: '2024-01-20',
    icon: '📦'
  },
  {
    id: 2,
    type: 'wishlist',
    message: 'Sevimlilar ro\'yxatiga mahsulot qo\'shildi',
    date: '2024-01-19',
    icon: '❤️'
  },
  {
    id: 3,
    type: 'review',
    message: 'Mahsulotga sharh yozildi',
    date: '2024-01-18',
    icon: '⭐'
  },
  {
    id: 4,
    type: 'address',
    message: 'Yangi manzil qo\'shildi',
    date: '2024-01-17',
    icon: '📍'
  }
];

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Yetkazildi':
        return '#27ae60';
      case 'Yo\'lda':
        return '#f39c12';
      case 'Tayyorlanmoqda':
        return '#3498db';
      default:
        return '#7f8c8d';
    }
  };

  return (
    <div className={styles.profileOverview}>
      <div className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}>
          Xush kelibsiz, {user.firstName}! 👋
        </h2>
        <p className={styles.welcomeText}>
          INBOLA da sizning shaxsiy hisobingiz. Bu yerda buyurtmalaringizni kuzatishingiz, 
          sevimli mahsulotlaringizni saqlashingiz va profil ma'lumotlaringizni boshqarishingiz mumkin.
        </p>
      </div>

      <div className={styles.quickStats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{user.totalOrders}</span>
            <span className={styles.statLabel}>Jami buyurtmalar</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💰</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{formatPrice(user.totalSpent)}</span>
            <span className={styles.statLabel}>Jami xarid</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⭐</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{user.membershipLevel}</span>
            <span className={styles.statLabel}>A'zolik darajasi</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {new Date(user.joinDate).getFullYear()}
            </span>
            <span className={styles.statLabel}>A'zo bo'lgan yil</span>
          </div>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.recentOrders}>
          <div className={styles.sectionHeader}>
            <h3>So'nggi buyurtmalar</h3>
            <Link href="/profile?tab=orders" className={styles.viewAllLink}>
              Barchasini ko'rish →
            </Link>
          </div>
          
          <div className={styles.ordersList}>
            {recentOrders.map((order) => (
              <div key={order.id} className={styles.orderItem}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderNumber}>{order.orderNumber}</span>
                  <span className={styles.orderDate}>{formatDate(order.date)}</span>
                </div>
                <div className={styles.orderDetails}>
                  <span 
                    className={styles.orderStatus}
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                  <span className={styles.orderTotal}>{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.recentActivity}>
          <div className={styles.sectionHeader}>
            <h3>So'nggi faoliyat</h3>
          </div>
          
          <div className={styles.activityList}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <span className={styles.activityIcon}>{activity.icon}</span>
                <div className={styles.activityContent}>
                  <span className={styles.activityMessage}>{activity.message}</span>
                  <span className={styles.activityDate}>{formatDate(activity.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h3>Tez harakatlar</h3>
        <div className={styles.actionButtons}>
          <Link href="/search" className={styles.actionButton}>
            <span className={styles.actionIcon}>🔍</span>
            <span>Mahsulot qidirish</span>
          </Link>
          
          <Link href="/profile?tab=orders" className={styles.actionButton}>
            <span className={styles.actionIcon}>📦</span>
            <span>Buyurtmalar</span>
          </Link>
          
          <Link href="/profile?tab=wishlist" className={styles.actionButton}>
            <span className={styles.actionIcon}>❤️</span>
            <span>Sevimlilar</span>
          </Link>
          
          <Link href="/profile?tab=addresses" className={styles.actionButton}>
            <span className={styles.actionIcon}>📍</span>
            <span>Manzillar</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
