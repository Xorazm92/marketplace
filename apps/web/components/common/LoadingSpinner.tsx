import React from 'react';
import styles from './LoadingSpinner.module.scss';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'Yuklanmoqda...', 
  className = '' 
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.bounce1}></div>
        <div className={styles.bounce2}></div>
        <div className={styles.bounce3}></div>
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
