
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../endpoints/admin';
import { productApi } from '../../endpoints/product';
import styles from './AdminDashboard.module.scss';

interface DashboardStats {
  totalProducts: number;
  pendingProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  approvedProducts: number;
  rejectedProducts: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  is_checked: 'PENDING' | 'APPROVED' | 'REJECTED';
  brand: { name: string };
  category: { name: string };
  user: { first_name: string; last_name: string };
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'users' | 'orders'>('overview');
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getDashboardStats,
  });

  const { data: pendingProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['admin-pending-products'],
    queryFn: () => productApi.getAllForAdmin(1, 20, '', 'PENDING'),
  });

  const approveProductMutation = useMutation({
    mutationFn: (productId: number) => productApi.approveProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const rejectProductMutation = useMutation({
    mutationFn: (productId: number) => productApi.rejectProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const handleApproveProduct = (productId: number) => {
    approveProductMutation.mutate(productId);
  };

  const handleRejectProduct = (productId: number) => {
    rejectProductMutation.mutate(productId);
  };

  if (statsLoading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Umumiy
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Mahsulotlar
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Foydalanuvchilar
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Buyurtmalar
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className={styles.overview}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Jami Mahsulotlar</h3>
              <div className={styles.statNumber}>{stats?.totalProducts || 0}</div>
            </div>
            <div className={styles.statCard}>
              <h3>Kutilayotgan Mahsulotlar</h3>
              <div className={styles.statNumber}>{stats?.pendingProducts || 0}</div>
            </div>
            <div className={styles.statCard}>
              <h3>Tasdiqlangan Mahsulotlar</h3>
              <div className={styles.statNumber}>{stats?.approvedProducts || 0}</div>
            </div>
            <div className={styles.statCard}>
              <h3>Jami Foydalanuvchilar</h3>
              <div className={styles.statNumber}>{stats?.totalUsers || 0}</div>
            </div>
            <div className={styles.statCard}>
              <h3>Jami Buyurtmalar</h3>
              <div className={styles.statNumber}>{stats?.totalOrders || 0}</div>
            </div>
            <div className={styles.statCard}>
              <h3>Jami Daromad</h3>
              <div className={styles.statNumber}>{stats?.totalRevenue || 0} so'm</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className={styles.products}>
          <h2>Kutilayotgan Mahsulotlar</h2>
          {productsLoading ? (
            <div>Loading...</div>
          ) : (
            <div className={styles.productsList}>
              {pendingProducts?.products?.map((product: Product) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productInfo}>
                    <h4>{product.title}</h4>
                    <p>Narxi: {product.price} so'm</p>
                    <p>Brend: {product.brand?.name}</p>
                    <p>Kategoriya: {product.category?.name}</p>
                    <p>Sotuvchi: {product.user?.first_name} {product.user?.last_name}</p>
                    <p>Sana: {new Date(product.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.productActions}>
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleApproveProduct(product.id)}
                      disabled={approveProductMutation.isPending}
                    >
                      Tasdiqlash
                    </button>
                    <button
                      className={styles.rejectBtn}
                      onClick={() => handleRejectProduct(product.id)}
                      disabled={rejectProductMutation.isPending}
                    >
                      Rad etish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
