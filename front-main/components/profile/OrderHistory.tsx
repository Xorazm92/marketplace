import React, { useState } from 'react';
import Link from 'next/link';
import styles from './OrderHistory.module.scss';

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
}

interface OrderItem {
  id: number;
  productId: number;
  title: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

interface OrderHistoryProps {
  userId: number;
}

// Mock data - real loyihada API dan keladi
const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'INB-2024-001',
    date: '2024-01-20',
    status: 'Yetkazildi',
    total: 125000,
    shippingAddress: 'Toshkent sh., Yunusobod t., 15-uy',
    paymentMethod: 'Naqd pul',
    items: [
      {
        id: 1,
        productId: 1,
        title: 'Bolalar uchun rangli qalam to\'plami',
        image: '/img/products/colored-pencils.jpg',
        price: 45000,
        quantity: 2,
        total: 90000
      },
      {
        id: 2,
        productId: 2,
        title: 'Maktab daftari',
        image: '/img/products/notebook.jpg',
        price: 35000,
        quantity: 1,
        total: 35000
      }
    ]
  },
  {
    id: 2,
    orderNumber: 'INB-2024-002',
    date: '2024-01-18',
    status: 'Yo\'lda',
    total: 89000,
    shippingAddress: 'Toshkent sh., Mirzo Ulug\'bek t., 25-uy',
    paymentMethod: 'Plastik karta',
    items: [
      {
        id: 3,
        productId: 3,
        title: 'Yumshoq ayiq o\'yinchoq',
        image: '/img/products/teddy-bear.jpg',
        price: 89000,
        quantity: 1,
        total: 89000
      }
    ]
  },
  {
    id: 3,
    orderNumber: 'INB-2024-003',
    date: '2024-01-15',
    status: 'Tayyorlanmoqda',
    total: 156000,
    shippingAddress: 'Toshkent sh., Shayxontohur t., 8-uy',
    paymentMethod: 'Online to\'lov',
    items: [
      {
        id: 4,
        productId: 4,
        title: 'Bolalar velosipedi',
        image: '/img/products/bicycle.jpg',
        price: 156000,
        quantity: 1,
        total: 156000
      }
    ]
  }
];

const OrderHistory: React.FC<OrderHistoryProps> = ({ userId }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Yetkazildi':
        return '#27ae60';
      case 'Yo\'lda':
        return '#f39c12';
      case 'Tayyorlanmoqda':
        return '#3498db';
      case 'Bekor qilingan':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Yetkazildi':
        return '✅';
      case 'Yo\'lda':
        return '🚚';
      case 'Tayyorlanmoqda':
        return '📦';
      case 'Bekor qilingan':
        return '❌';
      default:
        return '📋';
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === statusFilter);

  const statusOptions = [
    { value: 'all', label: 'Barchasi' },
    { value: 'Tayyorlanmoqda', label: 'Tayyorlanmoqda' },
    { value: 'Yo\'lda', label: 'Yo\'lda' },
    { value: 'Yetkazildi', label: 'Yetkazildi' },
    { value: 'Bekor qilingan', label: 'Bekor qilingan' }
  ];

  return (
    <div className={styles.orderHistory}>
      <div className={styles.header}>
        <h2>Buyurtmalar tarixi</h2>
        <div className={styles.filters}>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.statusFilter}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>Buyurtmalar topilmadi</h3>
          <p>Hozircha {statusFilter === 'all' ? 'hech qanday' : statusFilter} buyurtmalar yo'q.</p>
          <Link href="/search" className={styles.shopButton}>
            Xarid qilishni boshlash
          </Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderNumber}>{order.orderNumber}</span>
                  <span className={styles.orderDate}>{formatDate(order.date)}</span>
                </div>
                <div className={styles.orderStatus}>
                  <span 
                    className={styles.statusBadge}
                    style={{ 
                      backgroundColor: getStatusColor(order.status) + '20',
                      color: getStatusColor(order.status)
                    }}
                  >
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </div>
              </div>

              <div className={styles.orderItems}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.orderItem}>
                    <div className={styles.itemImage}>
                      <div className={styles.imagePlaceholder}>
                        📦
                      </div>
                    </div>
                    <div className={styles.itemDetails}>
                      <h4 className={styles.itemTitle}>{item.title}</h4>
                      <p className={styles.itemPrice}>
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className={styles.itemTotal}>
                      {formatPrice(item.total)}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderFooter}>
                <div className={styles.orderTotal}>
                  <span className={styles.totalLabel}>Jami:</span>
                  <span className={styles.totalAmount}>{formatPrice(order.total)}</span>
                </div>
                <div className={styles.orderActions}>
                  <button 
                    className={styles.detailsButton}
                    onClick={() => setSelectedOrder(order)}
                  >
                    Batafsil
                  </button>
                  {order.status === 'Yetkazildi' && (
                    <button className={styles.reorderButton}>
                      Qayta buyurtma
                    </button>
                  )}
                  {(order.status === 'Tayyorlanmoqda' || order.status === 'Yo\'lda') && (
                    <button className={styles.trackButton}>
                      Kuzatish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className={styles.orderModal}>
          <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Buyurtma tafsilotlari</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.orderDetails}>
                <p><strong>Buyurtma raqami:</strong> {selectedOrder.orderNumber}</p>
                <p><strong>Sana:</strong> {formatDate(selectedOrder.date)}</p>
                <p><strong>Holat:</strong> {selectedOrder.status}</p>
                <p><strong>Yetkazib berish manzili:</strong> {selectedOrder.shippingAddress}</p>
                <p><strong>To'lov usuli:</strong> {selectedOrder.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
