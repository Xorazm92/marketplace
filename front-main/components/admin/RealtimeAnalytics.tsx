
import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import styles from './RealtimeAnalytics.module.scss';

interface AnalyticsData {
  visitors: {
    current: number;
    today: number;
    change: number;
  };
  sales: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    change: number;
  };
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  userActivity: {
    children: number;
    parents: number;
    guests: number;
  };
  safetyMetrics: {
    blockedContent: number;
    parentalControlsActive: number;
    reportedItems: number;
  };
}

const RealtimeAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Replace with actual API call
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
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

  const visitorData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Bolalar',
        data: [12, 19, 25, 35, 42, 38],
        borderColor: '#FF6B9D',
        backgroundColor: 'rgba(255, 107, 157, 0.1)',
        fill: true,
      },
      {
        label: 'Ota-onalar',
        data: [8, 15, 22, 28, 35, 30],
        borderColor: '#4ECDC4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        fill: true,
      },
    ],
  };

  const safetyData = {
    labels: ['Bloklangan kontent', 'Faol nazorat', 'Shikoyatlar'],
    datasets: [
      {
        data: [
          analytics?.safetyMetrics.blockedContent || 0,
          analytics?.safetyMetrics.parentalControlsActive || 0,
          analytics?.safetyMetrics.reportedItems || 0,
        ],
        backgroundColor: ['#FF6B9D', '#4ECDC4', '#45B7D1'],
        hoverBackgroundColor: ['#FF5A8C', '#3DBD9D', '#3AA6C7'],
      },
    ],
  };

  const revenueData = {
    labels: ['Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan', 'Yak'],
    datasets: [
      {
        label: 'Daromad ($)',
        data: [1200, 1900, 3000, 2500, 2200, 2800, 3200],
        backgroundColor: 'rgba(69, 183, 209, 0.8)',
        borderColor: '#45B7D1',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className={styles.analytics}>
      <div className={styles.header}>
        <h2>📊 Real-time Analytics</h2>
        <div className={styles.timeRange}>
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              className={`${styles.rangeBtn} ${timeRange === range ? styles.active : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>👥</div>
          <div className={styles.metricInfo}>
            <h3>Faol foydalanuvchilar</h3>
            <div className={styles.metricValue}>
              {analytics?.visitors.current || 0}
            </div>
            <div className={`${styles.metricChange} ${(analytics?.visitors.change || 0) >= 0 ? styles.positive : styles.negative}`}>
              {(analytics?.visitors.change || 0) >= 0 ? '↗' : '↘'} 
              {Math.abs(analytics?.visitors.change || 0)}%
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>💰</div>
          <div className={styles.metricInfo}>
            <h3>Bugungi daromad</h3>
            <div className={styles.metricValue}>
              ${analytics?.sales.today || 0}
            </div>
            <div className={`${styles.metricChange} ${(analytics?.sales.change || 0) >= 0 ? styles.positive : styles.negative}`}>
              {(analytics?.sales.change || 0) >= 0 ? '↗' : '↘'} 
              {Math.abs(analytics?.sales.change || 0)}%
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>🛡️</div>
          <div className={styles.metricInfo}>
            <h3>Xavfsizlik</h3>
            <div className={styles.metricValue}>
              {analytics?.safetyMetrics.blockedContent || 0}
            </div>
            <div className={styles.metricLabel}>Bloklangan kontent</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>👨‍👩‍👧‍👦</div>
          <div className={styles.metricInfo}>
            <h3>Nazorat</h3>
            <div className={styles.metricValue}>
              {analytics?.safetyMetrics.parentalControlsActive || 0}
            </div>
            <div className={styles.metricLabel}>Faol ota-ona nazorati</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h3>👥 Foydalanuvchi faolligi</h3>
          <div className={styles.chartContainer}>
            <Line 
              data={visitorData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>💰 Haftalik daromad</h3>
          <div className={styles.chartContainer}>
            <Bar 
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>🛡️ Xavfsizlik ko'rsatkichlari</h3>
          <div className={styles.chartContainer}>
            <Doughnut 
              data={safetyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className={styles.topProducts}>
        <h3>🔥 Eng mashhur mahsulotlar</h3>
        <div className={styles.productList}>
          {analytics?.topProducts?.map((product, index) => (
            <div key={product.id} className={styles.productItem}>
              <div className={styles.productRank}>#{index + 1}</div>
              <div className={styles.productInfo}>
                <h4>{product.name}</h4>
                <p>{product.sales} sotildi • ${product.revenue}</p>
              </div>
              <div className={styles.productTrend}>
                <div className={styles.trendChart}>📈</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Alerts */}
      <div className={styles.safetyAlerts}>
        <h3>⚠️ Xavfsizlik ogohlantirish</h3>
        <div className={styles.alertList}>
          <div className={styles.alert}>
            <span className={styles.alertIcon}>🚫</span>
            <div className={styles.alertInfo}>
              <h4>Yangi bloklangan kontent</h4>
              <p>5 ta noto'g'ri kontent aniqlandi va bloklandi</p>
              <span className={styles.alertTime}>2 daqiqa oldin</span>
            </div>
          </div>
          <div className={styles.alert}>
            <span className={styles.alertIcon}>👨‍👩‍👧‍👦</span>
            <div className={styles.alertInfo}>
              <h4>Ota-ona nazorati faollashtirildi</h4>
              <p>15 ta yangi ota-ona nazorati sozlandi</p>
              <span className={styles.alertTime}>10 daqiqa oldin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeAnalytics;
