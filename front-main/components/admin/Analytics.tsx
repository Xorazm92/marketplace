import React, { useState, useEffect } from 'react';
import styles from './Analytics.module.scss';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  monthlyRevenue: number[];
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    customer: string;
    amount: number;
    date: string;
  }>;
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    monthlyRevenue: [0, 0, 0, 0, 0, 0],
    topProducts: [],
    recentOrders: []
  });

  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ');
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const months = ['Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr', 'Yanvar'];

  return (
    <div className={styles.analytics}>
      <div className={styles.header}>
        <h2>📊 Analitika va hisobotlar</h2>
        <div className={styles.periodSelector}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={styles.periodSelect}
          >
            <option value="7days">Oxirgi 7 kun</option>
            <option value="30days">Oxirgi 30 kun</option>
            <option value="6months">Oxirgi 6 oy</option>
            <option value="1year">Oxirgi yil</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>💰</div>
          <div className={styles.metricContent}>
            <h3>Jami daromad</h3>
            <div className={styles.metricValue}>{formatPrice(analyticsData.totalRevenue)}</div>
            <div className={styles.metricGrowth}>
              <span className={styles.growthPositive}>+12.5%</span>
              <span>oxirgi oyga nisbatan</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>📦</div>
          <div className={styles.metricContent}>
            <h3>Jami buyurtmalar</h3>
            <div className={styles.metricValue}>{analyticsData.totalOrders}</div>
            <div className={styles.metricGrowth}>
              <span className={styles.growthPositive}>+8.3%</span>
              <span>oxirgi oyga nisbatan</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>🛍️</div>
          <div className={styles.metricContent}>
            <h3>Jami mahsulotlar</h3>
            <div className={styles.metricValue}>{analyticsData.totalProducts}</div>
            <div className={styles.metricGrowth}>
              <span className={styles.growthPositive}>+15.2%</span>
              <span>oxirgi oyga nisbatan</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>👥</div>
          <div className={styles.metricContent}>
            <h3>Jami foydalanuvchilar</h3>
            <div className={styles.metricValue}>{analyticsData.totalUsers}</div>
            <div className={styles.metricGrowth}>
              <span className={styles.growthPositive}>+22.1%</span>
              <span>oxirgi oyga nisbatan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <div className={styles.revenueChart}>
          <div className={styles.chartHeader}>
            <h3>📈 Oylik daromad</h3>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <div className={styles.legendColor}></div>
                Daromad
              </span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.chartBars}>
              {analyticsData.monthlyRevenue.map((revenue, index) => {
                const maxRevenue = Math.max(...analyticsData.monthlyRevenue);
                const height = (revenue / maxRevenue) * 100;
                return (
                  <div key={index} className={styles.chartBar}>
                    <div
                      className={styles.bar}
                      style={{ height: `${height}%` }}
                      title={`${months[index]}: ${formatPrice(revenue)}`}
                    ></div>
                    <span className={styles.barLabel}>{months[index]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.topProducts}>
          <div className={styles.chartHeader}>
            <h3>🏆 Eng ko'p sotilgan mahsulotlar</h3>
          </div>
          <div className={styles.productsList}>
            {analyticsData.topProducts.map((product, index) => (
              <div key={product.id} className={styles.productItem}>
                <div className={styles.productRank}>#{index + 1}</div>
                <div className={styles.productInfo}>
                  <h4>{product.name}</h4>
                  <p>{product.sales} ta sotildi</p>
                </div>
                <div className={styles.productRevenue}>
                  {formatPrice(product.revenue)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.recentOrdersSection}>
        <div className={styles.sectionHeader}>
          <h3>🕒 So'nggi buyurtmalar</h3>
          <button className={styles.viewAllButton}>Barchasini ko'rish</button>
        </div>
        <div className={styles.ordersTable}>
          <div className={styles.tableHeader}>
            <span>Buyurtma raqami</span>
            <span>Mijoz</span>
            <span>Summa</span>
            <span>Sana</span>
          </div>
          {analyticsData.recentOrders.map((order) => (
            <div key={order.id} className={styles.tableRow}>
              <span className={styles.orderNumber}>{order.orderNumber}</span>
              <span className={styles.customerName}>{order.customer}</span>
              <span className={styles.orderAmount}>{formatPrice(order.amount)}</span>
              <span className={styles.orderDate}>{formatDate(order.date)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
