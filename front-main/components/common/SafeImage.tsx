import { FC, useState, useEffect } from 'react';
import Image from 'next/image';

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
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
      
      if (!src) {
        if (process.env.NODE_ENV === 'development') {
          console.log('❌ No src provided, using fallback:', fallbackSrc);
        }
        setImgSrc(fallbackSrc);
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
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <div style={{ color: '#999', fontSize: '14px' }}>Loading...</div>
        </div>
      )}
      
      <Image
        src={imgSrc || fallbackSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={imageStyle}
        {...rest}
      />
    </div>
  );
};

// A specialized version of SafeImage specifically for product images
export const ProductImage: React.FC<SafeImageProps> = ({
  style,
  className = '',
  ...props
}) => {
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

export default SafeImage;
