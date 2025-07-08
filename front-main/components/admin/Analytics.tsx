import React from 'react';
import styles from './Analytics.module.scss';

const Analytics: React.FC = () => {
  return (
    <div className={styles.analytics}>
      <h2>Analitika va hisobotlar</h2>
      <div className={styles.comingSoon}>
        <div className={styles.icon}>📊</div>
        <h3>Tez orada...</h3>
        <p>Analitika bo'limi ishlab chiqilmoqda</p>
      </div>
    </div>
  );
};

export default Analytics;
