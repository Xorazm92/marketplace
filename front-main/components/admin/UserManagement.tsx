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

// Mock data
const mockUsers: User[] = [
  {
    id: 1,
    firstName: 'Malika',
    lastName: 'Karimova',
    email: 'malika@example.com',
    phone: '+998 90 123 45 67',
    role: 'customer',
    status: 'active',
    totalOrders: 12,
    totalSpent: 2450000,
    joinDate: '2024-01-15',
    lastLogin: '2024-01-20'
  },
  {
    id: 2,
    firstName: 'Akmal',
    lastName: 'Toshmatov',
    email: 'akmal@example.com',
    phone: '+998 91 234 56 78',
    role: 'customer',
    status: 'active',
    totalOrders: 8,
    totalSpent: 1890000,
    joinDate: '2024-01-10',
    lastLogin: '2024-01-19'
  }
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ');
  };

  const handleStatusChange = (userId: number, newStatus: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus as any } : user
    ));
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className={styles.userManagement}>
      <div className={styles.header}>
        <h2>Foydalanuvchi boshqaruvi</h2>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{users.length}</span>
            <span className={styles.statLabel}>Jami foydalanuvchilar</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>
              {users.filter(u => u.status === 'active').length}
            </span>
            <span className={styles.statLabel}>Faol</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Foydalanuvchi qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        
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

      {/* Users Table */}
      <div className={styles.usersTable}>
        <div className={styles.tableHeader}>
          <span>Foydalanuvchi</span>
          <span>Rol</span>
          <span>Buyurtmalar</span>
          <span>Jami xarid</span>
          <span>Holat</span>
          <span>Oxirgi kirish</span>
        </div>

        {filteredUsers.map((user) => (
          <div key={user.id} className={styles.tableRow}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.firstName} {user.lastName}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            </div>

            <span className={styles.userRole}>{user.role}</span>
            <span className={styles.userOrders}>{user.totalOrders}</span>
            <span className={styles.userSpent}>{formatPrice(user.totalSpent)}</span>

            <select
              value={user.status}
              onChange={(e) => handleStatusChange(user.id, e.target.value)}
              className={styles.statusSelect}
            >
              <option value="active">Faol</option>
              <option value="inactive">Nofaol</option>
              <option value="banned">Bloklangan</option>
            </select>

            <span className={styles.lastLogin}>{formatDate(user.lastLogin)}</span>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className={styles.emptyState}>
          <h3>Foydalanuvchilar topilmadi</h3>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
