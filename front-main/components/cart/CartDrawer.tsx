
import React, { useState, useEffect } from 'react';
import styles from './CartDrawer.module.scss';
import { useCart } from '../../hooks/useCart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateCartItem, removeFromCart, clearCart, loading } = useCart();

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItem(itemId, quantity);
    }
  };

  const getTotalPrice = () => {
    return cart?.items?.reduce((total, item) => {
      return total + (parseFloat(item.product.price.toString()) * item.quantity);
    }, 0) || 0;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Savat</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>Yuklanmoqda...</div>
          ) : !cart?.items?.length ? (
            <div className={styles.empty}>
              <p>Savat bo'sh</p>
            </div>
          ) : (
            <>
              <div className={styles.items}>
                {cart.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <img 
                      src={item.product.product_image?.[0]?.url || '/placeholder-product.jpg'} 
                      alt={item.product.title}
                      className={styles.image}
                    />
                    <div className={styles.details}>
                      <h4>{item.product.title}</h4>
                      <p className={styles.price}>
                        {parseFloat(item.product.price.toString()).toLocaleString()} so'm
                      </p>
                      <div className={styles.quantity}>
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className={styles.qtyBtn}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className={styles.qtyBtn}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className={styles.removeBtn}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.footer}>
                <div className={styles.total}>
                  <strong>Jami: {getTotalPrice().toLocaleString()} so'm</strong>
                </div>
                <div className={styles.actions}>
                  <button onClick={clearCart} className={styles.clearBtn}>
                    Savatni tozalash
                  </button>
                  <button className={styles.checkoutBtn}>
                    Buyurtma berish
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
