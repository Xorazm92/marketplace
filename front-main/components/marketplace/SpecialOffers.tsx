import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiArrowRight, FiClock, FiPercent, FiStar } from 'react-icons/fi';
import styles from './SpecialOffers.module.scss';

interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  salePrice: number;
  image: string;
  category: string;
  endDate: string;
  isLimited: boolean;
  itemsLeft?: number;
}

const SpecialOffers: React.FC = () => {
  const [offers] = useState<SpecialOffer[]>([
    {
      id: 1,
      title: "Halloween essentials we love",
      description: "Seasonal supplies perfect for trick-or-treaters",
      discount: 30,
      originalPrice: 150000,
      salePrice: 105000,
      image: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&h=300&fit=crop",
      category: "Bayram buyumlari",
      endDate: "2024-10-31",
      isLimited: true,
      itemsLeft: 25
    },
    {
      id: 2,
      title: "Stunning home decor",
      description: "Beautiful pieces for every room",
      discount: 25,
      originalPrice: 200000,
      salePrice: 150000,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      category: "Uy bezagi",
      endDate: "2024-11-15",
      isLimited: false
    },
    {
      id: 3,
      title: "Etsy's special gifts for Halloween",
      description: "Unique finds for spooky season",
      discount: 40,
      originalPrice: 80000,
      salePrice: 48000,
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
      category: "Sovg'alar",
      endDate: "2024-10-31",
      isLimited: true,
      itemsLeft: 12
    }
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const calculateTimeLeft = (endDate: string) => {
    const difference = +new Date(endDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60)
      };
    }

    return timeLeft;
  };

  return (
    <section className={styles.specialOffers}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Maxsus takliflar</h2>
          <p>Cheklangan vaqt uchun ajoyib chegirmalar</p>
        </div>

        <div className={styles.offersGrid}>
          {offers.map((offer, index) => {
            const timeLeft = calculateTimeLeft(offer.endDate);
            const isMainOffer = index === 0;

            return (
              <div 
                key={offer.id} 
                className={`${styles.offerCard} ${isMainOffer ? styles.mainOffer : ''}`}
              >
                <div className={styles.imageContainer}>
                  <img 
                    src={offer.image} 
                    alt={offer.title}
                    className={styles.offerImage}
                  />
                  <div className={styles.discountBadge}>
                    <FiPercent className={styles.percentIcon} />
                    {offer.discount}% OFF
                  </div>
                  {offer.isLimited && offer.itemsLeft && (
                    <div className={styles.limitedBadge}>
                      Faqat {offer.itemsLeft} ta qoldi!
                    </div>
                  )}
                </div>

                <div className={styles.offerContent}>
                  <div className={styles.category}>
                    <FiStar className={styles.categoryIcon} />
                    {offer.category}
                  </div>
                  
                  <h3 className={styles.offerTitle}>{offer.title}</h3>
                  <p className={styles.offerDescription}>{offer.description}</p>

                  <div className={styles.priceContainer}>
                    <span className={styles.originalPrice}>
                      {formatPrice(offer.originalPrice)} so'm
                    </span>
                    <span className={styles.salePrice}>
                      {formatPrice(offer.salePrice)} so'm
                    </span>
                  </div>

                  {Object.keys(timeLeft).length > 0 && (
                    <div className={styles.countdown}>
                      <FiClock className={styles.clockIcon} />
                      <span>
                        {(timeLeft as any).days}k {(timeLeft as any).hours}s {(timeLeft as any).minutes}d qoldi
                      </span>
                    </div>
                  )}

                  <Link href={`/offers/${offer.id}`} className={styles.offerButton}>
                    <span>Taklifni ko'rish</span>
                    <FiArrowRight className={styles.arrowIcon} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.viewAllOffers}>
          <Link href="/special-offers" className={styles.viewAllButton}>
            Barcha takliflarni ko'rish
            <FiArrowRight className={styles.arrowIcon} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
