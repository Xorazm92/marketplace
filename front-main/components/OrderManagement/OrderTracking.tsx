import React, { useState, useEffect } from 'react';
import { Order } from '../../types/order.types';
import { getOrderById, updateOrderStatus } from '../../endpoints/order';

interface OrderTrackingProps {
  orderId: number;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const orderData = await getOrderById(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'PENDING', label: 'Kutilmoqda', icon: '⏳' },
      { key: 'CONFIRMED', label: 'Tasdiqlandi', icon: '✅' },
      { key: 'PROCESSING', label: 'Tayyorlanmoqda', icon: '📦' },
      { key: 'SHIPPED', label: 'Yuborildi', icon: '🚚' },
      { key: 'DELIVERED', label: 'Yetkazildi', icon: '🎉' }
    ];

    if (order?.status === 'CANCELLED') {
      return [
        ...steps.slice(0, steps.findIndex(s => s.key === order.status) + 1),
        { key: 'CANCELLED', label: 'Bekor qilindi', icon: '❌' }
      ];
    }

    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    return steps.findIndex(step => step.key === order?.status);
  };

  if (loading) {
    return <div className="loading">Yuklanmoqda...</div>;
  }

  if (!order) {
    return <div className="error">Buyurtma topilmadi</div>;
  }

  const steps = getStatusSteps();
  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="order-tracking">
      <div className="tracking-header">
        <h3>Buyurtma kuzatuvi #{order.id}</h3>
        <div className="order-meta">
          <span>Yaratilgan: {new Date(order.created_at).toLocaleString()}</span>
          <span>Jami: {order.final_amount.toLocaleString()} so'm</span>
        </div>
      </div>

      <div className="tracking-timeline">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`timeline-step ${
              index <= currentStepIndex ? 'completed' : 'pending'
            } ${index === currentStepIndex ? 'current' : ''}`}
          >
            <div className="step-icon">
              <span>{step.icon}</span>
            </div>
            <div className="step-content">
              <div className="step-title">{step.label}</div>
              {index <= currentStepIndex && (
                <div className="step-time">
                  {index === currentStepIndex 
                    ? new Date(order.updated_at).toLocaleString()
                    : 'Bajarildi'
                  }
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`step-connector ${index < currentStepIndex ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>

      <div className="order-items">
        <h4>Buyurtma tarkibi:</h4>
        {order.items.map((item) => (
          <div key={item.id} className="order-item">
            <div className="item-info">
              <span className="item-name">{item.product.name}</span>
              <span className="item-quantity">x{item.quantity}</span>
            </div>
            <div className="item-price">
              {(item.price * item.quantity).toLocaleString()} so'm
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .order-tracking {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .tracking-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }

        .tracking-header h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .order-meta {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 14px;
          color: #666;
        }

        .tracking-timeline {
          position: relative;
          padding: 20px 0;
        }

        .timeline-step {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
          position: relative;
        }

        .timeline-step:last-child {
          margin-bottom: 0;
        }

        .step-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          margin-right: 20px;
          position: relative;
          z-index: 2;
        }

        .timeline-step.pending .step-icon {
          background: #f8f9fa;
          border: 2px solid #dee2e6;
          color: #6c757d;
        }

        .timeline-step.completed .step-icon {
          background: #d4edda;
          border: 2px solid #28a745;
          color: #155724;
        }

        .timeline-step.current .step-icon {
          background: #cce7ff;
          border: 2px solid #007bff;
          color: #004085;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .step-content {
          flex: 1;
        }

        .step-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .step-time {
          font-size: 12px;
          color: #666;
        }

        .step-connector {
          position: absolute;
          left: 24px;
          top: 50px;
          width: 2px;
          height: 30px;
          background: #dee2e6;
        }

        .step-connector.completed {
          background: #28a745;
        }

        .order-items {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .order-items h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .item-name {
          font-weight: 500;
          color: #333;
        }

        .item-quantity {
          font-size: 12px;
          color: #666;
        }

        .item-price {
          font-weight: 600;
          color: #007bff;
        }

        .loading, .error {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .error {
          color: #dc3545;
        }

        @media (max-width: 768px) {
          .order-tracking {
            margin: 10px;
            padding: 15px;
          }

          .order-meta {
            flex-direction: column;
            gap: 5px;
          }

          .step-icon {
            width: 40px;
            height: 40px;
            font-size: 16px;
            margin-right: 15px;
          }

          .step-connector {
            left: 19px;
            height: 25px;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;
