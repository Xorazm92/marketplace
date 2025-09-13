import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { getOrders } from '../../endpoints/order';
import styles from '../../styles/Orders.module.scss';

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  final_amount: number;
  createdAt: string;
  items: Array<{
    id: number;
    quantity: number;
    unit_price: number;
    product: {
      id: number;
      title: string;
    };
  }>;
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  totalPages: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, [token, router, currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response: OrdersResponse = await getOrders(currentPage, 10, statusFilter);
      setOrders(response.orders);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Buyurtmalarni yuklashda xatolik');
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
        <div className={styles.loading}>Buyurtmalar yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Mening buyurtmalarim</h1>
        
        <div className={styles.filters}>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusFilter}
          >
            <option value="">Barcha buyurtmalar</option>
            <option value="PENDING">Kutilmoqda</option>
            <option value="CONFIRMED">Tasdiqlandi</option>
            <option value="PROCESSING">Tayyorlanmoqda</option>
            <option value="SHIPPED">Yetkazilmoqda</option>
            <option value="DELIVERED">Yetkazildi</option>
            <option value="CANCELLED">Bekor qilindi</option>
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyOrders}>
          <h2>Buyurtmalar topilmadi</h2>
          <p>Hozircha hech qanday buyurtma bermagansiz</p>
          <Link href="/" className={styles.shopNowBtn}>
            Xarid qilish
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <h3>Buyurtma #{order.order_number}</h3>
                    <p className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className={styles.orderStatus}>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className={styles.orderItems}>
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className={styles.orderItem}>
                      <span>{item.product.title}</span>
                      <span>× {item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className={styles.moreItems}>
                      +{order.items.length - 3} ta ko'proq mahsulot
                    </div>
                  )}
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.orderTotal}>
                    <span className={styles.totalLabel}>Jami:</span>
                    <span className={styles.totalAmount}>
                      {order.final_amount.toLocaleString('uz-UZ')} so'm
                    </span>
                  </div>
                  
                  <div className={styles.paymentStatus}>
                    To'lov: {getPaymentStatusText(order.payment_status)}
                  </div>
                  
                  <Link 
                    href={`/orders/${order.id}`}
                    className={styles.viewOrderBtn}
                  >
                    Batafsil ko'rish
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={styles.paginationBtn}
              >
                Oldingi
              </button>
              
              <span className={styles.pageInfo}>
                {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={styles.paginationBtn}
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
