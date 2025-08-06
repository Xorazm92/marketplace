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

  // Mock admin user - real loyihada authentication dan keladi
  const adminUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@inbola.uz',
    role: 'super_admin',
    avatar: null
  };

  // Dashboard ma'lumotlarini yuklash
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Hozircha mock data ishlatamiz (authentication kerak bo'lganda real API'ga o'tamiz)
      console.log('📊 Loading dashboard data with mock data...');

      const mockOrderStats = {
        totalOrders: 45,
        totalRevenue: 2850000,
        pendingOrders: 12,
        completedOrders: 33,
        recentOrders: [
          { id: 1, orderNumber: 'ORD-001', customerName: 'Ali Valiyev', total: 125000, status: 'pending' },
          { id: 2, orderNumber: 'ORD-002', customerName: 'Malika Karimova', total: 89000, status: 'completed' },
          { id: 3, orderNumber: 'ORD-003', customerName: 'Bobur Toshmatov', total: 156000, status: 'processing' },
          { id: 4, orderNumber: 'ORD-004', customerName: 'Dilnoza Rahimova', total: 75000, status: 'pending' },
          { id: 5, orderNumber: 'ORD-005', customerName: 'Jasur Karimov', total: 95000, status: 'completed' }
        ]
      };

      const mockProducts = {
        data: [
          { id: 1, title: 'Bolalar o\'yinchoq mashina', price: 45000, category: { name: 'O\'yinchoqlar' } },
          { id: 2, title: 'Bolalar kiyimi', price: 89000, category: { name: 'Kiyim' } },
          { id: 3, title: 'Ta\'lim kitoblari', price: 25000, category: { name: 'Kitoblar' } },
          { id: 4, title: 'Sport anjomlar', price: 120000, category: { name: 'Sport' } },
          { id: 5, title: 'Maktab sumkalari', price: 65000, category: { name: 'Maktab' } },
          { id: 6, title: 'Bolalar velosipedi', price: 350000, category: { name: 'Transport' } }
        ]
      };

      // Kichik kechikish (real API'ni taqlid qilish uchun)
      await new Promise(resolve => setTimeout(resolve, 1000));

      setDashboardStats({
        totalOrders: mockOrderStats.totalOrders,
        totalRevenue: mockOrderStats.totalRevenue,
        totalProducts: mockProducts.data.length + 150, // Jami 156 ta mahsulot
        totalUsers: 89,
        pendingOrders: mockOrderStats.pendingOrders,
        completedOrders: mockOrderStats.completedOrders,
        recentOrders: mockOrderStats.recentOrders,
        topProducts: mockProducts.data.slice(0, 5)
      });

      console.log('✅ Dashboard data loaded successfully');
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
        return <Dashboard stats={dashboardStats} isLoading={isLoading} />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'users':
        return <UserManagement />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard stats={dashboardStats} isLoading={isLoading} />;
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
      >
        <div className={styles.adminContent}>
          {renderTabContent()}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminPage;
