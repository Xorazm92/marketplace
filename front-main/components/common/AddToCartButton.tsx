import React, { useState } from 'react';
import { FiShoppingCart, FiLoader } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import styles from './AddToCartButton.module.scss';

export interface AddToCartButtonProps {
  product: {
    id: number;
    title: string;
    price: string | number;
    image: string;
  };
  quantity?: number;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
  onAdd?: (success: boolean) => void;
  children?: React.ReactNode;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  quantity = 1,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  onAdd,
  children
}) => {
  const { addItem, loading } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;

    setIsAdding(true);
    try {
      await addItem({
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: quantity
      });

      onAdd?.(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      onAdd?.(false);
    } finally {
      setIsAdding(false);
    }
  };

  const isLoading = loading || isAdding;

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isLoading}
      className={`${styles.addToCartBtn} ${styles[variant]} ${styles[size]} ${className} ${
        disabled || isLoading ? styles.disabled : ''
      }`}
      aria-label={`Add ${product.title} to cart`}
    >
      {isLoading ? (
        <FiLoader className={styles.loadingIcon} />
      ) : (
        <FiShoppingCart className={styles.cartIcon} />
      )}

      {children || 'Savatga qo\'shish'}

      {isLoading && (
        <span className={styles.loadingText}>Qo'shilmoqda...</span>
      )}
    </button>
  );
};

export default AddToCartButton;
