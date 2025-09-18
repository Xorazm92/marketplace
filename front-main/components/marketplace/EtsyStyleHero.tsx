import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './EtsyStyleHero.module.scss';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  link: string;
  category: string;
}

const EtsyStyleHero: React.FC = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides: HeroSlide[] = [
    {
      id: 1,
      title: "Bolalar uchun xavfsiz o'yinchoqlar",
      subtitle: "Har bir bola uchun maxsus",
      description: "3 yoshdan 12 yoshgacha bo'lgan bolalar uchun ta'limiy va qiziqarli o'yinchoqlar",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop&crop=center",
      cta: "O'yinchoqlarni ko'rish",
      link: "/category/toys",
      category: "O'yinchoqlar"
    },
    {
      id: 2,
      title: "Ta'limiy kitoblar va materiallar",
      subtitle: "Bilim - kelajak kaliti",
      description: "Bolalarning intellektual rivojlanishi uchun eng yaxshi kitoblar",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=600&fit=crop&crop=center",
      cta: "Kitoblarni ko'rish",
      link: "/category/books",
      category: "Kitoblar"
    },
    {
      id: 3,
      title: "Bolalar kiyimlari",
      subtitle: "Zamonaviy va qulay",
      description: "Yumshoq materiallardan tayyorlangan, bolalar uchun xavfsiz kiyimlar",
      image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&h=600&fit=crop&crop=center",
      cta: "Kiyimlarni ko'rish",
      link: "/category/clothing",
      category: "Kiyimlar"
    },
    {
      id: 4,
      title: "Sport anjomlari",
      subtitle: "Faol hayot uchun",
      description: "Bolalarning jismoniy rivojlanishi uchun sifatli sport anjomlari",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&crop=center",
      cta: "Sport anjomlarini ko'rish",
      link: "/category/sports",
      category: "Sport"
    },
    {
      id: 5,
      title: "Maktab buyumlari",
      subtitle: "Ta'lim uchun zarur",
      description: "Maktabda o'qish uchun barcha zarur buyumlar va materiallar",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=600&fit=crop&crop=center",
      cta: "Maktab buyumlarini ko'rish",
      link: "/category/school",
      category: "Maktab"
    },
    {
      id: 6,
      title: "Elektronika",
      subtitle: "Zamonaviy texnologiya",
      description: "Bolalar uchun xavfsiz va ta'limiy elektronika mahsulotlari",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=600&fit=crop&crop=center",
      cta: "Elektronikani ko'rish",
      link: "/category/electronics",
      category: "Elektronika"
    },
    {
      id: 7,
      title: "Chaqaloq mahsulotlari",
      subtitle: "Eng kichiklar uchun",
      description: "Chaqaloqlar uchun xavfsiz va sifatli mahsulotlar",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop&crop=center",
      cta: "Chaqaloq mahsulotlarini ko'rish",
      link: "/category/baby",
      category: "Chaqaloq"
    },
    {
      id: 8,
      title: "Sog'lik mahsulotlari",
      subtitle: "Salomatlik uchun",
      description: "Bolalar salomatligi uchun zarur mahsulotlar va vitaminlar",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop&crop=center",
      cta: "Sog'lik mahsulotlarini ko'rish",
      link: "/category/health",
      category: "Sog'lik"
    }
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);


  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentHero = heroSlides[currentSlide];

  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        {/* Left Content */}
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <span className={styles.heroCategory}>{currentHero.category}</span>
            <h1 className={styles.heroTitle}>{currentHero.title}</h1>
            <h2 className={styles.heroSubtitle}>{currentHero.subtitle}</h2>
            <p className={styles.heroDescription}>{currentHero.description}</p>
            
            <button
              className={styles.heroCta}
              onClick={() => router.push(currentHero.link)}
            >
              {currentHero.cta}
              <span className={styles.ctaArrow}>→</span>
            </button>
          </div>
        </div>

        {/* Right Content - Featured Image */}
        <div className={styles.heroImageSection}>
          <div className={styles.heroImageContainer}>
            <img
              src={currentHero.image}
              alt={currentHero.title}
              className={styles.heroMainImage}
              loading="eager"
            />
            <div className={styles.heroImageOverlay} />
          </div>
        </div>

        {/* Slide Indicators */}
        <div className={styles.slideIndicators}>
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${
                index === currentSlide ? styles.active : ''
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Slide ${index + 1}ga o'tish`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          className={`${styles.navArrow} ${styles.prevArrow}`}
          onClick={() => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
          aria-label="Oldingi slayd"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          className={`${styles.navArrow} ${styles.nextArrow}`}
          onClick={() => goToSlide((currentSlide + 1) % heroSlides.length)}
          aria-label="Keyingi slayd"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default EtsyStyleHero;
