import React from 'react';
import { FiShield, FiTruck, FiHeart, FiAward, FiUsers, FiClock } from 'react-icons/fi';
import styles from './WhyChooseUs.module.scss';

interface Feature {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const WhyChooseUs: React.FC = () => {
  const features: Feature[] = [
    {
      id: 1,
      icon: <FiShield />,
      title: "100% Xavfsiz",
      description: "Barcha mahsulotlar sifat nazoratidan o'tgan va bolalar uchun mutlaqo xavfsiz",
      color: "#4CAF50"
    },
    {
      id: 2,
      icon: <FiTruck />,
      title: "Tez Yetkazib Berish",
      description: "24-48 soat ichida barcha buyurtmalarni yetkazib beramiz",
      color: "#2196F3"
    },
    {
      id: 3,
      icon: <FiHeart />,
      title: "Bolalar Uchun Maxsus",
      description: "Har bir mahsulot bolalarning yoshi va ehtiyojlariga mos ravishda tanlangan",
      color: "#E91E63"
    },
    {
      id: 4,
      icon: <FiAward />,
      title: "Sifat Kafolati",
      description: "14 kun ichida mahsulotni qaytarish yoki almashtirish imkoniyati",
      color: "#FF9800"
    },
    {
      id: 5,
      icon: <FiUsers />,
      title: "Oilaviy Biznes",
      description: "Kichik bizneslarni qo'llab-quvvatlash va mahalliy ishlab chiqaruvchilar bilan hamkorlik",
      color: "#9C27B0"
    },
    {
      id: 6,
      icon: <FiClock />,
      title: "24/7 Qo'llab-quvvatlash",
      description: "Har qanday savol yoki muammo bo'yicha doimo yordam berishga tayyormiz",
      color: "#607D8B"
    }
  ];

  return (
    <section className={styles.whyChooseUs}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Nima uchun INBOLA'ni tanlash kerak?</h2>
          <p>Biz bolalar va ota-onalar uchun eng yaxshi xizmatni taqdim etamiz</p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div 
              key={feature.id} 
              className={styles.featureCard}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className={styles.iconContainer}
                style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h3>Bugun xarid qilishni boshlang!</h3>
            <p>Minglab mahsulotlar orasidan bolalaringiz uchun eng yaxshisini toping</p>
            <div className={styles.ctaButtons}>
              <button
                className={styles.primaryBtn}
                onClick={() => window.location.href = '/categories'}
              >
                Xarid qilishni boshlash
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() => window.location.href = '/categories'}
              >
                Kategoriyalarni ko'rish
              </button>
            </div>
          </div>
          <div className={styles.ctaStats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>10K+</span>
              <span className={styles.statLabel}>Xursand oilalar</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Sotilgan mahsulotlar</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>4.8★</span>
              <span className={styles.statLabel}>O'rtacha baho</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
