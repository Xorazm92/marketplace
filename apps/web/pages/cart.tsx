import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../endpoints/cart';
import { createOrder } from '../endpoints/order';
import styles from '../styles/Cart.module.scss';

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: string;
    product_image: Array<{ url: string }>;
    currency: { symbol: string };
  };
}

interface Cart {
  id: number;
  items: CartItem[];
  total_amount: number;
  total_items: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadCart();
  }, [token, router]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cartData = await getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Savatchani yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(cartItemId);
      await updateCartItem(cartItemId, newQuantity);
      await loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeFromCart(cartItemId);
      await loadCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Savatchani tozalashni xohlaysizmi?')) {
      try {
        await clearCart();
        await loadCart();
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Savatcha bo\'sh');
      return;
    }

    setIsCheckingOut(true);
    try {
      const orderData = {
        items: cart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.product.price)
        })),
        currency_id: 1, // Default currency
        payment_method: 'CASH_ON_DELIVERY',
        notes: 'Online order from INBOLA marketplace'
      };

      const order = await createOrder(orderData);
      toast.success('Buyurtma muvaffaqiyatli yaratildi!');
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Buyurtma yaratishda xatolik');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!token) {
    return <div>Tizimga kirish kerak...</div>;
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Savatcha yuklanmoqda...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h2>Savatcha bo'sh</h2>
          <p>Hozircha hech qanday mahsulot qo'shilmagan</p>
          <Link href="/" className={styles.continueShoppingBtn}>
            Xarid qilishni davom ettirish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Savatcha ({cart.total_items} ta mahsulot)</h1>
        <button onClick={handleClearCart} className={styles.clearBtn}>
          Hammasini tozalash
        </button>
      </div>

      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {cart.items.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <div className={styles.productImage}>
                <Image
                  src={item.product.product_image?.[0]?.url 
                    ? `${process.env.NEXT_PUBLIC_BASE_URL}/${item.product.product_image[0].url}`
                    : '/placeholder.svg'
                  }
                  alt={item.product.title}
                  width={100}
                  height={100}
                />
              </div>
              
              <div className={styles.productInfo}>
                <h3>{item.product.title}</h3>
                <p className={styles.price}>
                  {parseInt(item.product.price).toLocaleString('uz-UZ')} {item.product.currency?.symbol || 'so\'m'}
                </p>
              </div>

              <div className={styles.quantityControls}>
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={updating === item.id || item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  disabled={updating === item.id}
                >
                  +
                </button>
              </div>

              <div className={styles.itemTotal}>
                {(parseInt(item.product.price) * item.quantity).toLocaleString('uz-UZ')} so'm
              </div>

              <button 
                onClick={() => handleRemoveItem(item.id)}
                className={styles.removeBtn}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className={styles.cartSummary}>
          <h3>Buyurtma xulosasi</h3>
          <div className={styles.summaryRow}>
            <span>Mahsulotlar ({cart.total_items} ta):</span>
            <span>{cart.total_amount.toLocaleString('uz-UZ')} so'm</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Yetkazib berish:</span>
            <span>Bepul</span>
          </div>
          <div className={styles.summaryRow + ' ' + styles.total}>
            <span>Jami:</span>
            <span>{cart.total_amount.toLocaleString('uz-UZ')} so'm</span>
          </div>
          
          <button 
            onClick={handleCheckout}
            className={styles.checkoutBtn}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? 'Buyurtma berilmoqda...' : 'Buyurtma berish'}
          </button>
          
          <Link href="/" className={styles.continueShoppingBtn}>
            Xarid qilishni davom ettirish
          </Link>
        </div>
      </div>
    </div>
  );
}
