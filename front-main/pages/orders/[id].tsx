import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { getOrderById } from '../../endpoints/order';
import styles from '../../styles/OrderDetails.module.scss';

interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    id: number;
    title: string;
    product_image: Array<{ url: string }>;
  };
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  final_amount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  currency: {
    symbol: string;
    name: string;
  };
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    if (id) {
      loadOrder();
    }
  }, [token, router, id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await getOrderById(Number(id));
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Buyurtmani yuklashda xatolik');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Kutilmoqda',
      'CONFIRMED': 'Tasdiqlandi',
      'PROCESSING': 'Tayyorlanmoqda',
      'SHIPPED': 'Yetkazilmoqda',
      'DELIVERED': 'Yetkazildi',
      'CANCELLED': 'Bekor qilindi'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'PENDING': '#f39c12',
      'CONFIRMED': '#3498db',
      'PROCESSING': '#9b59b6',
      'SHIPPED': '#e67e22',
      'DELIVERED': '#27ae60',
      'CANCELLED': '#e74c3c'
    };
    return colorMap[status] || '#95a5a6';
  };

  const getPaymentMethodText = (method: string) => {
    const methodMap: { [key: string]: string } = {
      'CASH_ON_DELIVERY': 'Yetkazib berganda naqd to\'lov',
      'CARD_ON_DELIVERY': 'Yetkazib berganda karta orqali',
      'ONLINE_PAYMENT': 'Onlayn to\'lov',
      'BANK_TRANSFER': 'Bank o\'tkazmasi'
    };
    return methodMap[method] || method;
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Kutilmoqda',
      'PAID': 'To\'landi',
      'FAILED': 'Muvaffaqiyatsiz',
      'REFUNDED': 'Qaytarildi'
    };
    return statusMap[status] || status;
  };

  if (!token) {
    return <div>Tizimga kirish kerak...</div>;
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Buyurtma yuklanmoqda...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h2>Buyurtma topilmadi</h2>
          <Link href="/orders" className={styles.backBtn}>
            Buyurtmalarga qaytish
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/orders" className={styles.backLink}>
          ← Buyurtmalarga qaytish
        </Link>
        <h1>Buyurtma #{order.order_number}</h1>
      </div>

      <div className={styles.orderContent}>
        <div className={styles.orderInfo}>
          <div className={styles.statusSection}>
            <div className={styles.statusCard}>
              <h3>Buyurtma holati</h3>
              <span 
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusText(order.status)}
              </span>
              <p className={styles.statusDate}>
                Oxirgi yangilanish: {new Date(order.updatedAt).toLocaleDateString('uz-UZ')}
              </p>
            </div>

            <div className={styles.paymentCard}>
              <h3>To'lov ma'lumotlari</h3>
              <p><strong>Usul:</strong> {getPaymentMethodText(order.payment_method)}</p>
              <p><strong>Holat:</strong> {getPaymentStatusText(order.payment_status)}</p>
            </div>
          </div>

          <div className={styles.orderItems}>
            <h3>Buyurtma tarkibi</h3>
            {order.items.map((item) => (
              <div key={item.id} className={styles.orderItem}>
                <div className={styles.itemImage}>
                  <img
                    src={item.product.product_image?.[0]?.url 
                      ? `${process.env.NEXT_PUBLIC_BASE_URL}/${item.product.product_image[0].url}`
                      : '/placeholder.svg'
                    }
                    alt={item.product.title}
                    width={80}
                    height={80}
                  />
                </div>
                
                <div className={styles.itemInfo}>
                  <h4>{item.product.title}</h4>
                  <p>Miqdor: {item.quantity} ta</p>
                  <p>Narx: {item.unit_price.toLocaleString('uz-UZ')} {order.currency?.symbol || 'so\'m'}</p>
                </div>
                
                <div className={styles.itemTotal}>
                  {item.total_price.toLocaleString('uz-UZ')} {order.currency?.symbol || 'so\'m'}
                </div>
              </div>
            ))}
          </div>

          {order.notes && (
            <div className={styles.orderNotes}>
              <h3>Qo'shimcha ma'lumot</h3>
              <p>{order.notes}</p>
            </div>
          )}
        </div>

        <div className={styles.orderSummary}>
          <h3>Buyurtma xulosasi</h3>
          
          <div className={styles.summaryRow}>
            <span>Mahsulotlar:</span>
            <span>{order.total_amount.toLocaleString('uz-UZ')} {order.currency?.symbol || 'so\'m'}</span>
          </div>
          
          {order.discount_amount > 0 && (
            <div className={styles.summaryRow}>
              <span>Chegirma:</span>
              <span>-{order.discount_amount.toLocaleString('uz-UZ')} {order.currency?.symbol || 'so\'m'}</span>
            </div>
          )}
          
          {order.tax_amount > 0 && (
            <div className={styles.summaryRow}>
              <span>Soliq:</span>
              <span>{order.tax_amount.toLocaleString('uz-UZ')} {order.currency?.symbol || 'so\'m'}</span>
            </div>
          )}
          
          <div className={styles.summaryRow}>
            <span>Yetkazib berish:</span>
            <span>{order.shipping_amount > 0 ? `${order.shipping_amount.toLocaleString('uz-UZ')} ${order.currency?.symbol || 'so\'m'}` : 'Bepul'}</span>
          </div>
          
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Jami to'lov:</span>
            <span>{order.final_amount.toLocaleString('uz-UZ')} {order.currency?.symbol || 'so\'m'}</span>
          </div>

          <div className={styles.orderDate}>
            <p><strong>Buyurtma sanasi:</strong></p>
            <p>{new Date(order.createdAt).toLocaleDateString('uz-UZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
