import React, { useState } from 'react';
import styles from './ProductImageGallery.module.scss';

interface ProductImageGalleryProps {
  images: string[];
  selectedImage: number;
  onImageSelect: (index: number) => void;
  productTitle: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  selectedImage,
  onImageSelect,
  productTitle
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = () => {
    setIsZoomed(!isZoomed);
  };

  const handleThumbnailClick = (index: number) => {
    onImageSelect(index);
    setIsZoomed(false);
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImageContainer}>
        <div 
          className={`${styles.mainImage} ${isZoomed ? styles.zoomed : ''}`}
          onClick={handleImageClick}
        >
          <img 
            src={images[selectedImage] || '/img/placeholder-product.jpg'} 
            alt={productTitle}
            onError={(e) => {
              e.currentTarget.src = '/img/placeholder-product.jpg';
            }}
          />
          {isZoomed && (
            <div className={styles.zoomOverlay} onClick={() => setIsZoomed(false)}>
              <img 
                src={images[selectedImage] || '/img/placeholder-product.jpg'} 
                alt={productTitle}
              />
            </div>
          )}
        </div>
        
        <div className={styles.imageActions}>
          <button className={styles.zoomButton} onClick={handleImageClick}>
            🔍 {isZoomed ? 'Kichraytirish' : 'Kattalashtirish'}
          </button>
        </div>
      </div>
      
      <div className={styles.thumbnails}>
        {images.map((image, index) => (
          <div 
            key={index}
            className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
            onClick={() => handleThumbnailClick(index)}
          >
            <img 
              src={image || '/img/placeholder-product.jpg'} 
              alt={`${productTitle} ${index + 1}`}
              onError={(e) => {
                e.currentTarget.src = '/img/placeholder-product.jpg';
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;
