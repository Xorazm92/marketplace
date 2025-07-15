import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from './AdminDashboard.module.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
import { useRouter } from 'next/router';
import { getAllProducts, approveProduct, rejectProduct } from '../../endpoints/product';
import { getUsersAdmin } from '../../endpoints/user';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyStats: {
    ordersThisMonth: number;
    revenueThisMonth: number;
  };
}

interface Product {
  id: number;
  title: string;
  price: number;
  is_checked: string;
  user: {
    first_name: string;
    last_name: string;
  };
  brand: {
    name: string;
  };
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load dashboard stats
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }

      // Load pending products
      const productsResponse = await fetch('/api/admin/products?status=PENDING', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setPendingProducts(productsData.products);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (productId: number) => {
    try {
      await approveProduct(productId);
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error approving product:', error);
    }
  };

  const handleRejectProduct = async (productId: number) => {
    try {
      await rejectProduct(productId);
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error rejecting product:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.tabs}>
          <button 
            className={activeTab === 'dashboard' ? styles.active : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'products' ? styles.active : ''}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={activeTab === 'users' ? styles.active : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'orders' ? styles.active : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className={styles.content}>
          {stats && (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h3>Total Users</h3>
                  <p className={styles.statNumber}>{stats.totalUsers}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Total Products</h3>
                  <p className={styles.statNumber}>{stats.totalProducts}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Total Orders</h3>
                  <p className={styles.statNumber}>{stats.totalOrders}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Total Revenue</h3>
                  <p className={styles.statNumber}>${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>

              <div className={styles.monthlyStats}>
                <h2>This Month</h2>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <h3>Orders</h3>
                    <p className={styles.statNumber}>{stats.monthlyStats.ordersThisMonth}</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>Revenue</h3>
                    <p className={styles.statNumber}>${stats.monthlyStats.revenueThisMonth.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className={styles.pendingProducts}>
            <h2>Pending Products ({pendingProducts.length})</h2>
            <div className={styles.productsList}>
              {pendingProducts.map(product => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productInfo}>
                    <h3>{product.title}</h3>
                    <p>By: {product.user.first_name} {product.user.last_name}</p>
                    <p>Brand: {product.brand.name}</p>
                    <p>Price: ${product.price}</p>
                    <p>Created: {new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.productActions}>
                    <button 
                      className={styles.approveBtn}
                      onClick={() => handleApproveProduct(product.id)}
                    >
                      Approve
                    </button>
                    <button 
                      className={styles.rejectBtn}
                      onClick={() => handleRejectProduct(product.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className={styles.content}>
          <h2>Product Management</h2>
          {/* Add product management component here */}
        </div>
      )}

      {activeTab === 'users' && (
        <div className={styles.content}>
          <h2>User Management</h2>
          {/* Add user management component here */}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className={styles.content}>
          <h2>Order Management</h2>
          {/* Add order management component here */}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;