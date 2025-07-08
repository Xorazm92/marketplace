import React, { useState } from 'react';
import styles from './OrderManagement.module.scss';

interface Order {
  id: number;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  total: number;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'INB-2024-001',
    customer: {
      name: 'Malika Karimova',
      email: 'malika@example.com',
      phone: '+998 90 123 45 67'
    },
    items: [
      {
        id: 1,
        productId: 1,
        title: 'Bolalar uchun rangli qalam to\'plami',
        price: 45000,
        quantity: 2,
        total: 90000
      }
    ],
    total: 90000,
    status: 'pending',
    paymentMethod: 'Naqd pul',
    paymentStatus: 'pending',
    shippingAddress: 'Toshkent sh., Yunusobod t., 15-uy',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 2,
    orderNumber: 'INB-2024-002',
    customer: {
      name: 'Akmal Toshmatov',
      email: 'akmal@example.com',
      phone: '+998 91 234 56 78'
    },
    items: [
      {
        id: 2,
        productId: 2,
        title: 'Yumshoq ayiq o\'yinchoq',
        price: 120000,
        quantity: 1,
        total: 120000
      }
    ],
    total: 120000,
    status: 'processing',
    paymentMethod: 'Plastik karta',
    paymentStatus: 'paid',
    shippingAddress: 'Toshkent sh., Mirzo Ulug\'bek t., 25-uy',
    createdAt: '2024-01-19T14:15:00Z',
    updatedAt: '2024-01-20T09:00:00Z'
  }
];

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const statusOptions = [
    { value: 'pending', label: 'Kutilmoqda', color: '#f39c12' },
    { value: 'processing', label: 'Tayyorlanmoqda', color: '#3498db' },
    { value: 'shipped', label: 'Yo\'lda', color: '#9b59b6' },
    { value: 'delivered', label: 'Yetkazildi', color: '#27ae60' },
    { value: 'cancelled', label: 'Bekor qilindi', color: '#e74c3c' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Kutilmoqda', color: '#f39c12' },
    { value: 'paid', label: 'To\'langan', color: '#27ae60' },
    { value: 'failed', label: 'Muvaffaqiyatsiz', color: '#e74c3c' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status: string, type: 'order' | 'payment') => {
    const options = type === 'order' ? statusOptions : paymentStatusOptions;
    return options.find(option => option.value === status) || options[0];
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
        : order
    ));
  };

  const handlePaymentStatusChange = (orderId: number, newPaymentStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, paymentStatus: newPaymentStatus as any, updatedAt: new Date().toISOString() }
        : order
    ));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || order.status === filterStatus;
    const matchesPayment = !filterPayment || order.paymentStatus === filterPayment;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className={styles.orderManagement}>
      <div className={styles.header}>
        <h2>Buyurtma boshqaruvi</h2>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{orders.length}</span>
            <span className={styles.statLabel}>Jami buyurtmalar</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {orders.filter(o => o.status === 'pending').length}
            </span>
            <span className={styles.statLabel}>Kutilayotgan</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {orders.filter(o => o.paymentStatus === 'pending').length}
            </span>
            <span className={styles.statLabel}>To'lov kutilmoqda</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Buyurtma qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Barcha holatlar</option>
          {statusOptions.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Barcha to'lovlar</option>
          {paymentStatusOptions.map(payment => (
            <option key={payment.value} value={payment.value}>{payment.label}</option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className={styles.ordersTable}>
        <div className={styles.tableHeader}>
          <span>Buyurtma</span>
          <span>Mijoz</span>
          <span>Jami</span>
          <span>Holat</span>
          <span>To'lov</span>
          <span>Sana</span>
          <span>Amallar</span>
        </div>

        {filteredOrders.map((order) => {
          const statusInfo = getStatusInfo(order.status, 'order');
          const paymentInfo = getStatusInfo(order.paymentStatus, 'payment');
          
          return (
            <div key={order.id} className={styles.tableRow}>
              <div className={styles.orderInfo}>
                <span className={styles.orderNumber}>{order.orderNumber}</span>
                <span className={styles.itemCount}>{order.items.length} mahsulot</span>
              </div>

              <div className={styles.customerInfo}>
                <span className={styles.customerName}>{order.customer.name}</span>
                <span className={styles.customerEmail}>{order.customer.email}</span>
              </div>

              <span className={styles.orderTotal}>{formatPrice(order.total)}</span>

              <div className={styles.orderStatus}>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className={styles.statusSelect}
                  style={{ color: statusInfo.color }}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.paymentStatus}>
                <select
                  value={order.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                  className={styles.statusSelect}
                  style={{ color: paymentInfo.color }}
                >
                  {paymentStatusOptions.map(payment => (
                    <option key={payment.value} value={payment.value}>
                      {payment.label}
                    </option>
                  ))}
                </select>
              </div>

              <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>

              <div className={styles.orderActions}>
                <button 
                  className={styles.viewButton}
                  onClick={() => setSelectedOrder(order)}
                >
                  👁️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>Buyurtmalar topilmadi</h3>
          <p>Qidiruv shartlariga mos buyurtmalar yo'q.</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className={styles.orderModal}>
          <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Buyurtma tafsilotlari - {selectedOrder.orderNumber}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.orderDetailsGrid}>
                <div className={styles.customerSection}>
                  <h4>Mijoz ma'lumotlari</h4>
                  <p><strong>Ism:</strong> {selectedOrder.customer.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                  <p><strong>Telefon:</strong> {selectedOrder.customer.phone}</p>
                  <p><strong>Manzil:</strong> {selectedOrder.shippingAddress}</p>
                </div>

                <div className={styles.orderSection}>
                  <h4>Buyurtma ma'lumotlari</h4>
                  <p><strong>Raqam:</strong> {selectedOrder.orderNumber}</p>
                  <p><strong>Holat:</strong> 
                    <span style={{ color: getStatusInfo(selectedOrder.status, 'order').color }}>
                      {getStatusInfo(selectedOrder.status, 'order').label}
                    </span>
                  </p>
                  <p><strong>To'lov usuli:</strong> {selectedOrder.paymentMethod}</p>
                  <p><strong>To'lov holati:</strong> 
                    <span style={{ color: getStatusInfo(selectedOrder.paymentStatus, 'payment').color }}>
                      {getStatusInfo(selectedOrder.paymentStatus, 'payment').label}
                    </span>
                  </p>
                  <p><strong>Yaratilgan:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Yangilangan:</strong> {formatDate(selectedOrder.updatedAt)}</p>
                </div>
              </div>

              <div className={styles.itemsSection}>
                <h4>Buyurtma mahsulotlari</h4>
                <div className={styles.itemsList}>
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className={styles.orderItem}>
                      <div className={styles.itemInfo}>
                        <h5>{item.title}</h5>
                        <p>{formatPrice(item.price)} × {item.quantity}</p>
                      </div>
                      <div className={styles.itemTotal}>
                        {formatPrice(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.orderTotalSection}>
                  <strong>Jami: {formatPrice(selectedOrder.total)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
