import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createOrder } from '../endpoints/order';
import { fetchCart, selectCart, clearCartItems } from '../store/features/cartSlice';
import { RootState, AppDispatch } from '../store/store';
import styles from '../styles/Checkout.module.scss';

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux selectors
  const cart = useSelector(selectCart);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    paymentMethod: 'CASH_ON_DELIVERY',
    notes: ''
  });

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
      await dispatch(fetchCart()).unwrap();
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Savatchani yuklashda xatolik');
      router.push('/cart');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cart || cart.items.length === 0) {
      toast.error('Savatcha bo\'sh');
      return;
    }

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address) {
      toast.error('Barcha majburiy maydonlarni to\'ldiring');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: cart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price
        })),
        currency_id: 1,
        payment_method: formData.paymentMethod,
        notes: `
Mijoz: ${formData.firstName} ${formData.lastName}
Telefon: ${formData.phone}
Email: ${formData.email}
Manzil: ${formData.address}, ${formData.city}, ${formData.region}
Izoh: ${formData.notes}
        `.trim()
      };

      const order = await createOrder(orderData);
      
      // Clear cart after successful order
      await dispatch(clearCartItems());
      
      toast.success('Buyurtma muvaffaqiyatli yaratildi!');
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Buyurtma yaratishda xatolik');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!token) {
    return <div>Tizimga kirish kerak...</div>;
  }

  if (cart.loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yuklanmoqda...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyCart}>
          <h2>Savatcha bo'sh</h2>
          <p>Buyurtma berish uchun avval mahsulot qo'shing</p>
          <button onClick={() => router.push('/')}>
            Xarid qilishni davom ettirish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Buyurtma berish</h1>
      
      <div className={styles.checkoutContent}>
        <div className={styles.checkoutForm}>
          <form onSubmit={handleSubmit}>
            <div className={styles.section}>
              <h2>Shaxsiy ma'lumotlar</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Ism *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Familiya *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Telefon raqam *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+998 90 123 45 67"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                  />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2>Yetkazib berish manzili</h2>
              <div className={styles.formGroup}>
                <label>Manzil *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ko'cha, uy raqami"
                  required
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Shahar</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Toshkent"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Viloyat</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Toshkent viloyati"
                  />
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h2>To'lov usuli</h2>
              <div className={styles.paymentMethods}>
                <label className={styles.paymentOption}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={formData.paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={handleInputChange}
                  />
                  <span>Yetkazib berganda to'lash (naqd)</span>
                </label>
                <label className={styles.paymentOption}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD_ON_DELIVERY"
                    checked={formData.paymentMethod === 'CARD_ON_DELIVERY'}
                    onChange={handleInputChange}
                  />
                  <span>Yetkazib berganda to'lash (karta)</span>
                </label>
              </div>
            </div>

            <div className={styles.section}>
              <h2>Qo'shimcha izoh</h2>
              <div className={styles.formGroup}>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Buyurtma haqida qo'shimcha ma'lumot..."
                  rows={3}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.placeOrderBtn}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? 'Buyurtma berilmoqda...' : 'Buyurtma berish'}
            </button>
          </form>
        </div>

        <div className={styles.orderSummary}>
          <h3>Buyurtma xulosasi</h3>
          
          <div className={styles.orderItems}>
            {cart.items.map((item) => (
              <div key={item.id} className={styles.orderItem}>
                <span className={styles.itemName}>
                  {item.product.title} × {item.quantity}
                </span>
                <span className={styles.itemPrice}>
                  {(item.product.price * item.quantity).toLocaleString('uz-UZ')} so'm
                </span>
              </div>
            ))}
          </div>

          <div className={styles.summaryRow}>
            <span>Mahsulotlar ({cart.total_items} ta):</span>
            <span>{cart.total_amount.toLocaleString('uz-UZ')} so'm</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Yetkazib berish:</span>
            <span>Bepul</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Jami to'lov:</span>
            <span>{cart.total_amount.toLocaleString('uz-UZ')} so'm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
