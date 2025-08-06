import React, { useState, useEffect } from 'react';
import { FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './TestimonialsSection.module.scss';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
  product: string;
  location: string;
}

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Malika Karimova",
      role: "Ona",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment: "INBOLA'dan xarid qilish juda oson va xavfsiz. Bolalarim uchun sifatli o'yinchoqlar topdim. Yetkazib berish ham tez!",
      product: "LEGO o'yinchoq to'plami",
      location: "Toshkent"
    },
    {
      id: 2,
      name: "Aziz Rahmonov",
      role: "Ota",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment: "O'g'lim uchun kitob buyurtma qildim. Juda sifatli va ta'limiy. Narxlar ham mos. Tavsiya qilaman!",
      product: "Bolalar ensiklopediyasi",
      location: "Samarqand"
    },
    {
      id: 3,
      name: "Nodira Tosheva",
      role: "O'qituvchi",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment: "Maktab buyumlari uchun eng yaxshi joy. Barcha zarur narsalarni bir joydan olish mumkin. Bolalar ham juda xursand!",
      product: "Maktab sumkasi va daftarlar",
      location: "Buxoro"
    },
    {
      id: 4,
      name: "Jasur Aliyev",
      role: "Ota",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 4,
      comment: "Qizim uchun kiyim buyurtma qildim. Sifat va dizayn juda yoqdi. Faqat yetkazib berish biroz kechikdi.",
      product: "Bolalar ko'ylagi",
      location: "Namangan"
    },
    {
      id: 5,
      name: "Sevara Usmanova",
      role: "Ona",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      comment: "Chaqaloq buyumlari uchun eng ishonchli joy. Barcha mahsulotlar xavfsiz va sifatli. Rahmat INBOLA!",
      product: "Chaqaloq o'yinchoqlari",
      location: "Andijon"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FiStar
        key={index}
        className={index < rating ? styles.starFilled : styles.starEmpty}
      />
    ));
  };

  return (
    <section className={styles.testimonials}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Mijozlarimiz fikri</h2>
          <p>Minglab ota-onalar INBOLA'ga ishonishadi</p>
        </div>

        <div className={styles.testimonialsContainer}>
          <button 
            className={`${styles.navButton} ${styles.prevButton}`}
            onClick={prevTestimonial}
            aria-label="Oldingi sharh"
          >
            <FiChevronLeft />
          </button>

          <div className={styles.testimonialsWrapper}>
            <div 
              className={styles.testimonialsSlider}
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className={styles.testimonialCard}>
                  <div className={styles.testimonialHeader}>
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className={styles.avatar}
                    />
                    <div className={styles.userInfo}>
                      <h4>{testimonial.name}</h4>
                      <p className={styles.role}>{testimonial.role} • {testimonial.location}</p>
                    </div>
                    <div className={styles.rating}>
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>

                  <blockquote className={styles.comment}>
                    "{testimonial.comment}"
                  </blockquote>

                  <div className={styles.productInfo}>
                    <span>Xarid qilingan: {testimonial.product}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            className={`${styles.navButton} ${styles.nextButton}`}
            onClick={nextTestimonial}
            aria-label="Keyingi sharh"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className={styles.indicators}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`${index + 1}-sharhga o'tish`}
            />
          ))}
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>10,000+</span>
            <span className={styles.statLabel}>Xursand mijozlar</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>4.8/5</span>
            <span className={styles.statLabel}>O'rtacha baho</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>50,000+</span>
            <span className={styles.statLabel}>Sotilgan mahsulotlar</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
