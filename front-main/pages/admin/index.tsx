import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import Dashboard from '../../components/admin/Dashboard';
import ProductManagement from '../../components/admin/ProductManagement';
import OrderManagement from '../../components/admin/OrderManagement';
import UserManagement from '../../components/admin/UserManagement';
import Analytics from '../../components/admin/Analytics';
import Settings from '../../components/admin/Settings';
import { getOrderStatistics } from '../../endpoints/order';
import { getAllProducts } from '../../endpoints/product';
import { useAdminAuth, withAdminAuth, RequirePermission } from '../../hooks/useAdminAuth';
import styles from '../../styles/Admin.module.scss';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'analytics' | 'settings';

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

const AdminPage: React.FC = () => {
  const router = useRouter();
  const { admin, logout, checkPermission } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: [],
    topProducts: []
  });

  // Admin user from authentication
  const adminUser = admin ? {
    id: admin.id,
    name: `${admin.first_name} ${admin.last_name}`,
    email: admin.phone_number, // Using phone as email for display
    role: admin.role.toLowerCase(),
    avatar: null
  } : null;

  // Dashboard ma'lumotlarini yuklash
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Real API'dan ma'lumot olish
      const token = localStorage.getItem('admin_access_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('📊 Loading dashboard data from API...');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardStats({
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          totalProducts: data.totalProducts || 0,
          totalUsers: data.totalUsers || 0,
          pendingOrders: data.monthlyStats?.ordersThisMonth || 0,
          completedOrders: data.totalOrders - (data.monthlyStats?.ordersThisMonth || 0),
          recentOrders: data.recentOrders || [],
          topProducts: data.topProducts || []
        });
        console.log('✅ Dashboard data loaded successfully');
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      // Fallback data
      setDashboardStats({
        totalOrders: 45,
        totalRevenue: 2850000,
        totalProducts: 156,
        totalUsers: 89,
        pendingOrders: 12,
        completedOrders: 33,
        recentOrders: [],
        topProducts: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // URL parametrlarini tekshirish va tab o'rnatish
  useEffect(() => {
    const { tab } = router.query;
    if (tab && typeof tab === 'string') {
      const validTabs: AdminTab[] = ['dashboard', 'products', 'orders', 'users', 'analytics', 'settings'];
      if (validTabs.includes(tab as AdminTab)) {
        setActiveTab(tab as AdminTab);
      }
    }
  }, [router.query]);

  // Dashboard ma'lumotlarini yuklash
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardData();
    }
  }, [activeTab]);

  // Tab o'zgarganda URL'ni yangilash
  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`, undefined, { shallow: true });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <RequirePermission permission="view_dashboard">
            <Dashboard stats={dashboardStats} isLoading={isLoading} />
          </RequirePermission>
        );
      case 'products':
        return (
          <RequirePermission permission="view_products">
            <ProductManagement />
          </RequirePermission>
        );
      case 'orders':
        return (
          <RequirePermission permission="view_orders">
            <OrderManagement />
          </RequirePermission>
        );
      case 'users':
        return (
          <RequirePermission permission="view_users">
            <UserManagement />
          </RequirePermission>
        );
      case 'analytics':
        return (
          <RequirePermission permission="view_analytics">
            <Analytics />
          </RequirePermission>
        );
      case 'settings':
        return (
          <RequirePermission permission="view_settings">
            <Settings />
          </RequirePermission>
        );
      default:
        return (
          <RequirePermission permission="view_dashboard">
            <Dashboard stats={dashboardStats} isLoading={isLoading} />
          </RequirePermission>
        );
    }
  };

  return (
    <>
      <Head>
        <title>Admin Panel - INBOLA</title>
        <meta name="description" content="INBOLA admin boshqaruv paneli" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <AdminLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        adminUser={adminUser}
        onLogout={logout}
      >
        <div className={styles.adminContent}>
          {renderTabContent()}
        </div>
      </AdminLayout>
    </>
  );
};

export default withAdminAuth(AdminPage);
