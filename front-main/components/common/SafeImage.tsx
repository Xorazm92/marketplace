import { FC, useState, useEffect } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src?: string | string[] | null;
  alt: string;
  width?: number | string;
  height?: number | string;
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
}

// API base URL for backend images
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const SafeImage: FC<SafeImageProps> = ({
  src,
  alt,
  width = '100%',
  height = '200px',
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
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const processImageSource = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🖼️ Processing image source:', src);
      }
      
      // ✅ Handle undefined, null, empty string, or empty array
      if (!src || src === 'undefined' || 
          (Array.isArray(src) && src.length === 0) ||
          (typeof src === 'string' && src.trim() === '')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ No valid src provided, using fallback:', fallbackSrc);
        }
        setImgSrc(fallbackSrc);
        setIsLoading(false);
        return;
      }

      let imageUrl: string;

      // Handle array of images
      if (Array.isArray(src)) {
        imageUrl = src.length > 0 ? src[0] : fallbackSrc;
        if (process.env.NODE_ENV === 'development') {
          console.log('📋 Array source, using first:', imageUrl);
        }
      } else {
        imageUrl = src;
        if (process.env.NODE_ENV === 'development') {
          console.log('🔗 Single source:', imageUrl);
        }
      }

      // If it's already an absolute URL or data URL, use it directly
      if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Full URL detected, using as-is:', imageUrl);
        }
        setImgSrc(imageUrl);
        return;
      }

      // Handle relative paths from backend
      let cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
      
      // Remove duplicate /uploads/ if it exists
      if (cleanPath.startsWith('uploads//uploads/')) {
        cleanPath = cleanPath.replace('uploads//uploads/', 'uploads/');
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 Fixed duplicate uploads path:', cleanPath);
        }
      }
      
      // For uploaded files, always use backend URL
      if (cleanPath.startsWith('uploads/') || cleanPath.includes('products/')) {
        // Ensure proper slash between base URL and path
        const fullUrl = `${API_BASE_URL}/${cleanPath}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Converting to backend URL:', fullUrl);
        }
        setImgSrc(fullUrl);
      } else {
        // For local static files in public folder
        const localUrl = `/${cleanPath}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('📁 Using local static URL:', localUrl);
        }
        setImgSrc(localUrl);
      }
    };

    processImageSource();
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Image loaded successfully:', imgSrc);
    }
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Image failed to load:', imgSrc);
    }
    setIsLoading(false);
    if (!hasError) {
      setHasError(true);
      // Use a simple data URL as ultimate fallback
      const dataUrlFallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxODBIMTc1VjEyMFoiIGZpbGw9IiNEREREREQiLz4KPHN2ZyB4PSIxODAiIHk9IjE0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjIwIj4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCA0MCAyMCIgZmlsbD0ibm9uZSI+CjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjMiIGZpbGw9IiNEREREREQiLz4KPC9zdmc+Cjwvc3ZnPgo8dGV4dCB4PSIyMDAiIHk9IjIxMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SYXNtIHlvJ3E8L3RleHQ+Cjwvc3ZnPg==';
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Switching to data URL fallback');
      }
      setImgSrc(dataUrlFallback);
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width,
    height,
    overflow: 'hidden',
    ...style
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    opacity: isLoading ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
    ...(isLoading && { backgroundColor: '#f5f5f5' })
  };

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
            fontSize: '14px'
          }}
        >
          Loading...
        </div>
      )}
      
      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        width={!fill ? (typeof width === 'string' ? parseInt(width) : width) : undefined}
        height={!fill ? (typeof height === 'string' ? parseInt(height) : height) : undefined}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        unoptimized={hasError} // Disable optimization for fallback images
        {...rest}
      />
    </div>
  );
};

interface ProductImageProps extends Omit<SafeImageProps, 'src'> {
  product?: any;
  src?: string | string[] | null;
}

// A specialized version of SafeImage specifically for product images
export const ProductImage: React.FC<ProductImageProps> = ({
  product,
  src,
  style,
  className = '',
  ...props
}) => {
  // ✅ Extract image source from product or use provided src
  const getImageSrc = (): string | string[] | null => {
    if (src) return src;
    
    if (!product) return null;
    
    // Try product_image array first
    if (product.product_image && Array.isArray(product.product_image) && product.product_image.length > 0) {
      const firstImage = product.product_image[0];
      if (firstImage?.url) {
        // Ensure proper URL format
        const imageUrl = firstImage.url;
        if (imageUrl.startsWith('http')) {
          return imageUrl;
        }
        // Add leading slash if missing and construct full URL
        const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
        return `http://localhost:4000${cleanUrl}`;
      }
    }
    
    // Try images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const imageUrl = product.images[0];
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      // Add leading slash if missing and construct full URL
      const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      return `http://localhost:4000${cleanUrl}`;
    }
    
    return null;
  };

  const imageSrc = getImageSrc();

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '200px', 
        position: 'relative',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        ...style
      }}
      className={`product-image-container ${className}`}
    >
      <SafeImage
        src={imageSrc}
        width="100%"
        height="100%"
        objectFit="cover"
        fallbackSrc="/images/placeholder-product.png"
        {...props}
        style={{
          width: '100%',
          height: '100%',
          ...(props as React.ImgHTMLAttributes<HTMLImageElement>).style,
        }}
      />
    </div>
  );
};

export { SafeImage };
export default SafeImage;
