import React from 'react';
import { 
  FaShieldAlt, 
  FaHeart, 
  FaUserShield, 
  FaLock, 
  FaCertificate,
  FaStar,
  FaCheck,
  FaHandshake
} from 'react-icons/fa';
import { 
  MdChildCare, 
  MdVerifiedUser, 
  MdSecurity, 
  MdFamilyRestroom,
  MdLocalShipping,
  MdPayment,
  MdSupport,
  MdThumbUp
} from 'react-icons/md';
import { 
  FiShield, 
  FiCheckCircle, 
  FiTruck, 
  FiCreditCard,
  FiPhone
} from 'react-icons/fi';
import styles from './TrustBadges.module.scss';

// Trust Badge Component
interface TrustBadgeProps {
  type: 'parent-approved' | 'safe-payment' | 'verified-seller' | 'fast-shipping' | 'kids-safe' | 'money-back' | 'customer-support' | 'ssl-secure';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ 
  type, 
  size = 'md', 
  showText = true, 
  variant = 'default' 
}) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'parent-approved':
        return {
          icon: <MdFamilyRestroom />,
          title: 'Ota-onalar tasdiqlagan',
          description: 'Bolalar uchun xavfsiz va ta\\'limiy',
          color: 'green',
          bgColor: '#22c55e',
          textColor: '#ffffff'
        };
      case 'safe-payment':
        return {
          icon: <FiCreditCard />,
          title: 'Xavfsiz to\\'lov',
          description: 'Bank darajasidagi shifrlash',
          color: 'blue',
          bgColor: '#3b82f6',
          textColor: '#ffffff'
        };
      case 'verified-seller':
        return {
          icon: <MdVerifiedUser />,
          title: 'Tekshirilgan sotuvchi',
          description: 'Ishonchli va sifatli xizmat',
          color: 'orange',
          bgColor: '#f16521',
          textColor: '#ffffff'
        };
      case 'fast-shipping':
        return {
          icon: <FiTruck />,
          title: 'Tez yetkazib berish',
          description: '24-48 soat ichida',
          color: 'purple',
          bgColor: '#8b5cf6',
          textColor: '#ffffff'
        };
      case 'kids-safe':
        return {
          icon: <MdChildCare />,
          title: 'Bolalar uchun xavfsiz',
          description: 'Zararsiz materiallar',
          color: 'pink',
          bgColor: '#ec4899',
          textColor: '#ffffff'
        };
      case 'money-back':
        return {
          icon: <FaHandshake />,
          title: 'Pul qaytarish kafolati',
          description: '30 kun ichida',
          color: 'teal',
          bgColor: '#14b8a6',
          textColor: '#ffffff'
        };
      case 'customer-support':
        return {
          icon: <FiPhone />,
          title: '24/7 qo\\'llab-quvvatlash',
          description: 'Har doim yordam berishga tayyormiz',
          color: 'indigo',
          bgColor: '#6366f1',
          textColor: '#ffffff'
        };
      case 'ssl-secure':
        return {
          icon: <FaLock />,
          title: 'SSL himoyalangan',
          description: 'Ma\\'lumotlaringiz xavfsiz',
          color: 'red',
          bgColor: '#ef4444',
          textColor: '#ffffff'
        };
      default:
        return {
          icon: <FaShieldAlt />,
          title: 'Xavfsiz',
          description: 'Ishonchli xizmat',
          color: 'gray',
          bgColor: '#6b7280',
          textColor: '#ffffff'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div 
      className={`${styles.trustBadge} ${styles[size]} ${styles[variant]} ${styles[config.color]}`}
      style={{
        '--badge-bg': config.bgColor,
        '--badge-text': config.textColor
      } as React.CSSProperties}
    >
      <div className={styles.badgeIcon}>
        {config.icon}
      </div>
      {showText && (
        <div className={styles.badgeContent}>
          <span className={styles.badgeTitle}>{config.title}</span>
          {variant === 'detailed' && (
            <span className={styles.badgeDescription}>{config.description}</span>
          )}
        </div>
      )}
    </div>
  );
};

// Trust Banner Component
interface TrustBannerProps {
  badges?: TrustBadgeProps['type'][];
  theme?: 'light' | 'dark' | 'kids';
  layout?: 'horizontal' | 'grid';
}

export const TrustBanner: React.FC<TrustBannerProps> = ({ 
  badges = ['parent-approved', 'safe-payment', 'verified-seller', 'kids-safe'],
  theme = 'light',
  layout = 'horizontal'
}) => {
  return (
    <div className={`${styles.trustBanner} ${styles[theme]} ${styles[layout]}`}>
      <div className={styles.bannerHeader}>
        <div className={styles.bannerIcon}>
          <FaShieldAlt />
        </div>
        <div className={styles.bannerContent}>
          <h3 className={styles.bannerTitle}>Ishonch va xavfsizlik bizning ustuvorligimiz</h3>
          <p className={styles.bannerSubtitle}>Bolalar va ota-onalar uchun eng xavfsiz va ishonchli marketplace</p>
        </div>
      </div>
      
      <div className={styles.badgeContainer}>
        {badges.map((badgeType, index) => (
          <TrustBadge 
            key={index}
            type={badgeType}
            size=\"md\"
            variant=\"compact\"
          />
        ))}
      </div>
    </div>
  );
};

