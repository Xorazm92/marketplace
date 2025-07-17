import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import { getOrderStatistics } from '../../endpoints/order';
import { getAllProducts } from '../../endpoints/product';
import styles from '../../components/admin/AdminDashboard.module.scss';

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

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: [],
    topProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock admin user data
  const adminUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@inbola.uz',
    role: 'Administrator',
    avatar: null
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load statistics
      const [orderStats, products] = await Promise.all([
        getOrderStatistics().catch(() => ({ totalOrders: 0, totalRevenue: 0 })),
        getAllProducts({ limit: 100 }).catch(() => ({ data: [] }))
      ]);

      setStats({
        totalOrders: orderStats.totalOrders || 0,
        totalRevenue: orderStats.totalRevenue || 0,
        totalProducts: products.data?.length || 0,
        totalUsers: 150, // Mock data
        pendingOrders: orderStats.pendingOrders || 0,
        completedOrders: orderStats.completedOrders || 0,
        recentOrders: orderStats.recentOrders || [],
        topProducts: products.data?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        activeTab="dashboard"
        onTabChange={(tab) => console.log('Tab changed:', tab)}
        adminUser={adminUser}
      >
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Dashboard yuklanmoqda...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - INBOLA</title>
        <meta name="description" content="Admin dashboard" />
      </Head>

      <AdminLayout
        activeTab="dashboard"
        onTabChange={(tab) => console.log('Tab changed:', tab)}
        adminUser={adminUser}
      >
        <div className={styles.dashboard}>
          <div className={styles.header}>
            <h1>Dashboard</h1>
            <p>INBOLA admin paneli</p>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className={styles.statInfo}>
                <h3>{stats.totalOrders}</h3>
                <p>Jami buyurtmalar</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className={styles.statInfo}>
                <h3>{stats.totalRevenue.toLocaleString()} so'm</h3>
                <p>Jami daromad</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className={styles.statInfo}>
                <h3>{stats.totalProducts}</h3>
                <p>Jami mahsulotlar</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className={styles.statInfo}>
                <h3>{stats.totalUsers}</h3>
                <p>Jami foydalanuvchilar</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className={styles.quickActions}>
            <h2>Tezkor amallar</h2>
            <div className={styles.actionsGrid}>
              <Link href="/admin/products" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3>Mahsulotlar</h3>
                <p>Mahsulotlarni boshqarish</p>
              </Link>

              <Link href="/admin/orders" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3>Buyurtmalar</h3>
                <p>Buyurtmalarni boshqarish</p>
              </Link>

              <Link href="/admin/users" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3>Foydalanuvchilar</h3>
                <p>Foydalanuvchilarni boshqarish</p>
              </Link>

              <Link href="/admin/categories" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3>Kategoriyalar</h3>
                <p>Kategoriyalarni boshqarish</p>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={styles.recentActivity}>
            <div className={styles.activitySection}>
              <h2>So'nggi buyurtmalar</h2>
              <div className={styles.ordersList}>
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className={styles.orderItem}>
                      <div className={styles.orderInfo}>
                        <h4>#{order.order_number}</h4>
                        <p>{order.final_amount?.toLocaleString()} so'm</p>
                      </div>
                      <div className={styles.orderStatus}>
                        <span className={`${styles.status} ${styles[order.status?.toLowerCase()]}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Hozircha buyurtmalar yo'q</p>
                )}
              </div>
            </div>

            <div className={styles.activitySection}>
              <h2>Top mahsulotlar</h2>
              <div className={styles.productsList}>
                {stats.topProducts.length > 0 ? (
                  stats.topProducts.map((product: any) => (
                    <div key={product.id} className={styles.productItem}>
                      <div className={styles.productInfo}>
                        <h4>{product.title}</h4>
                        <p>{product.price?.toLocaleString()} so'm</p>
                      </div>
                      <div className={styles.productViews}>
                        <span>{product.view_count || 0} ko'rishlar</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Hozircha mahsulotlar yo'q</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
