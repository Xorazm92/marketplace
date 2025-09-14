import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/marketplace/Header';
import { verifyClickPayment, verifyPaymePayment } from '../../endpoints/payment';
import { getOrderById } from '../../endpoints/order';
import styles from '../../styles/PaymentSuccess.module.scss';

interface Order {
  id: number;
  order_number: string;
  final_amount: number;
  status: string;
  payment_status: string;
  items: any[];
}

const PaymentSuccessPage: React.FC = () => {
  const router = useRouter();
  const { order_id, payment_id, status, method } = router.query;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (order_id && payment_id && status && method) {
      verifyPayment();
      loadOrder();
    }
  }, [order_id, payment_id, status, method]);

  const verifyPayment = async () => {
    try {
      setIsVerifying(true);
      let result;

      if (method === 'click') {
        result = await verifyClickPayment(payment_id as string, status as string);
      } else if (method === 'payme') {
        result = await verifyPaymePayment(payment_id as string, status as string);
      } else {
        throw new Error('Noto\'g\'ri to\'lov usuli');
      }

      setVerificationResult({
        success: result.success || status === 'success',
        message: result.message || 'To\'lov muvaffaqiyatli amalga oshirildi'
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      setVerificationResult({
        success: false,
        message: 'To\'lovni tekshirishda xatolik yuz berdi'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const loadOrder = async () => {
    try {
      const orderData = await getOrderById(Number(order_id));
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    }
  };

  if (isVerifying) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.verifying}>
          <div className={styles.spinner}></div>
          <h2>To'lov tekshirilmoqda...</h2>
          <p>Iltimos, kuting...</p>
        </div>
      </div>
    );
  }

  const isSuccess = verificationResult?.success && status === 'success';

  return (
    <>
      <Head>
        <title>{isSuccess ? 'To\'lov muvaffaqiyatli' : 'To\'lov xatosi'} - INBOLA</title>
        <meta name="description" content="To'lov natijasi" />
      </Head>

      <div className={styles.container}>
        <Header />
        
        <main className={styles.main}>
          <div className={styles.resultContainer}>
            <div className={`${styles.resultCard} ${isSuccess ? styles.success : styles.error}`}>
              <div className={styles.icon}>
                {isSuccess ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <h1>{isSuccess ? 'To\'lov muvaffaqiyatli!' : 'To\'lov amalga oshmadi'}</h1>
              
              <p className={styles.message}>
                {verificationResult?.message || 'To\'lov natijasi noma\'lum'}
              </p>

              {order && (
                <div className={styles.orderDetails}>
                  <h3>Buyurtma ma'lumotlari</h3>
                  <div className={styles.orderInfo}>
                    <p><strong>Buyurtma raqami:</strong> {order.order_number}</p>
                    <p><strong>Summa:</strong> {order.final_amount.toLocaleString()} so'm</p>
                    <p><strong>Holat:</strong> {order.status}</p>
                    <p><strong>To'lov holati:</strong> {order.payment_status}</p>
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                {isSuccess ? (
                  <>
                    <Link href={`/orders/${order?.id}`} className={styles.primaryButton}>
                      Buyurtmani ko'rish
                    </Link>
                    <Link href="/orders" className={styles.secondaryButton}>
                      Barcha buyurtmalar
                    </Link>
                    <Link href="/" className={styles.secondaryButton}>
                      Bosh sahifa
                    </Link>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => router.push(`/payment?order_id=${order_id}`)}
                      className={styles.primaryButton}
                    >
                      Qayta to'lash
                    </button>
                    <Link href="/orders" className={styles.secondaryButton}>
                      Buyurtmalar
                    </Link>
                    <Link href="/" className={styles.secondaryButton}>
                      Bosh sahifa
                    </Link>
                  </>
                )}
              </div>

              {isSuccess && (
                <div className={styles.nextSteps}>
                  <h4>Keyingi qadamlar:</h4>
                  <ul>
                    <li>Buyurtmangiz tasdiqlandi va ishlov berilmoqda</li>
                    <li>Tez orada sizga SMS orqali xabar yuboriladi</li>
                    <li>Buyurtma holatini "Mening buyurtmalarim" bo'limida kuzatishingiz mumkin</li>
                    <li>Savollar bo'lsa, qo'llab-quvvatlash xizmatiga murojaat qiling</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PaymentSuccessPage;
