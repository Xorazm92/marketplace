import React from 'react';
import styles from './ProfileSidebar.module.scss';

type ProfileTab = 'overview' | 'orders' | 'addresses' | 'wishlist' | 'settings';

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const menuItems = [
  {
    id: 'overview' as ProfileTab,
    label: 'Umumiy ma\'lumot',
    icon: '📊',
    description: 'Profil ko\'rinishi'
  },
  {
    id: 'orders' as ProfileTab,
    label: 'Buyurtmalar tarixi',
    icon: '📦',
    description: 'Barcha buyurtmalar'
  },
  {
    id: 'addresses' as ProfileTab,
    label: 'Manzillar',
    icon: '📍',
    description: 'Yetkazib berish manzillari'
  },
  {
    id: 'wishlist' as ProfileTab,
    label: 'Sevimlilar',
    icon: '❤️',
    description: 'Saqlangan mahsulotlar'
  },
  {
    id: 'settings' as ProfileTab,
    label: 'Sozlamalar',
    icon: '⚙️',
    description: 'Hisob sozlamalari'
  }
];

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  activeTab,
  onTabChange
}) => {
  return (
    <div className={styles.profileSidebar}>
      <div className={styles.sidebarHeader}>
        <h3>Profil menyusi</h3>
      </div>
      
      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <div className={styles.navContent}>
              <span className={styles.navLabel}>{item.label}</span>
              <span className={styles.navDescription}>{item.description}</span>
            </div>
            <span className={styles.navArrow}>›</span>
          </button>
        ))}
      </nav>
      
      <div className={styles.sidebarFooter}>
        <button className={styles.logoutButton}>
          <span className={styles.logoutIcon}>🚪</span>
          Chiqish
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
