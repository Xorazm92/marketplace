import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './CartItemGallery.module.scss';

interface CartImage {
  id: string;
  url: string;
  alt: string;
}

interface CartItemGalleryProps {
  images: CartImage[];
  productTitle: string;
  size?: 'small' | 'medium' | 'large';
  showIndicators?: boolean;
  autoSlide?: boolean;
  className?: string;
}

const CartItemGallery: React.FC<CartItemGalleryProps> = ({
  images,
  productTitle,
  size = 'medium',
  showIndicators = true,
  autoSlide = false,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Auto-slide functionality
  useEffect(() => {
    if (autoSlide && images.length > 1 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [autoSlide, images.length, isHovered]);

  // Preload images
  useEffect(() => {
    images.forEach((image, index) => {
      if (!loadedImages.has(index)) {
        const img = new window.Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(index));
        };
        img.src = image.url;
      }
    });
  }, [images, loadedImages]);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const handleIndicatorClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const getOptimizedImageUrl = (url: string, width: number) => {
    // Cloudinary optimization
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},q_80,f_auto/`);
    }
    
    // AWS S3 optimization
    if (url.includes('amazonaws.com')) {
      return `${url}?w=${width}&q=80&fm=webp`;
    }
    
    return url;
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { width: 80, height: 80, imageWidth: 120 };
      case 'large':
        return { width: 200, height: 200, imageWidth: 400 };
      default:
        return { width: 120, height: 120, imageWidth: 240 };
    }
  };

  const { width, height, imageWidth } = getSizeConfig();

  if (!images || images.length === 0) {
    return (
      <div className={`${styles.gallery} ${styles[size]} ${className}`}>
        <div className={styles.placeholder}>
          <span>📦</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${styles.gallery} ${styles[size]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        {/* Main Image */}
        <div className={styles.imageWrapper}>
          <Image
            src={getOptimizedImageUrl(images[currentIndex].url, imageWidth)}
            alt={images[currentIndex].alt || `${productTitle} - rasm ${currentIndex + 1}`}
            width={width}
            height={height}
            className={styles.mainImage}
            quality={80}
            loading="lazy"
            sizes={`${width}px`}
          />
          
          {/* Loading overlay */}
          {!loadedImages.has(currentIndex) && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
            </div>
          )}
        </div>

        {/* Navigation arrows - only show on hover and if multiple images */}
        {images.length > 1 && isHovered && (
          <>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={handlePrevious}
              aria-label="Oldingi rasm"
            >
              <FiChevronLeft />
            </button>
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={handleNext}
              aria-label="Keyingi rasm"
            >
              <FiChevronRight />
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && isHovered && (
          <div className={styles.imageCounter}>
            {currentIndex + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Indicator dots */}
      {showIndicators && images.length > 1 && (
        <div className={styles.indicators}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${index === currentIndex ? styles.active : ''}`}
              onClick={(e) => handleIndicatorClick(index, e)}
              aria-label={`Rasm ${index + 1}ga o'tish`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CartItemGallery;
