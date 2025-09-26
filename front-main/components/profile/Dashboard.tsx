import React, { useState, useEffect } from 'react';
import { 
  FiShoppingBag, 
  FiHeart, 
  FiCreditCard, 
  FiTrendingUp,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck
} from 'react-icons/fi';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../utils/formatters';
import styles from './Dashboard.module.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  savedCards: number;
  pendingOrders: number;
  completedOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: number;
}

interface SpendingData {
  monthly: number[];
  categories: { name: string; amount: number; color: string }[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    savedCards: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [spendingData, setSpendingData] = useState<SpendingData>({
    monthly: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockStats: DashboardStats = {
        totalOrders: 24,
        totalSpent: 2450000,
        wishlistItems: 12,
        savedCards: 2,
        pendingOrders: 3,
        completedOrders: 21
      };

      const mockRecentOrders: RecentOrder[] = [
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          date: '2024-01-15',
          total: 125000,
          status: 'delivered',
          items: 3
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          date: '2024-01-14',
          total: 89000,
          status: 'shipped',
          items: 2
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          date: '2024-01-13',
          total: 156000,
          status: 'processing',
          items: 4
        }
      ];

      const mockSpendingData: SpendingData = {
        monthly: [180000, 220000, 195000, 245000, 210000, 285000],
        categories: [
          { name: 'Bolalar mahsulotlari', amount: 850000, color: '#4e46b4' },
          { name: 'Kiyim-kechak', amount: 650000, color: '#06b6d4' },
          { name: 'O\'yinchoqlar', amount: 450000, color: '#10b981' },
          { name: 'Kitoblar', amount: 295000, color: '#f59e0b' },
          { name: 'Boshqalar', amount: 200000, color: '#ef4444' }
        ]
      };

      setStats(mockStats);
      setRecentOrders(mockRecentOrders);
      setSpendingData(mockSpendingData);
    } catch (error) {
      console.error('Dashboard ma\'lumotlarini yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock className={styles.statusIconPending} />;
      case 'processing':
        return <FiPackage className={styles.statusIconProcessing} />;
      case 'shipped':
        return <FiTruck className={styles.statusIconShipped} />;
      case 'delivered':
        return <FiCheckCircle className={styles.statusIconDelivered} />;
      default:
        return <FiClock />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Kutilmoqda';
      case 'processing':
        return 'Tayyorlanmoqda';
      case 'shipped':
        return 'Yo\'lda';
      case 'delivered':
        return 'Yetkazildi';
      default:
        return status;
    }
  };

  // Chart configurations
  const lineChartData = {
    labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun'],
    datasets: [
      {
        label: 'Oylik xarajatlar',
        data: spendingData.monthly,
        borderColor: '#4e46b4',
        backgroundColor: 'rgba(78, 70, 180, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const doughnutChartData = {
    labels: spendingData.categories.map(cat => cat.name),
    datasets: [
      {
        data: spendingData.categories.map(cat => cat.amount),
        backgroundColor: spendingData.categories.map(cat => cat.color),
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatPrice(value);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <h1>Xush kelibsiz, {user?.name}!</h1>
        <p>Bu yerda sizning profil statistikangiz va so'nggi faoliyatingiz ko'rsatilgan.</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiShoppingBag />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalOrders}</h3>
            <p>Jami buyurtmalar</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiTrendingUp />
          </div>
          <div className={styles.statContent}>
            <h3>{formatPrice(stats.totalSpent)}</h3>
            <p>Jami xarajat</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiHeart />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.wishlistItems}</h3>
            <p>Sevimli mahsulotlar</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiCreditCard />
          </div>
          <div className={styles.statContent}>
            <h3>{stats.savedCards}</h3>
            <p>Saqlangan kartalar</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <div className={styles.chartCard}>
          <h3>Oylik xarajatlar</h3>
          <div className={styles.chartContainer}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Kategoriya bo'yicha taqsimot</h3>
          <div className={styles.chartContainer}>
            <Doughnut 
              data={doughnutChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      padding: 20
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.recentOrdersSection}>
        <div className={styles.sectionHeader}>
          <h3>So'nggi buyurtmalar</h3>
          <a href="/profile/orders" className={styles.viewAllLink}>
            Barchasini ko'rish
          </a>
        </div>

        <div className={styles.ordersTable}>
          {recentOrders.map((order) => (
            <div key={order.id} className={styles.orderRow}>
              <div className={styles.orderInfo}>
                <div className={styles.orderNumber}>
                  {order.orderNumber}
                </div>
                <div className={styles.orderDate}>
                  {new Date(order.date).toLocaleDateString('uz-UZ')}
                </div>
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.orderItems}>
                  {order.items} ta mahsulot
                </div>
                <div className={styles.orderTotal}>
                  {formatPrice(order.total)}
                </div>
              </div>

              <div className={styles.orderStatus}>
                {getStatusIcon(order.status)}
                <span>{getStatusText(order.status)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3>Tezkor harakatlar</h3>
        <div className={styles.actionsGrid}>
          <a href="/profile/orders" className={styles.actionCard}>
            <FiShoppingBag />
            <span>Buyurtmalarni ko'rish</span>
          </a>
          <a href="/profile/wishlist" className={styles.actionCard}>
            <FiHeart />
            <span>Sevimlilar</span>
          </a>
          <a href="/profile/addresses" className={styles.actionCard}>
            <FiTruck />
            <span>Manzillar</span>
          </a>
          <a href="/profile/payments" className={styles.actionCard}>
            <FiCreditCard />
            <span>To'lov usullari</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
