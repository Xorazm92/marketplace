import React from 'react';
import styles from './Settings.module.scss';

const Settings: React.FC = () => {
  return (
    <div className={styles.settings}>
      <h2>Tizim sozlamalari</h2>
      <div className={styles.comingSoon}>
        <div className={styles.icon}>⚙️</div>
        <h3>Tez orada...</h3>
        <p>Sozlamalar bo'limi ishlab chiqilmoqda</p>
      </div>
    </div>
  );
};

export default Settings;
