
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { getSellerProfile, getSellerAnalytics } from '../../endpoints/seller';
import { Seller, SellerAnalytics } from '../../endpoints/seller';
import styles from '../../styles/SellerDashboard.module.scss';

const SellerDashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    try {
      const [sellerData, analyticsData] = await Promise.all([
        getSellerProfile(),
        getSellerAnalytics(),
      ]);
      
      setSeller(sellerData);
      setAnalytics(analyticsData);
    } catch (error: any) {
      console.error('Error fetching seller data:', error);
      if (error.response?.status === 404) {
        // No seller profile found, redirect to registration
        router.push('/seller/register');
      } else {
        toast.error('Ma\'lumotlarni olishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '#4CAF50';
      case 'PENDING':
        return '#FF9800';
      case 'REJECTED':
        return '#f44336';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Tasdiqlangan';
      case 'PENDING':
        return 'Kutilmoqda';
      case 'REJECTED':
        return 'Rad etilgan';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Yuklanmoqda...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className={styles.error}>
        <h2>Sotuvchi profili topilmadi</h2>
        <button onClick={() => router.push('/seller/register')}>
          Ro'yxatdan o'tish
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.welcome}>
          <h1>Xush kelibsiz, {seller.company_name}!</h1>
          <div className={styles.status}>
            <span 
              className={styles.statusBadge}
              style={{ backgroundColor: getStatusColor(seller.status) }}
            >
              {getStatusText(seller.status)}
            </span>
            {seller.is_verified && (
              <span className={styles.verified}>✓ Tasdiqlangan</span>
            )}
          </div>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.editBtn}
            onClick={() => router.push('/seller/profile/edit')}
          >
            Profilni tahrirlash
          </button>
          <button 
            className={styles.addProductBtn}
            onClick={() => router.push('/CreateProduct')}
          >
            Mahsulot qo'shish
          </button>
        </div>
      </div>

      {seller.status === 'PENDING' && (
        <div className={styles.pendingNotice}>
          <h3>Tekshirish jarayonida</h3>
          <p>Sizning sotuvchi profilingiz hozirda admin tomonidan tekshirilmoqda. Bu jarayon 24-48 soat ichida yakunlanadi.</p>
        </div>
      )}

      {seller.status === 'REJECTED' && (
        <div className={styles.rejectedNotice}>
          <h3>Ariza rad etildi</h3>
          <p>Sizning sotuvchi arizangiz rad etildi. Qo'shimcha ma'lumot uchun qo'llab-quvvatlash xizmatiga murojaat qiling.</p>
        </div>
      )}

      {analytics && (
        <div className={styles.analytics}>
          <h2>Statistika</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>{analytics.totalProducts}</h3>
              <p>Jami mahsulotlar</p>
            </div>
            <div className={styles.statCard}>
              <h3>{analytics.activeProducts}</h3>
              <p>Faol mahsulotlar</p>
            </div>
            <div className={styles.statCard}>
              <h3>{analytics.totalOrders}</h3>
              <p>Jami buyurtmalar</p>
            </div>
            <div className={styles.statCard}>
              <h3>{analytics.pendingOrders}</h3>
              <p>Kutilayotgan buyurtmalar</p>
            </div>
            <div className={styles.statCard}>
              <h3>{analytics.completedOrders}</h3>
              <p>Bajarilgan buyurtmalar</p>
            </div>
            <div className={styles.statCard}>
              <h3>{analytics.totalRevenue.toLocaleString()} so'm</h3>
              <p>Jami daromad</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.quickActions}>
        <h2>Tezkor harakatlar</h2>
        <div className={styles.actionGrid}>
          <button 
            className={styles.actionCard}
            onClick={() => router.push('/seller/products')}
          >
            <span className={styles.icon}>📦</span>
            <h3>Mahsulotlarim</h3>
            <p>Mahsulotlarni boshqarish</p>
          </button>
          
          <button 
            className={styles.actionCard}
            onClick={() => router.push('/seller/orders')}
          >
            <span className={styles.icon}>📋</span>
            <h3>Buyurtmalar</h3>
            <p>Buyurtmalarni kuzatish</p>
          </button>
          
          <button 
            className={styles.actionCard}
            onClick={() => router.push('/seller/analytics')}
          >
            <span className={styles.icon}>📊</span>
            <h3>Analitika</h3>
            <p>Batafsil statistika</p>
          </button>
          
          <button 
            className={styles.actionCard}
            onClick={() => router.push('/seller/profile')}
          >
            <span className={styles.icon}>⚙️</span>
            <h3>Sozlamalar</h3>
            <p>Profil sozlamalari</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
