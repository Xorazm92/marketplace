import React, { useState, useEffect } from 'react';
import { User } from '../../types/user.types';
import { getUserById } from '../../endpoints/user';

interface UserModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ userId, isOpen, onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadUserDetails();
    }
  }, [isOpen, userId]);

  const loadUserDetails = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const userData = await getUserById(userId);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Foydalanuvchi ma'lumotlari</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading">Yuklanmoqda...</div>
          ) : user ? (
            <div className="user-details">
              <div className="user-avatar">
                {user.profile_image ? (
                  <img src={user.profile_image} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {user.first_name[0]}{user.last_name[0]}
                  </div>
                )}
              </div>

              <div className="user-info">
                <div className="info-row">
                  <label>ID:</label>
                  <span>{user.id}</span>
                </div>

                <div className="info-row">
                  <label>Ism:</label>
                  <span>{user.first_name}</span>
                </div>

                <div className="info-row">
                  <label>Familiya:</label>
                  <span>{user.last_name}</span>
                </div>

                <div className="info-row">
                  <label>Email:</label>
                  <span>{user.email}</span>
                </div>

                <div className="info-row">
                  <label>Telefon:</label>
                  <span>{user.phone_number || 'Kiritilmagan'}</span>
                </div>

                <div className="info-row">
                  <label>Holat:</label>
                  <span className={`status ${user.is_blocked ? 'blocked' : 'active'}`}>
                    {user.is_blocked ? 'Bloklangan' : 'Faol'}
                  </span>
                </div>

                <div className="info-row">
                  <label>Tasdiqlangan:</label>
                  <span className={user.is_verified ? 'verified' : 'not-verified'}>
                    {user.is_verified ? '✓ Ha' : '✗ Yo\'q'}
                  </span>
                </div>

                <div className="info-row">
                  <label>Ro'yxatdan o'tgan:</label>
                  <span>{new Date(user.created_at).toLocaleString()}</span>
                </div>

                <div className="info-row">
                  <label>Oxirgi yangilanish:</label>
                  <span>{new Date(user.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="error">Foydalanuvchi ma'lumotlarini yuklashda xatolik</div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-close" onClick={onClose}>
            Yopish
          </button>
        </div>
      </div>

      <style jsx>{`
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

        .loading, .error {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .error {
          color: #dc3545;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .user-avatar {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }

        .user-avatar img {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row label {
          font-weight: 600;
          color: #555;
          min-width: 120px;
        }

        .info-row span {
          color: #333;
          text-align: right;
        }

        .status.active {
          color: #28a745;
          font-weight: 500;
        }

        .status.blocked {
          color: #dc3545;
          font-weight: 500;
        }

        .verified {
          color: #28a745;
        }

        .not-verified {
          color: #ffc107;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
        }

        .btn-close {
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-close:hover {
          background: #545b62;
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            margin: 20px;
          }

          .info-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .info-row span {
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};

export default UserModal;
