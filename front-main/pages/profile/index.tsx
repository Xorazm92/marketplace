import React, { useState } from 'react';
import Head from 'next/head';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import ProfileOverview from '../../components/profile/ProfileOverview';
import OrderHistory from '../../components/profile/OrderHistory';
import AddressManagement from '../../components/profile/AddressManagement';
import WishlistPage from '../../components/profile/WishlistPage';
import AccountSettings from '../../components/profile/AccountSettings';
import styles from '../../styles/Profile.module.scss';

type ProfileTab = 'overview' | 'orders' | 'addresses' | 'wishlist' | 'settings';

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Mock user data - real loyihada authentication dan keladi
  const user = {
    id: 1,
    firstName: 'Malika',
    lastName: 'Karimova',
    email: 'malika@example.com',
    phone: '+998 90 123 45 67',
    profileImage: null,
    joinDate: '2024-01-15',
    totalOrders: 12,
    totalSpent: 2450000,
    membershipLevel: 'Gold'
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProfileOverview user={user} />;
      case 'orders':
        return <OrderHistory userId={user.id} />;
      case 'addresses':
        return <AddressManagement userId={user.id} />;
      case 'wishlist':
        return <WishlistPage userId={user.id} />;
      case 'settings':
        return <AccountSettings user={user} />;
      default:
        return <ProfileOverview user={user} />;
    }
  };

  return (
    <>
      <Head>
        <title>Profil - INBOLA</title>
        <meta name="description" content="Shaxsiy profil va hisob sozlamalari" />
      </Head>
      
      <main className={styles.profilePage}>
        <div className={styles.container}>
          <div className={styles.profileHeader}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {user.profileImage ? (
                  <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <span className={styles.avatarPlaceholder}>
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </span>
                )}
              </div>
              <div className={styles.userDetails}>
                <h1 className={styles.userName}>
                  {user.firstName} {user.lastName}
                </h1>
                <p className={styles.userEmail}>{user.email}</p>
                <div className={styles.membershipBadge}>
                  <span className={styles.badge}>{user.membershipLevel} a'zo</span>
                </div>
              </div>
            </div>
            
            <div className={styles.userStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{user.totalOrders}</span>
                <span className={styles.statLabel}>Buyurtmalar</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {new Intl.NumberFormat('uz-UZ').format(user.totalSpent)} so'm
                </span>
                <span className={styles.statLabel}>Jami xarid</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {new Date(user.joinDate).getFullYear()}
                </span>
                <span className={styles.statLabel}>A'zo bo'lgan yil</span>
              </div>
            </div>
          </div>

          <div className={styles.profileContent}>
            <div className={styles.sidebar}>
              <ProfileSidebar 
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
            
            <div className={styles.mainContent}>
              {renderTabContent()}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;
