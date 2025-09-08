import React, { useState } from 'react';
import { Order, UpdateOrderStatusData } from '../../types/order.types';
import { updateOrderStatus } from '../../endpoints/order';

interface OrderCancellationProps {
  order: Order;
  onCancel: () => void;
  onClose: () => void;
}

const OrderCancellation: React.FC<OrderCancellationProps> = ({ order, onCancel, onClose }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const cancellationReasons = [
    'Fikrimni o\'zgartirdim',
    'Noto\'g\'ri mahsulot tanlagan edim',
    'Boshqa joydan arzonroq topdim',
    'Yetkazib berish muddati juda uzoq',
    'To\'lov muammolari',
    'Boshqa sabab'
  ];

  const canBeCancelled = () => {
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    return cancellableStatuses.includes(order.status);
  };

  const handleCancel = async () => {
    if (!reason.trim()) {
      alert('Iltimos, bekor qilish sababini tanlang');
      return;
    }

    setLoading(true);
    try {
      const statusData: UpdateOrderStatusData = {
        status: 'CANCELLED',
        reason: reason
      };
      
      await updateOrderStatus(order.id, statusData);
      onCancel();
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canBeCancelled()) {
    return (
      <div className="cancellation-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Buyurtmani bekor qilib bo'lmaydi</h3>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="warning-message">
              <span className="warning-icon">⚠️</span>
              <p>
                Buyurtma holati "{order.status}" bo'lgani uchun uni bekor qilib bo'lmaydi. 
                Agar muammo bo'lsa, mijozlar xizmati bilan bog'laning.
              </p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Yopish
            </button>
          </div>
        </div>

        <style jsx>{`
          .cancellation-modal {
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
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #eee;
          }

          .modal-header h3 {
            margin: 0;
            color: #333;
          }

          .close-button {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-body {
            padding: 20px;
          }

          .warning-message {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 15px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
          }

          .warning-icon {
            font-size: 20px;
            margin-top: 2px;
          }

          .warning-message p {
            margin: 0;
            color: #856404;
            line-height: 1.5;
          }

          .modal-footer {
            padding: 20px;
            border-top: 1px solid #eee;
            display: flex;
            justify-content: flex-end;
          }

          .btn-secondary {
            padding: 10px 20px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }

          .btn-secondary:hover {
            background: #545b62;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cancellation-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Buyurtmani bekor qilish</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="order-info">
            <p><strong>Buyurtma #{order.id}</strong></p>
            <p>Jami: {order.final_amount.toLocaleString()} so'm</p>
          </div>

          <div className="reason-section">
            <label>Bekor qilish sababini tanlang:</label>
            <div className="reason-options">
              {cancellationReasons.map((reasonOption, index) => (
                <label key={index} className="reason-option">
                  <input
                    type="radio"
                    name="cancellation-reason"
                    value={reasonOption}
                    checked={reason === reasonOption}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <span>{reasonOption}</span>
                </label>
              ))}
            </div>

            {reason === 'Boshqa sabab' && (
              <textarea
                className="custom-reason"
                placeholder="Boshqa sababni kiriting..."
                value={reason === 'Boshqa sabab' ? '' : reason}
                onChange={(e) => setReason(e.target.value)}
              />
            )}
          </div>

          <div className="warning-note">
            <span className="warning-icon">⚠️</span>
            <p>Buyurtmani bekor qilgandan so'ng, to'lov 3-5 ish kuni ichida qaytariladi.</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>
            Bekor qilish
          </button>
          <button 
            className="btn-danger" 
            onClick={handleCancel}
            disabled={loading || !reason.trim()}
          >
            {loading ? 'Bekor qilinmoqda...' : 'Buyurtmani bekor qilish'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .cancellation-modal {
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
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:hover {
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .order-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .order-info p {
          margin: 0 0 5px 0;
          color: #333;
        }

        .reason-section {
          margin-bottom: 20px;
        }

        .reason-section label {
          display: block;
          margin-bottom: 10px;
          font-weight: 600;
          color: #333;
        }

        .reason-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .reason-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-weight: normal;
        }

        .reason-option:hover {
          background: #f8f9fa;
        }

        .reason-option input[type="radio"] {
          margin: 0;
        }

        .custom-reason {
          width: 100%;
          min-height: 80px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-top: 10px;
          resize: vertical;
          font-family: inherit;
        }

        .warning-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
        }

        .warning-icon {
          font-size: 16px;
          margin-top: 2px;
        }

        .warning-note p {
          margin: 0;
          color: #856404;
          font-size: 14px;
          line-height: 1.4;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn-secondary, .btn-danger {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #c82333;
        }

        .btn-secondary:disabled, .btn-danger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            margin: 20px;
          }

          .modal-footer {
            flex-direction: column;
            gap: 10px;
          }

          .btn-secondary, .btn-danger {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderCancellation;
