import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/marketplace/Header';
import { processPayment, getPaymentMethods } from '../endpoints/payment';
import { getOrderById } from '../endpoints/order';
import styles from '../styles/Payment.module.scss';

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  icon: string;
  description: string;
}

interface Order {
  id: number;
  order_number: string;
  final_amount: number;
  items: any[];
  user: any;
}

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const { order_id } = router.query;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  useEffect(() => {
    if (order_id) {
      loadOrder();
      loadPaymentMethods();
    }
  }, [order_id]);

  const loadOrder = async () => {
    try {
      setIsLoadingOrder(true);
      const orderData = await getOrderById(Number(order_id));
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
      
      // Default payment methods if API doesn't return any
      if (!methods || methods.length === 0) {
        setPaymentMethods([
          {
            id: 1,
            name: 'Click',
            type: 'click',
            icon: '/icons/click.png',
            description: 'Click orqali to\'lov'
          },
          {
            id: 2,
            name: 'Payme',
            type: 'payme',
            icon: '/icons/payme.png',
            description: 'Payme orqali to\'lov'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Set default methods on error
      setPaymentMethods([
        {
          id: 1,
          name: 'Click',
          type: 'click',
          icon: '/icons/click.png',
          description: 'Click orqali to\'lov'
        },
        {
          id: 2,
          name: 'Payme',
          type: 'payme',
          icon: '/icons/payme.png',
          description: 'Payme orqali to\'lov'
        }
      ]);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod || !order) {
      alert('Iltimos, to\'lov usulini tanlang');
      return;
    }

    try {
      setIsLoading(true);
      
      const paymentData = {
        order_id: order.id,
        amount: order.final_amount,
        return_url: `${window.location.origin}/payment/success?order_id=${order.id}`,
        description: `Buyurtma #${order.order_number} uchun to'lov`,
      };

      await processPayment(selectedMethod as 'click' | 'payme', paymentData);
    } catch (error) {
      console.error('Error processing payment:', error);
      setIsLoading(false);
    }
  };

  if (isLoadingOrder) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Buyurtma ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.error}>
          <h2>Buyurtma topilmadi</h2>
          <button onClick={() => router.push('/orders')}>
            Buyurtmalar ro'yxatiga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>To'lov - INBOLA</title>
        <meta name="description" content="Buyurtma uchun to'lov qilish" />
      </Head>

      <div className={styles.container}>
        <Header />
        
        <main className={styles.main}>
          <div className={styles.paymentContainer}>
            <div className={styles.orderSummary}>
              <h2>Buyurtma ma'lumotlari</h2>
              <div className={styles.orderInfo}>
                <p><strong>Buyurtma raqami:</strong> {order.order_number}</p>
                <p><strong>Jami summa:</strong> {order.final_amount.toLocaleString()} so'm</p>
                <p><strong>Mahsulotlar soni:</strong> {order.items?.length || 0}</p>
              </div>
            </div>

            <div className={styles.paymentMethods}>
              <h2>To'lov usulini tanlang</h2>
              <div className={styles.methodsList}>
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`${styles.methodCard} ${
                      selectedMethod === method.type ? styles.selected : ''
                    }`}
                    onClick={() => setSelectedMethod(method.type)}
                  >
                    <div className={styles.methodIcon}>
                      <img src={method.icon} alt={method.name} />
                    </div>
                    <div className={styles.methodInfo}>
                      <h3>{method.name}</h3>
                      <p>{method.description}</p>
                    </div>
                    <div className={styles.methodRadio}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.type}
                        checked={selectedMethod === method.type}
                        onChange={() => setSelectedMethod(method.type)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.paymentActions}>
              <button
                className={styles.backButton}
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Orqaga
              </button>
              <button
                className={styles.payButton}
                onClick={handlePayment}
                disabled={!selectedMethod || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    To'lov qilinmoqda...
                  </>
                ) : (
                  `${order.final_amount.toLocaleString()} so'm to'lash`
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PaymentPage;
