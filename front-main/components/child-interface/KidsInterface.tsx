
import React, { useState, useEffect } from 'react';
import styles from './KidsInterface.module.scss';

interface KidsInterfaceProps {
  userAge: number;
  parentalControls: {
    dailySpendLimit: number;
    allowedCategories: string[];
    timeRestrictions: {
      start: string;
      end: string;
    };
  };
  onProductSelect: (productId: number) => void;
}

const KidsInterface: React.FC<KidsInterfaceProps> = ({
  userAge,
  parentalControls,
  onProductSelect,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isWithinTimeRestrictions = (): boolean => {
    const current = currentTime.getHours() * 60 + currentTime.getMinutes();
    const start = parseInt(parentalControls.timeRestrictions.start.split(':')[0]) * 60 + 
                  parseInt(parentalControls.timeRestrictions.start.split(':')[1]);
    const end = parseInt(parentalControls.timeRestrictions.end.split(':')[0]) * 60 + 
                parseInt(parentalControls.timeRestrictions.end.split(':')[1]);
    
    return current >= start && current <= end;
  };

  const getAgeAppropriateProducts = () => {
    return products.filter(product => {
      if (!(product as any).age_group) return false;
      
      const ageGroups = {
        'Infants': { min: 0, max: 2 },
        'Toddlers': { min: 3, max: 5 },
        'Early Elementary': { min: 6, max: 8 },
        'Late Elementary': { min: 9, max: 12 },
        'Teens': { min: 13, max: 17 },
      };
      
      const group = ageGroups[(product as any).age_group as keyof typeof ageGroups];
      return group && userAge >= group.min && userAge <= group.max;
    });
  };

  if (!isWithinTimeRestrictions()) {
    return (
      <div className={styles.timeRestriction}>
        <div className={styles.clockIcon}>🕐</div>
        <h2>Vaqt tugadi!</h2>
        <p>Siz faqat {parentalControls.timeRestrictions.start} dan {parentalControls.timeRestrictions.end} gacha xarid qila olasiz.</p>
        <div className={styles.currentTime}>
          Hozirgi vaqt: {currentTime.toLocaleTimeString()}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.kidsInterface}>
      <header className={styles.header}>
        <div className={styles.welcomeMessage}>
          <span className={styles.wave}>👋</span>
          <h1>Salom, kichkina do'stim!</h1>
        </div>
        <div className={styles.funStats}>
          <div className={styles.stat}>
            <span>🎯</span>
            <span>Yosh: {userAge}</span>
          </div>
          <div className={styles.stat}>
            <span>💰</span>
            <span>Bugun: ${parentalControls.dailySpendLimit} gacha</span>
          </div>
        </div>
      </header>

      <section className={styles.categories}>
        <h2>🎨 Kategoriyalar</h2>
        <div className={styles.categoryGrid}>
          {parentalControls.allowedCategories.map((category, index) => (
            <button
              key={category}
              className={`${styles.categoryCard} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              <div className={styles.categoryIcon}>
                {category === 'toys' && '🧸'}
                {category === 'books' && '📚'}
                {category === 'clothes' && '👕'}
                {category === 'sports' && '⚽'}
                {category === 'education' && '🎓'}
              </div>
              <span className={styles.categoryName}>
                {category === 'toys' && 'O\'yinchiqlar'}
                {category === 'books' && 'Kitoblar'}
                {category === 'clothes' && 'Kiyimlar'}
                {category === 'sports' && 'Sport'}
                {category === 'education' && 'Ta\'lim'}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.products}>
        <h2>✨ Sizga mos mahsulotlar</h2>
        <div className={styles.productGrid}>
          {getAgeAppropriateProducts().map((product) => (
            <div
              key={(product as any).id}
              className={styles.productCard}
              onClick={() => onProductSelect((product as any).id)}
            >
              <div className={styles.productImage}>
                <img src={(product as any).images?.[0] || '/placeholder-product.jpg'} alt={(product as any).title} />
                {(product as any).isEducational && (
                  <div className={styles.educationalBadge}>🎓 Ta'limiy</div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productTitle}>{(product as any).title}</h3>
                <div className={styles.productPrice}>
                  <span className={styles.currency}>💰</span>
                  <span className={styles.amount}>${(product as any).price}</span>
                </div>
                <div className={styles.productRating}>
                  {'⭐'.repeat(Math.floor((product as any).rating || 0))}
                  <span>({(product as any).reviewCount || 0})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.safetyReminder}>
        <div className={styles.safetyCard}>
          <span className={styles.shieldIcon}>🛡️</span>
          <div>
            <h3>Xavfsizlik eslatmasi</h3>
            <p>Har doim ota-onangiz bilan maslahatlashib xarid qiling!</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KidsInterface;
