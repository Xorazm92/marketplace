import React from 'react';
import Image from 'next/image';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import styles from './CartItem.module.scss';

export interface CartItemProps {
  item: {
    id: number;
    product_id: number;
    title: string;
    price: string | number;
    quantity: number;
    image: string;
    currency?: { symbol: string };
    variant?: any;
  };
  showControls?: boolean;
  showRemove?: boolean;
  className?: string;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  showControls = true,
  showRemove = true,
  className = ''
}) => {
  const { updateItemQuantity, removeItem, loading } = useCart();

  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('uz-UZ');
  };

  const getCurrencySymbol = (): string => {
    return item.currency?.symbol || 'so\'m';
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateItemQuantity(item.id, newQuantity);
  };

  const handleRemove = async () => {
    await removeItem(item.id);
  };

  const itemTotal = (typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity;

  return (
    <div className={`${styles.cartItem} ${className}`}>
      {/* Product Image */}
      <div className={styles.imageContainer}>
        <Image
          src={item.image || '/images/placeholder-product.jpg'}
          alt={item.title}
          width={80}
          height={80}
          className={styles.image}
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Product Info */}
      <div className={styles.productInfo}>
        <h3 className={styles.title}>{item.title}</h3>
        <div className={styles.priceInfo}>
          <span className={styles.price}>
            {formatPrice(item.price)} {getCurrencySymbol()}
          </span>
          {showControls && (
            <span className={styles.unitPrice}>
              (1 dona uchun)
            </span>
          )}
        </div>
        {item.variant && (
          <div className={styles.variant}>
            Variant: {item.variant.name || 'Noma\'lum'}
          </div>
        )}
      </div>

      {/* Quantity Controls */}
      {showControls && (
        <div className={styles.quantityControls}>
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={loading || item.quantity <= 1}
            className={styles.quantityBtn}
            aria-label="Kamaytirish"
          >
            <FiMinus size={16} />
          </button>

          <span className={styles.quantity}>
            {loading ? '...' : item.quantity}
          </span>

          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={loading}
            className={styles.quantityBtn}
            aria-label="Ko'paytirish"
          >
            <FiPlus size={16} />
          </button>
        </div>
      )}

      {/* Total Price */}
      <div className={styles.totalPrice}>
        <span className={styles.totalAmount}>
          {formatPrice(itemTotal)} {getCurrencySymbol()}
        </span>
        {showControls && (
          <span className={styles.totalLabel}>
            Jami
          </span>
        )}
      </div>

      {/* Remove Button */}
      {showRemove && (
        <button
          onClick={handleRemove}
          disabled={loading}
          className={styles.removeBtn}
          aria-label="Olib tashlash"
        >
          <FiTrash2 size={18} />
        </button>
      )}
    </div>
  );
};

export default CartItem;
