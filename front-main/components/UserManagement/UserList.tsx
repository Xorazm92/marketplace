import React, { useState, useEffect } from 'react';
import { User, UserSearchParams } from '../../types/user.types';
import { getAllUsers, searchUsers, blockUser, unblockUser, deleteUser } from '../../endpoints/user';
import { toast } from 'react-toastify';

interface UserListProps {
  onUserSelect?: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ onUserSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);

  const loadUsers = async (page: number = 1, query: string = '') => {
    setLoading(true);
    try {
      let response;
      if (query.trim()) {
        const searchParams: UserSearchParams = {
          query: query.trim(),
          page,
          limit
        };
        response = await searchUsers(searchParams);
      } else {
        response = await getAllUsers(page, limit);
      }
      
      setUsers(response.users);
      setTotalUsers(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1, searchQuery);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadUsers(1, searchQuery);
  };

  const handlePageChange = (newPage: number) => {
    loadUsers(newPage, searchQuery);
  };

  const handleBlockUser = async (userId: number) => {
    if (!confirm('Foydalanuvchini bloklashni xohlaysizmi?')) return;
    
    try {
      await blockUser(userId);
      loadUsers(currentPage, searchQuery);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const handleUnblockUser = async (userId: number) => {
    if (!confirm('Foydalanuvchini blokdan chiqarishni xohlaysizmi?')) return;
    
    try {
      await unblockUser(userId);
      loadUsers(currentPage, searchQuery);
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Foydalanuvchini o\'chirishni xohlaysizmi? Bu amal qaytarib bo\'lmaydi!')) return;
    
    try {
      await deleteUser(userId);
      loadUsers(currentPage, searchQuery);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const totalPages = Math.ceil(totalUsers / limit);

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>Foydalanuvchilar boshqaruvi</h2>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Ism, familiya yoki telefon raqami bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Qidirish
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ism</th>
                  <th>Familiya</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Holat</th>
                  <th>Yaratilgan</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={user.is_blocked ? 'blocked-user' : ''}>
                    <td>{user.id}</td>
                    <td>{user.first_name}</td>
                    <td>{user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone_number || 'N/A'}</td>
                    <td>
                      <span className={`status ${user.is_blocked ? 'blocked' : 'active'}`}>
                        {user.is_blocked ? 'Bloklangan' : 'Faol'}
                      </span>
                      {user.is_verified && (
                        <span className="verified">✓ Tasdiqlangan</span>
                      )}
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button
                        onClick={() => onUserSelect?.(user)}
                        className="btn-view"
                        title="Ko'rish"
                      >
                        👁️
                      </button>
                      
                      {user.is_blocked ? (
                        <button
                          onClick={() => handleUnblockUser(user.id)}
                          className="btn-unblock"
                          title="Blokdan chiqarish"
                        >
                          🔓
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlockUser(user.id)}
                          className="btn-block"
                          title="Bloklash"
                        >
                          🔒
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn-delete"
                        title="O'chirish"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Oldingi
              </button>
              
              <span className="pagination-info">
                {currentPage} / {totalPages} sahifa ({totalUsers} ta foydalanuvchi)
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Keyingi
              </button>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .user-list-container {
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .user-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .search-form {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-width: 300px;
        }

        .search-button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .search-button:hover {
          background: #0056b3;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .users-table {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        th {
          background: #f8f9fa;
          font-weight: 600;
        }

        .blocked-user {
          background: #fff5f5;
        }

        .status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .status.active {
          background: #d4edda;
          color: #155724;
        }

        .status.blocked {
          background: #f8d7da;
          color: #721c24;
        }

        .verified {
          margin-left: 8px;
          color: #28a745;
          font-size: 12px;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .actions button {
          padding: 6px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-view {
          background: #17a2b8;
          color: white;
        }

        .btn-block {
          background: #ffc107;
          color: #212529;
        }

        .btn-unblock {
          background: #28a745;
          color: white;
        }

        .btn-delete {
          background: #dc3545;
          color: white;
        }

        .actions button:hover {
          opacity: 0.8;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 20px;
        }

        .pagination-btn {
          padding: 8px 16px;
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

        @media (max-width: 768px) {
          .user-list-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            min-width: 100%;
          }

          .users-table {
            font-size: 14px;
          }

          th, td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserList;
