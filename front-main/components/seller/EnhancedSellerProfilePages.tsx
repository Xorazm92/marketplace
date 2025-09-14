import React, { useState, useEffect } from 'react';
import { 
  MdVerifiedUser, 
  MdSecurity, 
  MdChildCare, 
  MdShield,
  MdPolicy,
  MdAccountBox,
  MdNotifications,
  MdPrivacyTip,
  MdFamilyRestroom,
  MdLock,
  MdSafetyCheck,
  MdReport,
  MdSettings,
  MdHelp,
  MdEdit,
  MdSave,
  MdCancel
} from 'react-icons/md';
import { 
  FiShield, 
  FiClock, 
  FiCheck, 
  FiX, 
  FiInfo,
  FiEye,
  FiEyeOff,
  FiAlertTriangle
} from 'react-icons/fi';
import { TrustBadge } from '../common/TrustBadges';
import styles from './EnhancedSellerProfilePages.module.scss';

export interface SellerVerification {
  businessLicense: {
    verified: boolean;
    documentNumber: string;
    expiryDate: string;
    issuedBy: string;
  };
  identityVerification: {
    verified: boolean;
    method: 'passport' | 'id_card' | 'drivers_license';
    verificationDate: string;
  };
  addressVerification: {
    verified: boolean;
    method: 'utility_bill' | 'bank_statement' | 'official_document';
    verificationDate: string;
  };
  backgroundCheck: {
    completed: boolean;
    status: 'clear' | 'pending' | 'flagged';
    checkDate: string;
  };
  childSafetyTraining: {
    completed: boolean;
    certificateNumber?: string;
    completionDate?: string;
    expiryDate?: string;
  };
}

export interface ParentalControlSettings {
  requireParentApproval: boolean;
  maxOrderValue: number;
  allowedAgeGroups: string[];
  restrictedCategories: string[];
  safeContentOnly: boolean;
  moderateReviews: boolean;
  transparentPolicies: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface SellerSafetyMetrics {
  parentTrustScore: number;
  safetyCompliance: number;
  childFriendlyRating: number;
  responseTime: string;
  resolutionRate: number;
  safetyIncidents: number;
  parentReviews: number;
  averageParentRating: number;
}

interface EnhancedSellerProfilePagesProps {
  sellerId: number;
  isOwnProfile?: boolean;
  onUpdateSettings?: (settings: ParentalControlSettings) => void;
  onReportConcern?: (concern: string) => void;
  className?: string;
}

const EnhancedSellerProfilePages: React.FC<EnhancedSellerProfilePagesProps> = ({
  sellerId,
  isOwnProfile = false,
  onUpdateSettings,
  onReportConcern,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'verification' | 'safety' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showParentalControls, setShowParentalControls] = useState(false);
  
  // Mock data - in real app, this would come from API
  const [sellerVerification] = useState<SellerVerification>({
    businessLicense: {
      verified: true,
      documentNumber: 'BL-2024-UZ-12345',
      expiryDate: '2025-12-31',
      issuedBy: 'O\'zbekiston Respublikasi Adliya Vazirligi'
    },
    identityVerification: {
      verified: true,
      method: 'passport',
      verificationDate: '2024-01-15'
    },
    addressVerification: {
      verified: true,
      method: 'utility_bill',
      verificationDate: '2024-01-15'
    },
    backgroundCheck: {
      completed: true,
      status: 'clear',
      checkDate: '2024-01-10'
    },
    childSafetyTraining: {
      completed: true,
      certificateNumber: 'CST-2024-001',
      completionDate: '2024-02-01',
      expiryDate: '2025-02-01'
    }
  });

  const [parentalSettings, setParentalSettings] = useState<ParentalControlSettings>({
    requireParentApproval: true,
    maxOrderValue: 500000,
    allowedAgeGroups: ['3-5', '6-8', '9-12'],
    restrictedCategories: [],
    safeContentOnly: true,
    moderateReviews: true,
    transparentPolicies: true,
    emergencyContact: {
      name: 'Nodira Karimova',
      phone: '+998901234567',
      relationship: 'Store Manager'
    }
  });

  const [safetyMetrics] = useState<SellerSafetyMetrics>({
    parentTrustScore: 4.8,
    safetyCompliance: 98,
    childFriendlyRating: 4.9,
    responseTime: '< 2 soat',
    resolutionRate: 96,
    safetyIncidents: 0,
    parentReviews: 324,
    averageParentRating: 4.7
  });

  const handleSettingsUpdate = (field: keyof ParentalControlSettings, value: any) => {
    const updatedSettings = {
      ...parentalSettings,
      [field]: value
    };
    setParentalSettings(updatedSettings);
    onUpdateSettings?.(updatedSettings);
  };

  const handleSaveSettings = () => {
    setIsEditing(false);
    // Here you would typically save to API
    console.log('Saving settings:', parentalSettings);
  };

  const getVerificationStatus = (verified: boolean, status?: string) => {
    if (verified || status === 'clear') {
      return { icon: <FiCheck />, color: '#22c55e', text: 'Tasdiqlangan' };
    } else if (status === 'pending') {
      return { icon: <FiClock />, color: '#f59e0b', text: 'Kutilmoqda' };
    } else {
      return { icon: <FiX />, color: '#ef4444', text: 'Tasdiqlanmagan' };
    }
  };

  const renderProfileTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.profileHeader}>
        <div className={styles.sellerAvatar}>
          <img src="/img/seller-avatar.jpg" alt="Seller" />
          <div className={styles.verificationBadge}>
            <MdVerifiedUser />
          </div>
        </div>
        
