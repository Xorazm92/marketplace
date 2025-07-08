import React, { useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminDashboard from '../../components/admin/AdminDashboard';
import ProductManagement from '../../components/admin/ProductManagement';
import OrderManagement from '../../components/admin/OrderManagement';
import UserManagement from '../../components/admin/UserManagement';
import Analytics from '../../components/admin/Analytics';
import Settings from '../../components/admin/Settings';
import styles from '../../styles/Admin.module.scss';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'analytics' | 'settings';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Mock admin user - real loyihada authentication dan keladi
  const adminUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@inbola.uz',
    role: 'super_admin',
    avatar: null
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
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
        return <AdminDashboard />;
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
        onTabChange={setActiveTab}
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
