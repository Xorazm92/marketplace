import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FiX, FiZoomIn, FiZoomOut, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import styles from './MobileGallery.module.scss';

interface MobileImage {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

interface MobileGalleryProps {
  images: MobileImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  enablePinchZoom?: boolean;
  enableFullscreen?: boolean;
}

const MobileGallery: React.FC<MobileGalleryProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  productTitle,
  enablePinchZoom = true,
  enableFullscreen = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const swipeThreshold = 50;
  const swipeTimeThreshold = 300;

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
  }, []);

  const handlePrevious = useCallback(() => {
    if (scale > 1) return; // Don't swipe when zoomed
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(newIndex);
    resetZoom();
  }, [currentIndex, images.length, scale, resetZoom]);

  const handleNext = useCallback(() => {
    if (scale > 1) return; // Don't swipe when zoomed
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    resetZoom();
  }, [currentIndex, images.length, scale, resetZoom]);

  const getDistance = (touch1: Touch, touch2: Touch) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };

    if (e.touches.length === 2 && enablePinchZoom) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      setLastPinchDistance(distance);
    }

    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 2 && enablePinchZoom) {
      // Pinch zoom
      const distance = getDistance(e.touches[0], e.touches[1]);
      if (lastPinchDistance > 0) {
        const scaleChange = distance / lastPinchDistance;
        const newScale = Math.max(0.5, Math.min(scale * scaleChange, 5));
        setScale(newScale);
      }
      setLastPinchDistance(distance);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastTouchRef.current.x;
      const deltaY = touch.clientY - lastTouchRef.current.y;

      if (scale > 1) {
        // Pan when zoomed
        setTranslateX(prev => prev + deltaX);
        setTranslateY(prev => prev + deltaY);
      }

      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1 && scale === 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Check for swipe gesture
      if (
        Math.abs(deltaX) > swipeThreshold &&
        Math.abs(deltaX) > Math.abs(deltaY) &&
        deltaTime < swipeTimeThreshold
      ) {
        if (deltaX > 0) {
          handlePrevious();
        } else {
          handleNext();
        }
      }

      // Check for tap to zoom
      if (
        Math.abs(deltaX) < 10 &&
        Math.abs(deltaY) < 10 &&
        deltaTime < 300
      ) {
        if (scale === 1) {
          setScale(2);
          // Center zoom on tap point
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tapX = touch.clientX - rect.left;
            const tapY = touch.clientY - rect.top;
            setTranslateX((centerX - tapX) * 1);
            setTranslateY((centerY - tapY) * 1);
          }
        } else {
          resetZoom();
        }
      }
    }

    setIsDragging(false);
    setLastPinchDistance(0);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.5, 1));
  };

  const toggleFullscreen = async () => {
    if (!enableFullscreen) return;

    try {
      if (!isFullscreen) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const getOptimizedImageUrl = (url: string, width: number = 800) => {
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},q_90,f_auto/`);
    }
    
    if (url.includes('amazonaws.com')) {
      return `${url}?w=${width}&q=90&fm=webp`;
    }
    
    return url;
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.mobileGallery} ${isFullscreen ? styles.fullscreen : ''}`}>
      <div 
        ref={containerRef}
        className={styles.container}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
          
          <div className={styles.imageCounter}>
            {currentIndex + 1} / {images.length}
          </div>

          {enableFullscreen && (
            <button className={styles.fullscreenButton} onClick={toggleFullscreen}>
              {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>
          )}
        </div>

        {/* Main Image Container */}
        <div className={styles.imageContainer}>
          {isLoading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
            </div>
          )}

          <div
            ref={imageRef}
            className={styles.imageWrapper}
            style={{
              transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
          >
            <Image
              src={getOptimizedImageUrl(images[currentIndex].url)}
              alt={images[currentIndex].alt || `${productTitle} - rasm ${currentIndex + 1}`}
              width={800}
              height={800}
              className={styles.mainImage}
              quality={90}
              priority
              onLoad={handleImageLoad}
              sizes="100vw"
            />
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button 
            onClick={handleZoomOut} 
            disabled={scale <= 1}
            className={styles.controlButton}
          >
            <FiZoomOut />
          </button>
          
          <span className={styles.zoomLevel}>
            {Math.round(scale * 100)}%
          </span>
          
          <button 
            onClick={handleZoomIn} 
            disabled={scale >= 5}
            className={styles.controlButton}
          >
            <FiZoomIn />
          </button>
          
          <button 
            onClick={resetZoom} 
            disabled={scale === 1}
            className={styles.resetButton}
          >
            Reset
          </button>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className={styles.thumbnailStrip}>
            {images.map((image, index) => (
              <button
                key={image.id}
                className={`${styles.thumbnail} ${index === currentIndex ? styles.active : ''}`}
                onClick={() => {
                  setCurrentIndex(index);
                  resetZoom();
                }}
              >
                <Image
                  src={getOptimizedImageUrl(image.url, 120)}
                  alt={`Thumbnail ${index + 1}`}
                  width={60}
                  height={60}
                  className={styles.thumbnailImage}
                  quality={70}
                />
              </button>
            ))}
          </div>
        )}

        {/* Swipe Indicators */}
        {images.length > 1 && scale === 1 && (
          <div className={styles.swipeIndicators}>
            <div className={styles.swipeHint}>
              ← Chapga surish | O'ngga surish →
            </div>
          </div>
        )}

        {/* Zoom Instructions */}
        {scale === 1 && (
          <div className={styles.zoomHint}>
            Kattalashtirish uchun ikki marta bosing yoki pinch qiling
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileGallery;
