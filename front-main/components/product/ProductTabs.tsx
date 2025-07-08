import React, { useState } from 'react';
import styles from './ProductTabs.module.scss';

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

interface ProductTabsProps {
  description: string;
  features: string[];
  specifications: Record<string, string>;
  reviews: Review[];
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  description,
  features,
  specifications,
  reviews
}) => {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Tavsif', count: null },
    { id: 'specifications', label: 'Xususiyatlar', count: null },
    { id: 'reviews', label: 'Sharhlar', count: reviews.length }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`${styles.star} ${i <= rating ? styles.filled : ''}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className={styles.tabContent}>
            <h3>Mahsulot haqida</h3>
            <p className={styles.description}>{description}</p>
            
            {features.length > 0 && (
              <>
                <h4>Asosiy xususiyatlar:</h4>
                <ul className={styles.featuresList}>
                  {features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        );

      case 'specifications':
        return (
          <div className={styles.tabContent}>
            <h3>Texnik xususiyatlar</h3>
            <div className={styles.specificationsTable}>
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className={styles.specRow}>
                  <div className={styles.specLabel}>{key}</div>
                  <div className={styles.specValue}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className={styles.tabContent}>
            <div className={styles.reviewsHeader}>
              <h3>Mijozlar sharhlari ({reviews.length})</h3>
              <button className={styles.writeReviewBtn}>
                Sharh yozish
              </button>
            </div>

            {reviews.length > 0 ? (
              <div className={styles.reviewsList}>
                {reviews.map((review) => (
                  <div key={review.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewerInfo}>
                        <span className={styles.reviewerName}>{review.userName}</span>
                        {review.verified && (
                          <span className={styles.verifiedBadge}>✓ Tasdiqlangan</span>
                        )}
                      </div>
                      <div className={styles.reviewMeta}>
                        <div className={styles.reviewRating}>
                          {renderStars(review.rating)}
                        </div>
                        <span className={styles.reviewDate}>
                          {formatDate(review.date)}
                        </span>
                      </div>
                    </div>
                    <p className={styles.reviewComment}>{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noReviews}>
                <p>Hozircha sharhlar yo'q. Birinchi bo'lib sharh yozing!</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.productTabs}>
      <div className={styles.tabsHeader}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={styles.tabCount}>({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.tabsBody}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProductTabs;
