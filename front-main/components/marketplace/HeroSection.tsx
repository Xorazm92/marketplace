import React, { useState, useEffect } from 'react';
import styles from './HeroSection.module.scss';

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: "/img/hero-kids.jpg",
      title: "INBOLA",
      subtitle: "Bolalar dunyosi",
      description: "0-13 yoshlar uchun mahsulotlar"
    },
    {
      id: 2,
      image: "/img/hero-kids-2.jpg",
      title: "Yangi Kolleksiya",
      subtitle: "Kuz-Qish 2024",
      description: "Issiq va zamonaviy kiyimlar"
    },
    {
      id: 3,
      image: "/img/hero-kids-3.jpg",
      title: "Ta'lim O'yinchoqlari",
      subtitle: "Rivojlantiruvchi",
      description: "Aqliy rivojlanish o'yinchoqlari"
    }
  ];

  // Auto slide - 12 sekund interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 12000); // 12 sekund

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className={styles.hero}>
      {/* Background Images - Fade Effect */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`${styles.backgroundSlide} ${index === currentSlide ? styles.active : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}

      {/* Content Overlay */}
      <div className={styles.overlay}></div>

      {/* Hero Content */}
      <div className={styles.container}>
        <div className={styles.heroContent}>
          <div className={styles.textContent}>
            <h1 className={styles.title}>
              {slides[currentSlide].title}
              <span className={styles.subtitle}>{slides[currentSlide].subtitle}</span>
            </h1>
            <p className={styles.description}>
              {slides[currentSlide].description}
            </p>
            <div className={styles.features}>
              <div className={styles.feature}>
                <span className={styles.icon}>🚚</span>
                <span>Tez yetkazib berish</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.icon}>🛡️</span>
                <span>Xavfsiz to'lov</span>
              </div>
              <div className={styles.feature}>
                <span className={styles.icon}>⭐</span>
                <span>Sifatli mahsulotlar</span>
              </div>
            </div>
            <button className={styles.ctaButton}>
              Xarid qilish
            </button>
          </div>
        </div>
      </div>


      {/* Navigation Arrows - Standart va chiroyli */}
      <button
        className={styles.prevButton}
        onClick={prevSlide}
        aria-label="Oldingi slayd"
        style={{
          position: 'absolute',
          top: '50%',
          left: '20px',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#333',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#333' }}>
          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button
        className={styles.nextButton}
        onClick={nextSlide}
        aria-label="Keyingi slayd"
        style={{
          position: 'absolute',
          top: '50%',
          right: '20px',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          color: '#333',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 10,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#333' }}>
          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className={styles.dotsContainer}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
