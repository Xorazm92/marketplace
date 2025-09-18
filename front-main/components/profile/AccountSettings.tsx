import React, { useState } from 'react';
import styles from './AccountSettings.module.scss';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage: string | null;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  membershipLevel: string;
}

interface AccountSettingsProps {
  user: User;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ user }) => {
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    dateOfBirth: '',
    gender: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    newsletter: false
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    showPurchaseHistory: false,
    allowRecommendations: true
  });

  const sections = [
    { id: 'profile', label: 'Shaxsiy ma\'lumotlar', icon: '👤' },
    { id: 'password', label: 'Parol o\'zgartirish', icon: '🔒' },
    { id: 'notifications', label: 'Bildirishnomalar', icon: '🔔' },
    { id: 'privacy', label: 'Maxfiylik', icon: '🛡️' },
    { id: 'account', label: 'Hisob sozlamalari', icon: '⚙️' }
  ];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to update profile
    if (process.env.NODE_ENV === "development") console.log('Updating profile:', profileData);
    alert('Profil ma\'lumotlari yangilandi!');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yangi parollar mos kelmaydi!');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      alert('Parol kamida 8 ta belgidan iborat bo\'lishi kerak!');
      return;
    }
    
    // API call to change password
    if (process.env.NODE_ENV === "development") console.log('Changing password');
    alert('Parol muvaffaqiyatli o\'zgartirildi!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    // API call to update notification settings
    if (process.env.NODE_ENV === "development") console.log('Updating notification settings:', { [key]: value });
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
    // API call to update privacy settings
    if (process.env.NODE_ENV === "development") console.log('Updating privacy settings:', { [key]: value });
  };

  const handleDeleteAccount = () => {
    const confirmation = window.prompt(
      'Hisobni o\'chirish uchun "DELETE" so\'zini kiriting:'
    );
    
    if (confirmation === 'DELETE') {
      if (window.confirm('Rostdan ham hisobingizni o\'chirmoqchimisiz? Bu amalni bekor qilib bo\'lmaydi!')) {
        // API call to delete account
        if (process.env.NODE_ENV === "development") console.log('Deleting account');
        alert('Hisobingiz o\'chirildi. Xayr!');
      }
    } else if (confirmation !== null) {
      alert('Noto\'g\'ri tasdiqlash. Hisob o\'chirilmadi.');
    }
  };

  const renderProfileSection = () => (
    <form onSubmit={handleProfileSubmit} className={styles.settingsForm}>
      <h3>Shaxsiy ma'lumotlar</h3>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Ism</label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Familiya</label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Email</label>
        <input
          type="email"
          value={profileData.email}
          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Telefon raqam</label>
        <input
          type="tel"
          value={profileData.phone}
          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
          required
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Tug'ilgan sana</label>
          <input
            type="date"
            value={profileData.dateOfBirth}
            onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Jins</label>
          <select
            value={profileData.gender}
            onChange={(e) => setProfileData(prev => ({ ...prev, gender: e.target.value }))}
          >
            <option value="">Tanlang</option>
            <option value="male">Erkak</option>
            <option value="female">Ayol</option>
            <option value="other">Boshqa</option>
          </select>
        </div>
      </div>

      <button type="submit" className={styles.saveButton}>
        O'zgarishlarni saqlash
      </button>
    </form>
  );

  const renderPasswordSection = () => (
    <form onSubmit={handlePasswordSubmit} className={styles.settingsForm}>
      <h3>Parol o'zgartirish</h3>
      
      <div className={styles.formGroup}>
        <label>Joriy parol</label>
        <input
          type="password"
          value={passwordData.currentPassword}
          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Yangi parol</label>
        <input
          type="password"
          value={passwordData.newPassword}
          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
          required
          minLength={8}
        />
        <small>Kamida 8 ta belgi bo'lishi kerak</small>
      </div>

      <div className={styles.formGroup}>
        <label>Yangi parolni tasdiqlang</label>
        <input
          type="password"
          value={passwordData.confirmPassword}
          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
          required
        />
      </div>

      <button type="submit" className={styles.saveButton}>
        Parolni o'zgartirish
      </button>
    </form>
  );

  const renderNotificationsSection = () => (
    <div className={styles.settingsForm}>
      <h3>Bildirishnoma sozlamalari</h3>
      
      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <h4>Email bildirishnomalar</h4>
          <p>Muhim yangiliklar va buyurtma holati haqida email orqali xabar olish</p>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={notificationSettings.emailNotifications}
            onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <h4>SMS bildirishnomalar</h4>
          <p>Buyurtma holati haqida SMS orqali xabar olish</p>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={notificationSettings.smsNotifications}
            onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <h4>Buyurtma yangiliklari</h4>
          <p>Buyurtmangiz holati o'zgarganda xabar olish</p>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={notificationSettings.orderUpdates}
            onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <h4>Aksiyalar va chegirmalar</h4>
          <p>Maxsus takliflar va chegirmalar haqida xabar olish</p>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={notificationSettings.promotions}
            onChange={(e) => handleNotificationChange('promotions', e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <h4>Yangiliklar xabarnomasi</h4>
          <p>Haftalik yangiliklar va maslahatlar olish</p>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={notificationSettings.newsletter}
            onChange={(e) => handleNotificationChange('newsletter', e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className={styles.settingsForm}>
      <h3>Maxfiylik sozlamalari</h3>
      
      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <h4>Profil ko'rinishi</h4>
          <p>Profilingiz boshqalar tomonidan ko'rinish darajasi</p>
        </div>
        <select
          value={privacySettings.profileVisibility}
          onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
          className={styles.selectInput}
        >
          <option value="private">Shaxsiy</option>
          <option value="friends">Do'stlar</option>
          <option value="public">Ommaviy</option>
        </select>
      </div>

      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <h4>Xarid tarixini ko'rsatish</h4>
          <p>Boshqalar sizning xarid tarixingizni ko'rishi mumkin</p>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={privacySettings.showPurchaseHistory}
            onChange={(e) => handlePrivacyChange('showPurchaseHistory', e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <h4>Tavsiyalarga ruxsat berish</h4>
          <p>Xarid tarixingiz asosida shaxsiy tavsiyalar olish</p>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={privacySettings.allowRecommendations}
            onChange={(e) => handlePrivacyChange('allowRecommendations', e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );

  const renderAccountSection = () => (
    <div className={styles.settingsForm}>
      <h3>Hisob sozlamalari</h3>
      
      <div className={styles.accountInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>A'zo bo'lgan sana:</span>
          <span className={styles.infoValue}>
            {new Date(user.joinDate).toLocaleDateString('uz-UZ', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>A'zolik darajasi:</span>
          <span className={styles.infoValue}>{user.membershipLevel}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Jami buyurtmalar:</span>
          <span className={styles.infoValue}>{user.totalOrders}</span>
        </div>
      </div>

      <div className={styles.dangerZone}>
        <h4>Xavfli zona</h4>
        <p>Bu amallar qaytarib bo'lmaydigan o'zgarishlar kiritadi.</p>
        
        <button 
          className={styles.dangerButton}
          onClick={handleDeleteAccount}
        >
          Hisobni o'chirish
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'password':
        return renderPasswordSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'privacy':
        return renderPrivacySection();
      case 'account':
        return renderAccountSection();
      default:
        return renderProfileSection();
    }
  };

  return (
    <div className={styles.accountSettings}>
      <div className={styles.settingsNav}>
        {sections.map((section) => (
          <button
            key={section.id}
            className={`${styles.navButton} ${activeSection === section.id ? styles.active : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className={styles.navIcon}>{section.icon}</span>
            <span className={styles.navLabel}>{section.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.settingsContent}>
        {renderContent()}
      </div>
    </div>
  );
};

export default AccountSettings;
