import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const popularSearches = [
    "LEGO o'yinchoqlar",
    "Ta'limiy kitoblar",
    "Bolalar kiyimlari",
    "Sport anjomlari",
    "Maktab buyumlari",
    "Chaqaloq mahsulotlari"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handlePopularSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentHero = heroSlides[currentSlide];

  return (
    <section className={styles.hero}>
      <div className={styles.heroContainer}>
        {/* Background Slider */}
        <div className={styles.heroBackground}>
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.heroSlide} ${
                index === currentSlide ? styles.active : ''
              }`}
            >
              <div className={styles.heroImage}>
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className={styles.heroOverlay} />
              </div>
            </div>
          ))}
        </div>

        {/* Hero Content */}
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

          {/* Search Section */}
          <div className={styles.heroSearch}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <div className={styles.searchInputWrapper}>
                <input
                  type="text"
                  placeholder="Qidirayotgan mahsulotingizni kiriting..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
                <button type="submit" className={styles.searchButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Popular Searches */}
            <div className={styles.popularSearches}>
              <span className={styles.popularLabel}>Mashhur qidiruvlar:</span>
              <div className={styles.popularTags}>
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    className={styles.popularTag}
                    onClick={() => handlePopularSearch(search)}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
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

      {/* Trust Indicators */}
      <div className={styles.trustIndicators}>
        <div className={styles.trustItem}>
          <div className={styles.trustIcon}>🛡️</div>
          <span>Xavfsiz to'lov</span>
        </div>
        <div className={styles.trustItem}>
          <div className={styles.trustIcon}>🚚</div>
          <span>Tez yetkazib berish</span>
        </div>
        <div className={styles.trustItem}>
          <div className={styles.trustIcon}>↩️</div>
          <span>14 kun qaytarish</span>
        </div>
        <div className={styles.trustItem}>
          <div className={styles.trustIcon}>⭐</div>
          <span>Sifat kafolati</span>
        </div>
      </div>
    </section>
  );
};

export default EtsyStyleHero;