        <div className={styles.sellerInfo}>
          <h2>LEGO Store Uzbekistan</h2>
          <p className={styles.sellerDescription}>
            Bolalar uchun ta'limiy va rivojlantiruvchi o'yinchoqlar bo'yicha mutaxassis.
            5 yildan ortiq tajriba bilan xavfsiz va sifatli mahsulotlar taklif etamiz.
          </p>
          
          <div className={styles.trustBadges}>
            <TrustBadge type="parent-approved" size="sm" />
            <TrustBadge type="verified-seller" size="sm" />
            <TrustBadge type="safe-payment" size="sm" />
            <TrustBadge type="kids-safe" size="sm" />
          </div>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <MdChildCare />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{safetyMetrics.parentTrustScore}/5.0</span>
            <span className={styles.metricLabel}>Ota-onalar ishonchi</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <MdSafetyCheck />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{safetyMetrics.safetyCompliance}%</span>
            <span className={styles.metricLabel}>Xavfsizlik me'yori</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <FiClock />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{safetyMetrics.responseTime}</span>
            <span className={styles.metricLabel}>Javob berish vaqti</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <FiShield />
          </div>
          <div className={styles.metricInfo}>
            <span className={styles.metricValue}>{safetyMetrics.safetyIncidents}</span>
            <span className={styles.metricLabel}>Xavfsizlik hodisalari</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerificationTab = () => (
    <div className={styles.tabContent}>
      <h3>Sotuvchi tekshiruvi</h3>
      
      <div className={styles.verificationGrid}>
        <div className={styles.verificationCard}>
          <div className={styles.verificationHeader}>
            <MdAccountBox />
            <h4>Shaxsni tasdiqlash</h4>
            <div 
              className={styles.verificationStatus}
              style={{ color: getVerificationStatus(sellerVerification.identityVerification.verified).color }}
            >
              {getVerificationStatus(sellerVerification.identityVerification.verified).icon}
              <span>{getVerificationStatus(sellerVerification.identityVerification.verified).text}</span>
            </div>
          </div>
          <div className={styles.verificationDetails}>
            <p>Usul: {sellerVerification.identityVerification.method}</p>
            <p>Tasdiqlangan: {sellerVerification.identityVerification.verificationDate}</p>
          </div>
        </div>

        <div className={styles.verificationCard}>
          <div className={styles.verificationHeader}>
            <MdPolicy />
            <h4>Biznes litsenziyasi</h4>
            <div 
              className={styles.verificationStatus}
              style={{ color: getVerificationStatus(sellerVerification.businessLicense.verified).color }}
            >
              {getVerificationStatus(sellerVerification.businessLicense.verified).icon}
              <span>{getVerificationStatus(sellerVerification.businessLicense.verified).text}</span>
            </div>
          </div>
          <div className={styles.verificationDetails}>
            <p>Raqam: {sellerVerification.businessLicense.documentNumber}</p>
            <p>Amal qilish muddati: {sellerVerification.businessLicense.expiryDate}</p>
            <p>Bergan: {sellerVerification.businessLicense.issuedBy}</p>
          </div>
        </div>

        <div className={styles.verificationCard}>
          <div className={styles.verificationHeader}>
            <MdSecurity />
            <h4>Fon tekshiruvi</h4>
            <div 
              className={styles.verificationStatus}
              style={{ color: getVerificationStatus(sellerVerification.backgroundCheck.completed, sellerVerification.backgroundCheck.status).color }}
            >
              {getVerificationStatus(sellerVerification.backgroundCheck.completed, sellerVerification.backgroundCheck.status).icon}
              <span>{getVerificationStatus(sellerVerification.backgroundCheck.completed, sellerVerification.backgroundCheck.status).text}</span>
            </div>
          </div>
          <div className={styles.verificationDetails}>
            <p>Holat: {sellerVerification.backgroundCheck.status}</p>
            <p>Tekshirilgan: {sellerVerification.backgroundCheck.checkDate}</p>
          </div>
        </div>

        <div className={styles.verificationCard}>
          <div className={styles.verificationHeader}>
            <MdChildCare />
            <h4>Bolalar xavfsizligi bo'yicha trening</h4>
            <div 
              className={styles.verificationStatus}
              style={{ color: getVerificationStatus(sellerVerification.childSafetyTraining.completed).color }}
            >
              {getVerificationStatus(sellerVerification.childSafetyTraining.completed).icon}
              <span>{getVerificationStatus(sellerVerification.childSafetyTraining.completed).text}</span>
            </div>
          </div>
          <div className={styles.verificationDetails}>
            <p>Sertifikat: {sellerVerification.childSafetyTraining.certificateNumber}</p>
            <p>Tugagan: {sellerVerification.childSafetyTraining.completionDate}</p>
            <p>Amal qilish muddati: {sellerVerification.childSafetyTraining.expiryDate}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSafetyTab = () => (
    <div className={styles.tabContent}>
      <h3>Xavfsizlik va himoya</h3>
      
      <div className={styles.safetySection}>
        <div className={styles.safetyHeader}>
          <MdFamilyRestroom />
          <div>
            <h4>Ota-onalar uchun himoya</h4>
            <p>Farzandlaringiz uchun xavfsiz xarid muhitini ta'minlaymiz</p>
          </div>
        </div>

        <div className={styles.safetyFeatures}>
          <div className={styles.safetyFeature}>
            <FiShield />
            <div>
              <h5>Xavfsiz mahsulotlar</h5>
              <p>Barcha mahsulotlar xavfsizlik standartlariga javob beradi</p>
            </div>
          </div>
          
          <div className={styles.safetyFeature}>
            <MdPrivacyTip />
            <div>
              <h5>Shaxsiy ma'lumotlar himoyasi</h5>
              <p>Bolalar ma'lumotlari maxfiy saqlanadi</p>
            </div>
          </div>
          
          <div className={styles.safetyFeature}>
            <MdNotifications />
            <div>
              <h5>Ota-onalar nazorati</h5>
              <p>Har bir buyurtma uchun ota-ona tasdigi</p>
            </div>
          </div>
          
          <div className={styles.safetyFeature}>
            <MdReport />
            <div>
              <h5>Tezkor hisobot</h5>
              <p>Har qanday muammo haqida darhol xabar bering</p>
            </div>
          </div>
        </div>

        {!isOwnProfile && (
          <div className={styles.reportSection}>
            <h4>Xavfsizlik bo'yicha xabar berish</h4>
            <p>Agar bu sotuvchi bilan bog'liq xavfsizlik muammosi bo'lsa, bizga xabar bering.</p>
            <button 
              className={styles.reportBtn}
              onClick={() => onReportConcern?.('safety_concern')}
            >
              <MdReport />
              <span>Muammo haqida xabar berish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettingsTab = () => {
    if (!isOwnProfile) {
      return (
        <div className={styles.tabContent}>
          <div className={styles.noAccess}>
            <MdLock />
            <h3>Kirish taqiqlangan</h3>
            <p>Faqat sotuvchi o'z sozlamalarini ko'rishi va o'zgartirishi mumkin.</p>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.tabContent}>
        <div className={styles.settingsHeader}>
          <h3>Ota-onalar nazorati sozlamalari</h3>
          <div className={styles.settingsActions}>
            {isEditing ? (
              <>
                <button className={styles.saveBtn} onClick={handleSaveSettings}>
                  <MdSave />
                  <span>Saqlash</span>
                </button>
                <button className={styles.cancelBtn} onClick={() => setIsEditing(false)}>
                  <MdCancel />
                  <span>Bekor qilish</span>
                </button>
              </>
            ) : (
              <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                <MdEdit />
                <span>Tahrirlash</span>
              </button>
            )}
          </div>
        </div>

        <div className={styles.settingsForm}>
          <div className={styles.settingGroup}>
            <h4>Asosiy sozlamalar</h4>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h5>Ota-ona roziligi talab qilinsin</h5>
                <p>Har bir buyurtma uchun ota-ona tasdigi</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={parentalSettings.requireParentApproval}
                  onChange={(e) => handleSettingsUpdate('requireParentApproval', e.target.checked)}
                  disabled={!isEditing}
                />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h5>Maksimal buyurtma qiymati</h5>
                <p>Ota-ona tasdiqisiz amalga oshirilishi mumkin bo'lgan maksimal summa</p>
              </div>
              <div className={styles.amountInput}>
                <input
                  type="number"
                  value={parentalSettings.maxOrderValue}
                  onChange={(e) => handleSettingsUpdate('maxOrderValue', parseInt(e.target.value))}
                  disabled={!isEditing}
                  min="0"
                  step="10000"
                />
                <span>so'm</span>
              </div>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h5>Faqat xavfsiz kontent</h5>
                <p>Faqat bolalar uchun mos kontentni ko'rsatish</p>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={parentalSettings.safeContentOnly}
                  onChange={(e) => handleSettingsUpdate('safeContentOnly', e.target.checked)}
                  disabled={!isEditing}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          <div className={styles.settingGroup}>
            <h4>Yosh guruhlari</h4>
            <p>Qaysi yosh guruhlariga mahsulot sotishni xohlaysiz?</p>
            
            <div className={styles.ageGroups}>
              {['0-2', '3-5', '6-8', '9-12', '13+'].map((ageGroup) => (
                <label key={ageGroup} className={styles.ageGroupOption}>
                  <input
                    type="checkbox"
                    checked={parentalSettings.allowedAgeGroups.includes(ageGroup)}
                    onChange={(e) => {
                      const newGroups = e.target.checked
                        ? [...parentalSettings.allowedAgeGroups, ageGroup]
                        : parentalSettings.allowedAgeGroups.filter(g => g !== ageGroup);
                      handleSettingsUpdate('allowedAgeGroups', newGroups);
                    }}
                    disabled={!isEditing}
                  />
                  <span>{ageGroup} yosh</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.settingGroup}>
            <h4>Favqulotda aloqa</h4>
            <p>Favqulotda holatlar uchun aloqa ma'lumotlari</p>
            
            <div className={styles.emergencyContact}>
              <div className={styles.contactField}>
                <label>Ism</label>
                <input
                  type="text"
                  value={parentalSettings.emergencyContact.name}
                  onChange={(e) => handleSettingsUpdate('emergencyContact', {
                    ...parentalSettings.emergencyContact,
                    name: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
              
              <div className={styles.contactField}>
                <label>Telefon</label>
                <input
                  type="tel"
                  value={parentalSettings.emergencyContact.phone}
                  onChange={(e) => handleSettingsUpdate('emergencyContact', {
                    ...parentalSettings.emergencyContact,
                    phone: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
              
              <div className={styles.contactField}>
                <label>Aloqa</label>
                <input
                  type="text"
                  value={parentalSettings.emergencyContact.relationship}
                  onChange={(e) => handleSettingsUpdate('emergencyContact', {
                    ...parentalSettings.emergencyContact,
                    relationship: e.target.value
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.sellerProfilePages} ${className}`}>
      {/* Navigation Tabs */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <MdAccountBox />
          <span>Profil</span>
        </button>
        
        <button
          className={`${styles.tabButton} ${activeTab === 'verification' ? styles.active : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          <MdVerifiedUser />
          <span>Tekshiruv</span>
        </button>
        
        <button
          className={`${styles.tabButton} ${activeTab === 'safety' ? styles.active : ''}`}
          onClick={() => setActiveTab('safety')}
        >
          <MdShield />
          <span>Xavfsizlik</span>
        </button>
        
        {isOwnProfile && (
          <button
            className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <MdSettings />
            <span>Sozlamalar</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContentContainer}>
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'verification' && renderVerificationTab()}
        {activeTab === 'safety' && renderSafetyTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

export default EnhancedSellerProfilePages;