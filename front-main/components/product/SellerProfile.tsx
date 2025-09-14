import React, { useState } from 'react';
import {
  FiStar,
  FiMapPin,
  FiClock,
  FiTruck,
  FiShield,
  FiMessageCircle,
  FiExternalLink,
  FiAward,
  FiUsers,
  FiPackage
} from 'react-icons/fi';
import {
  MdVerifiedUser,
  MdChildCare,
  MdSecurity,
  MdLocalShipping,
  MdThumbUp,
  MdStore
} from 'react-icons/md';
import { FaHeart, FaCertificate, FaMedal } from 'react-icons/fa';
import { TrustBadge } from '../common/TrustBadges';
import styles from './SellerProfile.module.scss';

interface Seller {
  id: number;
  name: string;
  displayName: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  totalSales: number;
  memberSince: string;
  location: string;
  responseTime: string;
  shippingTime: string;
  isVerified: boolean;
  isTopSeller: boolean;
  isPremium: boolean;
  specializations: string[];
  certifications: string[];
  policies: {
    returns: string;
    exchanges: string;
    cancellations: string;
  };
  stats: {
    totalProducts: number;
    activeListings: number;
    soldThisMonth: number;
    repeatCustomers: number;
  };
  badges: string[];
  description: string;
}

interface SellerProfileProps {
  seller: Seller;
  productId?: number;
  onContactSeller?: () => void;
  onViewShop?: () => void;
  onFollowSeller?: () => void;
}

