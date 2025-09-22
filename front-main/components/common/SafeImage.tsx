'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src?: string | string[] | null;
  alt: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  fallbackSrc?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
  fill?: boolean;
  quality?: number;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onError?: () => void;
  onLoad?: () => void;
}

// API base URL for backend images
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const SafeImage: FC<SafeImageProps> = ({
  src,
  alt,
  width = 300,
  height = 200,
  objectFit = 'cover',
  fallbackSrc = '/images/placeholder-product.png',
  className = '',
  style,
  loading = 'lazy',
  priority = false,
  fill = false,
  quality = 75,
  sizes,
  placeholder,
  blurDataURL,
  onError,
  onLoad,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Process image source
  const processImageSource = useCallback(() => {
    if (!src) {
      setImgSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    let imageUrl: string;

    // Handle array of images (take first one)
    if (Array.isArray(src)) {
      if (src.length === 0) {
        setImgSrc(fallbackSrc);
        setIsLoading(false);
        return;
      }
      imageUrl = src[0];
    } else {
      imageUrl = src;
    }

    // Handle empty or null strings
    if (!imageUrl || imageUrl.trim() === '') {
      setImgSrc(fallbackSrc);
      setIsLoading(false);
      return;
    }

    // If it's already a full URL, use it directly
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      setImgSrc(imageUrl);
      return;
    }

    // If it's a data URL, use it directly
    if (imageUrl.startsWith('data:')) {
      setImgSrc(imageUrl);
      return;
    }

    // Clean the path and prevent double slashes
    let cleanPath = imageUrl.replace(/^\/+/, '');
    
    // If path already starts with uploads/, use as is
    if (cleanPath.startsWith('uploads/')) {
      const fullUrl = `${API_BASE_URL}/${cleanPath}`;
      setImgSrc(fullUrl);
    } else if (cleanPath.includes('api/') || cleanPath.includes('http')) {
      // Already a full URL or API path, use as is
      setImgSrc(cleanPath.startsWith('http') ? cleanPath : `${API_BASE_URL}/${cleanPath}`);
    } else if (cleanPath.length > 0) {
      // Add uploads prefix for backend images
      const fullUrl = `${API_BASE_URL}/uploads/${cleanPath}`;
      setImgSrc(fullUrl);
    } else {
      // For local static files in public folder
      setImgSrc(fallbackSrc);
    }
  }, [src, fallbackSrc]);

  useEffect(() => {
    processImageSource();
  }, [processImageSource]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    } else {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }
  }, [imgSrc, hasError, fallbackSrc, onError]);

  // Container styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: fill ? '100%' : width,
    height: fill ? '100%' : height,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    ...style
  };

  // Image styles
  const imageStyle: React.CSSProperties = {
    objectFit,
    transition: 'opacity 0.3s ease-in-out',
  };

  if (!imgSrc) {
    return (
      <div style={containerStyle} className={className}>
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#999',
            fontSize: '14px'
          }}
        >
          No Image
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} className={className}>
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#999',
            fontSize: '14px',
            zIndex: 1
          }}
        >
          Loading...
        </div>
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        loading={priority ? undefined : loading}
        unoptimized={hasError}
        {...rest}
      />
    </div>
  );
};

// Product Image Component
interface ProductImageProps extends Omit<SafeImageProps, 'src'> {
  product?: any;
  src?: string | string[] | null;
}

export const ProductImage: FC<ProductImageProps> = ({
  product,
  src,
  alt,
  ...props
}) => {
  const getImageSrc = (): string | string[] | null => {
    if (src) return src;
    
    if (!product) return null;
    
    // Try product_image array first
    if (product.product_image && Array.isArray(product.product_image) && product.product_image.length > 0) {
      const firstImage = product.product_image[0];
      if (firstImage?.url) {
        return firstImage.url;
      }
    }
    
    // Try images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    
    // Try single image field
    if (product.image) {
      return product.image;
    }
    
    return null;
  };

  const imageSrc = getImageSrc();
  const altText = alt || product?.name || product?.title || 'Product Image';

  return (
    <SafeImage
      src={imageSrc}
      alt={altText}
      {...props}
    />
  );
};

export { SafeImage };
export default SafeImage;
