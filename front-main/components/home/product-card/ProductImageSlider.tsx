import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import OptimizedImage from '../../common/OptimizedImage';
import styles from './product-slider.module.scss';

interface ProductImage {
  id: number;
  url: string;
  product_id: number;
}

interface ProductImageSliderProps {
  images: (ProductImage | string)[];
  title: string;
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

const ProductImageSlider: React.FC<ProductImageSliderProps> = ({
  images,
  title,
  autoSlide = true,
  autoSlideInterval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide || isHovered || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, autoSlideInterval, images.length, isHovered]);

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        <OptimizedImage
          src="/img/placeholder-product.jpg"
          alt={title}
          width={300}
          height={200}
          className={styles.image}
          fallbackSrc="/img/placeholder-product.jpg"
        />
      </div>
    );
  }

  const getImageUrl = (image: ProductImage | string) => {
    let imageUrl = typeof image === 'string' ? image : image.url;

    // Agar URL allaqachon to'liq bo'lsa
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    // Agar faqat fayl nomi bo'lsa (masalan: "1igjbf1dmmm.jpg")
    if (!imageUrl.startsWith('/')) {
      return `http://localhost:3001/uploads/${imageUrl}`;
    }

    // Agar /uploads/ bilan boshlansa
    if (imageUrl.startsWith('/uploads/')) {
      return `http://localhost:3001${imageUrl}`;
    }

    // Boshqa holatlarda placeholder
    return "/img/placeholder-product.jpg";
  };

  return (
    <div 
      className={styles.sliderContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <OptimizedImage
          src={getImageUrl(images[currentIndex])}
          alt={`${title} - ${currentIndex + 1}`}
          width={300}
          height={200}
          className={styles.image}
          fallbackSrc="/img/placeholder-product.jpg"
          lazy={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Navigation arrows - only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <FaChevronLeft />
            </button>
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={goToNext}
              aria-label="Next image"
            >
              <FaChevronRight />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className={styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Dots indicator - only show if more than 1 image */}
      {images.length > 1 && (
        <div className={styles.dotsContainer}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={(e) => goToSlide(index, e)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageSlider;
