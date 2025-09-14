
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import ProductManagement from '../../components/admin/ProductManagement';
import UserManagement from '../../components/admin/UserManagement';
import styles from '../../styles/Admin.module.scss';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.adminLayout}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>INBOLA Admin</h2>
        </div>
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${activeSection === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`${styles.navItem} ${activeSection === 'products' ? styles.active : ''}`}
            onClick={() => setActiveSection('products')}
          >
            Mahsulotlar
          </button>
          <button
            className={`${styles.navItem} ${activeSection === 'users' ? styles.active : ''}`}
            onClick={() => setActiveSection('users')}
          >
            Foydalanuvchilar
          </button>
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Chiqish
          </button>
        </nav>
      </div>
      
      <div className={styles.content}>
        {activeSection === 'dashboard' && <AdminDashboard />}
        {activeSection === 'products' && <ProductManagement />}
        {activeSection === 'users' && <UserManagement />}
      </div>
    </div>
  );
};

export default AdminPage;