// Kids Safety Component
export const KidsSafetyIndicator: React.FC = () => {
  const safetyFeatures = [
    {
      icon: <MdChildCare />,
      title: 'Yosh bo\\'yicha mos',
      description: 'Har bir mahsulot yosh guruhiga mos ravishda tanlab berilgan'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Zararsiz materiallar',
      description: 'Barcha mahsulotlar bolalar uchun xavfsiz materiallardan tayyorlangan'
    },
    {
      icon: <MdVerifiedUser />,
      title: 'Tekshirilgan sotuvchilar',
      description: 'Faqat ishonchli va tekshirilgan sotuvchilar bilan hamkorlik'
    },
    {
      icon: <FaHeart />,
      title: 'Ota-onalar tanlov',
      description: 'Boshqa ota-onalar tomonidan tavsiya etilgan mahsulotlar'
    }
  ];

  return (
    <div className={styles.kidsSafety}>
      <div className={styles.safetyHeader}>
        <div className={styles.safetyIcon}>
          <MdChildCare />
        </div>
        <h3 className={styles.safetyTitle}>Bolalar xavfsizligi - bizning eng muhim vazifamiz</h3>
      </div>
      
      <div className={styles.safetyFeatures}>
        {safetyFeatures.map((feature, index) => (
          <div key={index} className={styles.safetyFeature}>
            <div className={styles.featureIcon}>
              {feature.icon}
            </div>
            <div className={styles.featureContent}>
              <h4 className={styles.featureTitle}>{feature.title}</h4>
              <p className={styles.featureDescription}>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.safetyActions}>
        <button className={styles.safetyButton}>
          <FiCheckCircle />
          <span>Xavfsizlik bo\\'yicha qo\\'llanma</span>
        </button>
        <button className={styles.safetyButton}>
          <FiPhone />
          <span>Ota-onalar uchun yordam</span>
        </button>
      </div>
    </div>
  );
};

// Product Safety Badge
interface ProductSafetyBadgeProps {
  ageRange: string;
  certified: boolean;
  parentApproved: boolean;
  safetyRating: number;
}

export const ProductSafetyBadge: React.FC<ProductSafetyBadgeProps> = ({
  ageRange,
  certified,
  parentApproved,
  safetyRating
}) => {
  return (
    <div className={styles.productSafetyBadge}>
      <div className={styles.ageRange}>
        <MdChildCare />
        <span>{ageRange}</span>
      </div>
      
      {certified && (
        <div className={styles.certified}>
          <FaCertificate />
          <span>Sertifikatlangan</span>
        </div>
      )}
      
      {parentApproved && (
        <div className={styles.parentApproved}>
          <MdThumbUp />
          <span>Ota-onalar tasdiqlagan</span>
        </div>
      )}
      
      <div className={styles.safetyRating}>
        <div className={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <FaStar 
              key={i} 
              className={i < safetyRating ? styles.starFilled : styles.starEmpty}
            />
          ))}
        </div>
        <span className={styles.ratingText}>Xavfsizlik reytingi</span>
      </div>
    </div>
  );
};

// Parent Control Info
export const ParentControlInfo: React.FC = () => {
  return (
    <div className={styles.parentControl}>
      <div className={styles.controlHeader}>
        <MdSecurity />
        <h3>Ota-onalar nazorati</h3>
      </div>
      
      <div className={styles.controlFeatures}>
        <div className={styles.controlFeature}>
          <FaLock />
          <div>
            <h4>Xarid chegarasi</h4>
            <p>Kunlik va oylik xarid chegaralarini belgilang</p>
          </div>
        </div>
        
        <div className={styles.controlFeature}>
          <MdPayment />
          <div>
            <h4>To\\'lov nazorati</h4>
            <p>Har bir xaridni tasdiqlash talab qilinadi</p>
          </div>
        </div>
        
        <div className={styles.controlFeature}>
          <FiCheckCircle />
          <div>
            <h4>Mahsulot filtri</h4>
            <p>Faqat yosh guruhiga mos mahsulotlarni ko\\'rsatish</p>
          </div>
        </div>
        
        <div className={styles.controlFeature}>
          <MdSupport />
          <div>
            <h4>Faoliyat hisoboti</h4>
            <p>Bolangizning saytdagi faoliyati haqida hisobot</p>
          </div>
        </div>
      </div>
      
      <button className={styles.setupControlButton}>
        <MdSecurity />
        <span>Ota-onalar nazoratini sozlash</span>
      </button>
    </div>
  );
};

// Default export
export default TrustBadge;