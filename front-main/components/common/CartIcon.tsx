import React from 'react';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import styles from './CartIcon.module.scss';

export interface CartIconProps {
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  className?: string;
  href?: string;
}

const CartIcon: React.FC<CartIconProps> = ({
  size = 'medium',
  showCount = true,
  className = '',
  href = '/cart'
}) => {
  const { itemCount, loading } = useCart();

  return (
    <Link
      href={href}
      className={`${styles.cartIcon} ${styles[size]} ${className}`}
      aria-label={`Cart - ${itemCount} items`}
    >
      <FiShoppingCart className={styles.icon} />

      {showCount && (
        <span className={`${styles.count} ${loading ? styles.loading : ''}`}>
          {loading ? '...' : itemCount > 99 ? '99+' : itemCount}
        </span>
      )}

      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
        </div>
      )}
    </Link>
  );
};

export default CartIcon;
