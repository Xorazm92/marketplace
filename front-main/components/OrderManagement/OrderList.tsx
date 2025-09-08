import React, { useState, useEffect } from 'react';
import { Order } from '../../types/order.types';
import { getOrders } from '../../endpoints/order';
import OrderTracking from './OrderTracking';
import OrderCancellation from './OrderCancellation';

interface OrderListProps {
  userId?: number;
  isAdmin?: boolean;
}

const OrderList: React.FC<OrderListProps> = ({ userId, isAdmin = false }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [showCancellation, setShowCancellation] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const limit = 10;

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders(currentPage, limit, statusFilter);
      setOrders(response.orders);
      setTotalOrders(response.total);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleTrackOrder = (orderId: number) => {
    setSelectedOrderId(orderId);
    setShowTracking(true);
  };

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order);
    setShowCancellation(true);
  };

  const handleOrderCancelled = () => {
    setShowCancellation(false);
    setOrderToCancel(null);
    loadOrders(); // Refresh the list
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': '#ffc107',
      'CONFIRMED': '#17a2b8',
      'PROCESSING': '#007bff',
      'SHIPPED': '#6f42c1',
      'DELIVERED': '#28a745',
      'CANCELLED': '#dc3545'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'PENDING': 'Kutilmoqda',
      'CONFIRMED': 'Tasdiqlandi',
      'PROCESSING': 'Tayyorlanmoqda',
      'SHIPPED': 'Yuborildi',
      'DELIVERED': 'Yetkazildi',
      'CANCELLED': 'Bekor qilindi'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const totalPages = Math.ceil(totalOrders / limit);

  return (
    <div className="order-list-container">
      <div className="order-list-header">
        <h2>{isAdmin ? 'Barcha buyurtmalar' : 'Mening buyurtmalarim'}</h2>
        
        <div className="filters">
          <select 
            value={statusFilter} 
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="status-filter"
          >
            <option value="">Barcha holatlar</option>
            <option value="PENDING">Kutilmoqda</option>
            <option value="CONFIRMED">Tasdiqlandi</option>
            <option value="PROCESSING">Tayyorlanmoqda</option>
            <option value="SHIPPED">Yuborildi</option>
            <option value="DELIVERED">Yetkazildi</option>
            <option value="CANCELLED">Bekor qilindi</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-id">#{order.id}</div>
                  <div 
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="order-info">
                  <div className="order-date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div className="order-total">
                    {order.final_amount.toLocaleString()} so'm
                  </div>
                </div>

                <div className="order-items">
                  <div className="items-count">
                    {order.items.length} ta mahsulot
                  </div>
                  <div className="items-preview">
                    {order.items.slice(0, 2).map((item) => (
                      <span key={item.id} className="item-name">
                        {item.product.name}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="more-items">
                        +{order.items.length - 2} boshqa
                      </span>
                    )}
                  </div>
                </div>

                <div className="order-actions">
                  <button
                    className="btn-track"
                    onClick={() => handleTrackOrder(order.id)}
                  >
                    Kuzatish
                  </button>
                  
                  {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                    <button
                      className="btn-cancel"
                      onClick={() => handleCancelOrder(order)}
                    >
                      Bekor qilish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Oldingi
              </button>
              
              <span className="pagination-info">
                {currentPage} / {totalPages} sahifa ({totalOrders} ta buyurtma)
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      )}

      {showTracking && selectedOrderId && (
        <div className="modal-overlay" onClick={() => setShowTracking(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowTracking(false)}
            >
              ×
            </button>
            <OrderTracking orderId={selectedOrderId} />
          </div>
        </div>
      )}

      {showCancellation && orderToCancel && (
        <OrderCancellation
          order={orderToCancel}
          onCancel={handleOrderCancelled}
          onClose={() => {
            setShowCancellation(false);
            setOrderToCancel(null);
          }}
        />
      )}

      <style jsx>{`
        .order-list-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .order-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .order-list-header h2 {
          margin: 0;
          color: #333;
        }

        .filters {
          display: flex;
          gap: 15px;
          align-items: center;
        }

        .status-filter {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #666;
          font-size: 18px;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .order-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #eee;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .order-id {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .order-status {
          padding: 4px 12px;
          border-radius: 12px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }

        .order-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-date {
          color: #666;
          font-size: 14px;
        }

        .order-total {
          font-size: 16px;
          font-weight: 600;
          color: #007bff;
        }

        .order-items {
          margin-bottom: 20px;
        }

        .items-count {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .items-preview {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-name {
          font-size: 14px;
          color: #333;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .more-items {
          font-size: 12px;
          color: #666;
          font-style: italic;
        }

        .order-actions {
          display: flex;
          gap: 10px;
        }

        .btn-track, .btn-cancel {
          flex: 1;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-track {
          background: #007bff;
          color: white;
        }

        .btn-track:hover {
          background: #0056b3;
        }

        .btn-cancel {
          background: #dc3545;
          color: white;
        }

        .btn-cancel:hover {
          background: #c82333;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
        }

        .pagination-btn {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .pagination-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .pagination-info {
          font-weight: 500;
          color: #666;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          position: relative;
          background: white;
          border-radius: 8px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-close {
          position: absolute;
          top: 10px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          z-index: 1001;
        }

        @media (max-width: 768px) {
          .order-list-container {
            padding: 15px;
          }

          .orders-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .order-list-header {
            flex-direction: column;
            align-items: stretch;
          }

          .order-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderList;
