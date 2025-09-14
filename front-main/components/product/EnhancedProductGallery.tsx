import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiX,
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiDownload,
  FiShare2,
  FiHeart
} from 'react-icons/fi';
import { MdFullscreen, MdFullscreenExit, MdTouchApp } from 'react-icons/md';
import { TrustBadge } from '../common/TrustBadges';
import { LazyImage } from '../common/PerformanceOptimizations';
import styles from './EnhancedProductGallery.module.scss';

interface EnhancedProductGalleryProps {
  images: string[];
  productTitle: string;
  productPrice: number;
  isParentApproved?: boolean;
  safetyRating?: number;
  onAddToWishlist?: () => void;
  onShare?: () => void;
}

const EnhancedProductGallery: React.FC<EnhancedProductGalleryProps> = ({
  images,
  productTitle,
  productPrice,
  isParentApproved = true,
  safetyRating = 5,
  onAddToWishlist,
  onShare
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isWishlisted, setIsWishlisted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevImage();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        case 'Escape':
          closeModal();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedImage]);

  // Handle fullscreen API
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handlePrevImage = useCallback(() => {
    setSelectedImage(prev => prev === 0 ? images.length - 1 : prev - 1);
    resetImageTransform();
  }, [images.length]);

  const handleNextImage = useCallback(() => {
    setSelectedImage(prev => prev === images.length - 1 ? 0 : prev + 1);
    resetImageTransform();
  }, [images.length]);

  const resetImageTransform = () => {
    setZoomLevel(1);
    setRotation(0);
    setImagePosition({ x: 0, y: 0 });
  };

  const openModal = (index?: number) => {
    if (index !== undefined) setSelectedImage(index);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetImageTransform();
    document.body.style.overflow = 'unset';
    if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = async () => {
    if (!modalRef.current) return;
    
    try {
      if (!isFullscreen) {
        await modalRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[selectedImage];
    link.download = `${productTitle}-${selectedImage + 1}.jpg`;
    link.click();
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.();
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return;
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Swipe detection
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        handlePrevImage();
      } else {
        handleNextImage();
      }
    }
  };

  const currentImage = images[selectedImage] || '/img/placeholder-product.jpg';

  return (
    <div className={styles.galleryContainer} ref={galleryRef}>
      {/* Main Gallery */}
      <div className={styles.mainGallery}>
        <div className={styles.imageContainer}>
          <LazyImage
            src={currentImage}
            alt={`${productTitle} - Image ${selectedImage + 1}`}
            className={styles.mainImage}
            priority={true}
            onClick={() => openModal(selectedImage)}
          />
          
          {/* Trust Badges Overlay */}
          <div className={styles.badgesOverlay}>
            {isParentApproved && (
              <TrustBadge type=\"parent-approved\" size=\"sm\" variant=\"compact\" />
            )}
            <TrustBadge type=\"kids-safe\" size=\"sm\" variant=\"compact\" />
          </div>
          
          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.actionBtn} ${isWishlisted ? styles.wishlisted : ''}`}
              onClick={handleWishlist}
              aria-label=\"Add to wishlist\"
            >
              <FiHeart />
            </button>
            <button 
              className={styles.actionBtn}
              onClick={onShare}
              aria-label=\"Share product\"
            >
              <FiShare2 />
            </button>
            <button 
              className={styles.actionBtn}
              onClick={() => openModal(selectedImage)}
              aria-label=\"View full size\"
            >
              <FiMaximize2 />
            </button>
          </div>
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button 
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={handlePrevImage}
                aria-label=\"Previous image\"
              >
                <FiChevronLeft />
              </button>
              <button 
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={handleNextImage}
                aria-label=\"Next image\"
              >
                <FiChevronRight />
              </button>
            </>
          )}
          
          {/* Image Counter */}
          <div className={styles.imageCounter}>
            {selectedImage + 1} / {images.length}
          </div>
          
          {/* Zoom Hint */}
          <div className={styles.zoomHint}>
            <MdTouchApp />
            <span>Click to zoom</span>
          </div>
        </div>
      </div>
      
      {/* Thumbnail Gallery */}
      <div className={styles.thumbnailGallery}>
        <div className={styles.thumbnailContainer}>
          {images.map((image, index) => (
            <button
              key={index}
              className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
              onClick={() => setSelectedImage(index)}
              aria-label={`View image ${index + 1}`}
            >
              <LazyImage
                src={image}
                alt={`${productTitle} thumbnail ${index + 1}`}
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      </div>
      
      {/* Modal Gallery */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div 
            className={`${styles.modalContent} ${isFullscreen ? styles.fullscreen : ''}`}
            ref={modalRef}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <h3>{productTitle}</h3>
                <span className={styles.price}>
                  {productPrice.toLocaleString()} so'm
                </span>
              </div>
              
              <div className={styles.modalControls}>
                <button onClick={handleZoomOut} aria-label=\"Zoom out\">
                  <FiZoomOut />
                </button>
                <span className={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>
                <button onClick={handleZoomIn} aria-label=\"Zoom in\">
                  <FiZoomIn />
                </button>
                <button onClick={handleRotate} aria-label=\"Rotate\">
                  <FiRotateCw />
                </button>
                <button onClick={handleFullscreen} aria-label=\"Toggle fullscreen\">
                  {isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
                </button>
                <button onClick={handleDownload} aria-label=\"Download image\">
                  <FiDownload />
                </button>
                <button onClick={closeModal} aria-label=\"Close modal\">
                  <FiX />
                </button>
              </div>
            </div>
            
            {/* Modal Image */}
            <div className={styles.modalImageContainer}>
              <img
                ref={imageRef}
                src={currentImage}
                alt={`${productTitle} - Image ${selectedImage + 1}`}
                className={styles.modalImage}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={zoomLevel === 1 ? handleZoomIn : undefined}
                draggable={false}
              />
              
              {/* Modal Navigation */}
              {images.length > 1 && (
                <>
                  <button 
                    className={`${styles.modalNavButton} ${styles.modalPrevButton}`}
                    onClick={handlePrevImage}
                    aria-label=\"Previous image\"
                  >
                    <FiChevronLeft />
                  </button>
                  <button 
                    className={`${styles.modalNavButton} ${styles.modalNextButton}`}
                    onClick={handleNextImage}
                    aria-label=\"Next image\"
                  >
                    <FiChevronRight />
                  </button>
                </>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <div className={styles.modalThumbnails}>
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`${styles.modalThumbnail} ${selectedImage === index ? styles.active : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
              
              <div className={styles.modalActions}>
                <span className={styles.imageInfo}>
                  Image {selectedImage + 1} of {images.length}
                </span>
                <div className={styles.safetyRating}>
                  Safety: {'★'.repeat(safetyRating)}{'☆'.repeat(5 - safetyRating)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedProductGallery;