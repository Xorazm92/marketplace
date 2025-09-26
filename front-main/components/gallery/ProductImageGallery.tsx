import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FiZoomIn, FiZoomOut, FiMaximize2, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { MdRotate360 } from 'react-icons/md';
import styles from './ProductImageGallery.module.scss';

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  is360?: boolean;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productTitle: string;
  className?: string;
  enableZoom?: boolean;
  enable360?: boolean;
  enableLightbox?: boolean;
  autoPlay?: boolean;
  showThumbnails?: boolean;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productTitle,
  className = '',
  enableZoom = true,
  enable360 = false,
  enableLightbox = true,
  autoPlay = false,
  showThumbnails = true
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [is360Active, setIs360Active] = useState(false);
  const [rotation360, setRotation360] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const mainImageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const currentImage = images[currentImageIndex];

  // Preload adjacent images
  useEffect(() => {
    const preloadImage = (index: number) => {
      if (images[index] && !loadedImages.has(index)) {
        const img = new window.Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(index));
        };
        img.src = images[index].url;
      }
    };

    // Preload current, next and previous images
    preloadImage(currentImageIndex);
    if (currentImageIndex > 0) preloadImage(currentImageIndex - 1);
    if (currentImageIndex < images.length - 1) preloadImage(currentImageIndex + 1);
  }, [currentImageIndex, images, loadedImages]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1 && !isLightboxOpen) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [autoPlay, images.length, isLightboxOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevImage();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        case 'Escape':
          closeLightbox();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetZoom();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, currentImageIndex]);

  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index);
    resetZoom();
    setIs360Active(false);
  };

  const handlePrevImage = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    handleImageChange(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    handleImageChange(newIndex);
  };

  const openLightbox = () => {
    if (enableLightbox) {
      setIsLightboxOpen(true);
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
    resetZoom();
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 8));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 1));
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!enableZoom || zoomLevel === 1) return;

    const rect = mainImageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [enableZoom, zoomLevel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - zoomPosition.x, y: e.clientY - zoomPosition.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel === 1) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setZoomPosition({
      x: Math.max(-50, Math.min(150, newX)),
      y: Math.max(-50, Math.min(150, newY))
    });
  };

  const handle360Drag = (e: React.MouseEvent) => {
    if (!is360Active || !currentImage.is360) return;

    const rect = mainImageRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const rotation = (x / rect.width) * 360;
    setRotation360(rotation);
  };

  const toggle360View = () => {
    if (currentImage.is360) {
      setIs360Active(!is360Active);
      resetZoom();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const getImageSizes = () => {
    return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  };

  const getOptimizedImageUrl = (url: string, width: number, quality: number = 80) => {
    // Cloudinary optimization example
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
    }
    
    // AWS S3 optimization example
    if (url.includes('amazonaws.com')) {
      return `${url}?w=${width}&q=${quality}&fm=webp`;
    }
    
    return url;
  };

  return (
    <div className={`${styles.gallery} ${className}`}>
      {/* Main Image Display */}
      <div 
        className={styles.mainImageContainer}
        ref={mainImageRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={openLightbox}
      >
        {isLoading && (
          <div className={styles.imageLoader}>
            <div className={styles.spinner}></div>
          </div>
        )}
        
        <div 
          className={styles.imageWrapper}
          style={{
            transform: is360Active 
              ? `rotateY(${rotation360}deg)` 
              : `scale(${zoomLevel}) translate(${zoomPosition.x}px, ${zoomPosition.y}px)`,
            cursor: zoomLevel > 1 ? 'grab' : 'zoom-in'
          }}
          onMouseMove={is360Active ? handle360Drag : handleDrag}
        >
          <Image
            ref={imageRef}
            src={getOptimizedImageUrl(currentImage.url, 800)}
            alt={currentImage.alt || `${productTitle} - rasm ${currentImageIndex + 1}`}
            width={800}
            height={800}
            sizes={getImageSizes()}
            priority={currentImageIndex === 0}
            onLoad={handleImageLoad}
            className={styles.mainImage}
            quality={90}
          />
        </div>

        {/* Image Controls */}
        <div className={styles.imageControls}>
          {enableZoom && (
            <div className={styles.zoomControls}>
              <button onClick={handleZoomIn} disabled={zoomLevel >= 8}>
                <FiZoomIn />
              </button>
              <span>{Math.round(zoomLevel * 100)}%</span>
              <button onClick={handleZoomOut} disabled={zoomLevel <= 1}>
                <FiZoomOut />
              </button>
              <button onClick={resetZoom} disabled={zoomLevel === 1}>
                Reset
              </button>
            </div>
          )}

          {enable360 && currentImage.is360 && (
            <button 
              className={`${styles.view360Button} ${is360Active ? styles.active : ''}`}
              onClick={toggle360View}
            >
              <MdRotate360 />
              360°
            </button>
          )}

          {enableLightbox && (
            <button className={styles.fullscreenButton} onClick={openLightbox}>
              <FiMaximize2 />
            </button>
          )}
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
            >
              <FiChevronLeft />
            </button>
            <button 
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
            >
              <FiChevronRight />
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className={styles.imageCounter}>
          {currentImageIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Carousel */}
      {showThumbnails && images.length > 1 && (
        <div className={styles.thumbnailContainer}>
          <div className={styles.thumbnailCarousel}>
            {images.map((image, index) => (
              <button
                key={image.id}
                className={`${styles.thumbnail} ${index === currentImageIndex ? styles.active : ''}`}
                onClick={() => handleImageChange(index)}
              >
                <Image
                  src={getOptimizedImageUrl(image.url, 120)}
                  alt={`${productTitle} thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className={styles.thumbnailImage}
                  quality={70}
                />
                {image.is360 && (
                  <div className={styles.thumbnail360Badge}>
                    <MdRotate360 />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className={styles.lightbox} onClick={closeLightbox}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={closeLightbox}>
              <FiX />
            </button>
            
            <div className={styles.lightboxImageContainer}>
              <Image
                src={getOptimizedImageUrl(currentImage.url, 1200)}
                alt={currentImage.alt || `${productTitle} - rasm ${currentImageIndex + 1}`}
                width={1200}
                height={1200}
                className={styles.lightboxImage}
                quality={95}
              />
            </div>

            {images.length > 1 && (
              <>
                <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={handlePrevImage}>
                  <FiChevronLeft />
                </button>
                <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={handleNextImage}>
                  <FiChevronRight />
                </button>
              </>
            )}

            <div className={styles.lightboxInfo}>
              <h3>{productTitle}</h3>
              <p>{currentImageIndex + 1} / {images.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