const SellerProfile: React.FC<SellerProfileProps> = ({
  seller,
  productId,
  onContactSeller,
  onViewShop,
  onFollowSeller
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollowSeller?.();
  };

  const formatMemberSince = (date: string) => {
    const memberDate = new Date(date);
    const now = new Date();
    const years = now.getFullYear() - memberDate.getFullYear();
    
    if (years >= 1) {
      return `${years} yil`;
    }
    
    const months = (now.getFullYear() - memberDate.getFullYear()) * 12 + now.getMonth() - memberDate.getMonth();
    return `${months} oy`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#22c55e';
    if (rating >= 4.0) return '#f59e0b';
    if (rating >= 3.5) return '#f97316';
    return '#ef4444';
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className={styles.sellerProfile}>
      {/* Seller Header */}
      <div className={styles.sellerHeader}>
        <div className={styles.sellerBasicInfo}>
          <div className={styles.avatarContainer}>
            <img 
              src={seller.avatar || '/img/default-avatar.jpg'} 
              alt={seller.displayName}
              className={styles.avatar}
            />
            {seller.isVerified && (
              <div className={styles.verifiedBadge}>
                <MdVerifiedUser />
              </div>
            )}
          </div>
          
          <div className={styles.sellerInfo}>
            <div className={styles.sellerName}>
              <h3>{seller.displayName}</h3>
              {seller.isTopSeller && (
                <span className={styles.topSellerBadge}>
                  <FaMedal />
                  <span>Top Seller</span>
                </span>
              )}
            </div>
            
            <div className={styles.sellerRating}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={i < Math.floor(seller.rating) ? styles.starFilled : styles.starEmpty}
                    style={{ color: i < Math.floor(seller.rating) ? getRatingColor(seller.rating) : undefined }}
                  />
                ))}
              </div>
              <span className={styles.ratingValue}>({seller.rating.toFixed(1)})</span>
              <span className={styles.reviewCount}>{seller.reviewCount} ta sharh</span>
            </div>
            
            <div className={styles.sellerMeta}>
              <div className={styles.metaItem}>
                <FiMapPin />
                <span>{seller.location}</span>
              </div>
              <div className={styles.metaItem}>
                <FiClock />
                <span>{formatMemberSince(seller.memberSince)} tajriba</span>
              </div>
              <div className={styles.metaItem}>
                <FiPackage />
                <span>{seller.totalSales.toLocaleString()} ta sotilgan</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.sellerActions}>
          <button 
            className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
            onClick={handleFollow}
          >
            <FaHeart />
            <span>{isFollowing ? 'Kuzatilmoqda' : 'Kuzatish'}</span>
          </button>
          
          <button className={styles.contactBtn} onClick={onContactSeller}>
            <FiMessageCircle />
            <span>Aloqa</span>
          </button>
          
          <button className={styles.shopBtn} onClick={onViewShop}>
            <MdStore />
            <span>Do'konni ko'rish</span>
          </button>
        </div>
      </div>
      
      {/* Trust Indicators */}
      <div className={styles.trustSection}>
        <h4 className={styles.sectionTitle}>Ishonch indikatorlari</h4>
        <div className={styles.trustBadges}>
          {seller.isVerified && (
            <TrustBadge type=\"verified-seller\" size=\"sm\" />
          )}
          <TrustBadge type=\"parent-approved\" size=\"sm\" />
          <TrustBadge type=\"safe-payment\" size=\"sm\" />
          <TrustBadge type=\"fast-shipping\" size=\"sm\" />
        </div>
        
        <div className={styles.sellerStats}>
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <FiTruck />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Yetkazib berish</span>
              <span className={styles.statValue}>{seller.shippingTime}</span>
            </div>
          </div>
          
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <FiMessageCircle />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Javob berish</span>
              <span className={styles.statValue}>{seller.responseTime}</span>
            </div>
          </div>
          
          <div className={styles.statItem}>
            <div className={styles.statIcon}>
              <FiUsers />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>Doimiy mijozlar</span>
              <span className={styles.statValue}>{seller.stats.repeatCustomers}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Seller Description */}
      {seller.description && (
        <div className={styles.descriptionSection}>
          <h4 className={styles.sectionTitle}>Sotuvchi haqida</h4>
          <p className={styles.description}>
            {showFullDescription ? seller.description : truncateDescription(seller.description)}
            {seller.description.length > 150 && (
              <button 
                className={styles.toggleBtn}
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Kamroq ko\\'rsatish' : 'To\\'liq o\\'qish'}
              </button>
            )}
          </p>
        </div>
      )}
      
      {/* Specializations */}
      {seller.specializations.length > 0 && (
        <div className={styles.specializationsSection}>
          <h4 className={styles.sectionTitle}>Mutaxassisligi</h4>
          <div className={styles.specializationTags}>
            {seller.specializations.map((spec, index) => (
              <span key={index} className={styles.specializationTag}>
                <MdChildCare />
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Certifications */}
      {seller.certifications.length > 0 && (
        <div className={styles.certificationsSection}>
          <h4 className={styles.sectionTitle}>Sertifikatlar</h4>
          <div className={styles.certificationList}>
            {seller.certifications.map((cert, index) => (
              <div key={index} className={styles.certificationItem}>
                <FaCertificate />
                <span>{cert}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Shop Statistics */}
      <div className={styles.shopStatsSection}>
        <h4 className={styles.sectionTitle}>Do'kon statistikasi</h4>
        <div className={styles.statsGrid}>
          <div className={styles.statsItem}>
            <div className={styles.statsIcon}>
              <FiPackage />
            </div>
            <div className={styles.statsContent}>
              <span className={styles.statsNumber}>{seller.stats.totalProducts}</span>
              <span className={styles.statsLabel}>Jami mahsulotlar</span>
            </div>
          </div>
          
          <div className={styles.statsItem}>
            <div className={styles.statsIcon}>
              <MdStore />
            </div>
            <div className={styles.statsContent}>
              <span className={styles.statsNumber}>{seller.stats.activeListings}</span>
              <span className={styles.statsLabel}>Faol e'lonlar</span>
            </div>
          </div>
          
          <div className={styles.statsItem}>
            <div className={styles.statsIcon}>
              <FiAward />
            </div>
            <div className={styles.statsContent}>
              <span className={styles.statsNumber}>{seller.stats.soldThisMonth}</span>
              <span className={styles.statsLabel}>Bu oy sotilgan</span>
            </div>
          </div>
          
          <div className={styles.statsItem}>
            <div className={styles.statsIcon}>
              <MdThumbUp />
            </div>
            <div className={styles.statsContent}>
              <span className={styles.statsNumber}>{seller.stats.repeatCustomers}%</span>
              <span className={styles.statsLabel}>Doimiy mijozlar</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Policies */}
      <div className={styles.policiesSection}>
        <h4 className={styles.sectionTitle}>Do'kon siyosati</h4>
        <div className={styles.policiesList}>
          <div className={styles.policyItem}>
            <FiShield />
            <div>
              <strong>Qaytarish:</strong>
              <span>{seller.policies.returns}</span>
            </div>
          </div>
          
          <div className={styles.policyItem}>
            <MdLocalShipping />
            <div>
              <strong>Almashtirish:</strong>
              <span>{seller.policies.exchanges}</span>
            </div>
          </div>
          
          <div className={styles.policyItem}>
            <FiClock />
            <div>
              <strong>Bekor qilish:</strong>
              <span>{seller.policies.cancellations}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Safety Guarantee */}
      <div className={styles.safetySection}>
        <div className={styles.safetyHeader}>
          <MdSecurity className={styles.safetyIcon} />
          <div>
            <h4>Xavfsizlik kafolati</h4>
            <p>INBOLA tomonidan himoyalangan xaridlar</p>
          </div>
        </div>
        
        <ul className={styles.safetyList}>
          <li>✓ Pul qaytarish kafolati</li>
          <li>✓ Xavfsiz to'lov tizimi</li>
          <li>✓ 24/7 mijozlarni qo'llab-quvvatlash</li>
          <li>✓ Bolalar xavfsizligi sertifikati</li>
        </ul>
      </div>
    </div>
  );
};

export default SellerProfile;