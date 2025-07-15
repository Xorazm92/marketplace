import React, { useState } from 'react';
import styles from './UserManagement.module.scss';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'super_admin';
  status: 'active' | 'inactive' | 'banned';
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  lastLogin: string;
}

// Demo ma'lumotlar o'chirildi - real API ma'lumotlari qo'shilganda ishlatiladi
const mockUsers: User[] = [];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'totalSpent' | 'totalOrders'>('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = (userId: number, newStatus: string) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, status: newStatus as any } : user
    ));
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'customer':
        return 'Mijoz';
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      default:
        return role;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Faol';
      case 'inactive':
        return 'Nofaol';
      case 'banned':
        return 'Bloklangan';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#27ae60';
      case 'inactive':
        return '#f39c12';
      case 'banned':
        return '#e74c3c';
      default:
        return '#7f8c8d';
    }
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           user.phone.includes(searchQuery);
      const matchesRole = !filterRole || user.role === filterRole;
      const matchesStatus = !filterStatus || user.status === filterStatus;

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'joinDate':
          aValue = new Date(a.joinDate);
          bValue = new Date(b.joinDate);
          break;
        case 'totalSpent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case 'totalOrders':
          aValue = a.totalOrders;
          bValue = b.totalOrders;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalRevenue = users.reduce((sum, user) => sum + user.totalSpent, 0);
  const totalOrders = users.reduce((sum, user) => sum + user.totalOrders, 0);

  return (
    <div className={styles.userManagement}>
      <div className={styles.header}>
        <h2>👥 Foydalanuvchi boshqaruvi</h2>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{totalUsers}</span>
              <span className={styles.statLabel}>Jami foydalanuvchilar</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>✅</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{activeUsers}</span>
              <span className={styles.statLabel}>Faol foydalanuvchilar</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>💰</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{formatPrice(totalRevenue)}</span>
              <span className={styles.statLabel}>Jami xaridlar</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>📦</div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{totalOrders}</span>
              <span className={styles.statLabel}>Jami buyurtmalar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className={styles.controls}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Ism, email yoki telefon bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Barcha rollar</option>
            <option value="customer">Mijoz</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Barcha holatlar</option>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
            <option value="banned">Bloklangan</option>
          </select>
        </div>

        <div className={styles.sortControls}>
          <label>Saralash:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className={styles.sortSelect}
          >
            <option value="joinDate">Ro'yxatdan o'tgan sana</option>
            <option value="name">Ism</option>
            <option value="totalSpent">Jami xarid</option>
            <option value="totalOrders">Buyurtmalar soni</option>
          </select>
          <button
            className={styles.sortOrderButton}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.usersTable}>
        <div className={styles.tableHeader}>
          <span>Foydalanuvchi</span>
          <span>Rol</span>
          <span>Buyurtmalar</span>
          <span>Jami xarid</span>
          <span>Holat</span>
          <span>Oxirgi kirish</span>
          <span>Amallar</span>
        </div>

        {filteredAndSortedUsers.map((user) => (
          <div key={user.id} className={styles.tableRow}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.firstName} {user.lastName}</span>
                <span className={styles.userEmail}>{user.email}</span>
                <span className={styles.userPhone}>{user.phone}</span>
              </div>
            </div>

            <div className={styles.userRole}>
              <span className={`${styles.roleTag} ${styles[user.role]}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            <div className={styles.userStats}>
              <span className={styles.ordersCount}>{user.totalOrders}</span>
              <span className={styles.ordersLabel}>buyurtma</span>
            </div>

            <span className={styles.userSpent}>{formatPrice(user.totalSpent)}</span>

            <div className={styles.userStatus}>
              <select
                value={user.status}
                onChange={(e) => handleStatusChange(user.id, e.target.value)}
                className={styles.statusSelect}
                style={{ color: getStatusColor(user.status) }}
              >
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
                <option value="banned">Bloklangan</option>
              </select>
            </div>

            <span className={styles.lastLogin}>{formatDate(user.lastLogin)}</span>

            <div className={styles.userActions}>
              <button
                className={styles.viewButton}
                onClick={() => setSelectedUser(user)}
                title="Tafsilotlarni ko'rish"
              >
                👁️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedUsers.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <h3>Foydalanuvchilar topilmadi</h3>
          <p>Qidiruv shartlariga mos foydalanuvchilar yo'q.</p>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className={styles.userModal}>
          <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Foydalanuvchi tafsilotlari</h3>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.userProfile}>
                <div className={styles.profileAvatar}>
                  {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                </div>
                <div className={styles.profileInfo}>
                  <h4>{selectedUser.firstName} {selectedUser.lastName}</h4>
                  <span className={`${styles.roleTag} ${styles[selectedUser.role]}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </div>
              </div>

              <div className={styles.userDetailsGrid}>
                <div className={styles.detailItem}>
                  <strong>Email:</strong>
                  <span>{selectedUser.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Telefon:</strong>
                  <span>{selectedUser.phone}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Holat:</strong>
                  <span style={{ color: getStatusColor(selectedUser.status) }}>
                    {getStatusLabel(selectedUser.status)}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Ro'yxatdan o'tgan:</strong>
                  <span>{formatDate(selectedUser.joinDate)}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Oxirgi kirish:</strong>
                  <span>{formatDateTime(selectedUser.lastLogin)}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Jami buyurtmalar:</strong>
                  <span>{selectedUser.totalOrders} ta</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Jami xaridlar:</strong>
                  <span>{formatPrice(selectedUser.totalSpent)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
