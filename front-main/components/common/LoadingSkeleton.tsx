'use client';

import React from 'react';
import styles from './LoadingSkeleton.module.scss';

interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number; // For text variant
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
  lines = 1,
}) => {
  const getSkeletonStyle = () => {
    const baseStyle: React.CSSProperties = {
      width,
      height,
      borderRadius: variant === 'circular' ? '50%' : borderRadius,
    };

    if (variant === 'text') {
      baseStyle.height = '1em';
      baseStyle.marginBottom = '0.5em';
    }

    return baseStyle;
  };

  const skeletonClass = `${styles.skeleton} ${styles[variant]} ${styles[animation]} ${className}`;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={styles.textContainer}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={skeletonClass}
            style={{
              ...getSkeletonStyle(),
              width: index === lines - 1 ? '60%' : '100%', // Last line shorter
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={skeletonClass} style={getSkeletonStyle()} />;
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <div className={styles.productCardSkeleton}>
    <LoadingSkeleton height="200px" borderRadius="8px" />
    <div className={styles.productInfo}>
      <LoadingSkeleton variant="text" lines={2} />
      <LoadingSkeleton width="60%" height="16px" />
      <LoadingSkeleton width="40%" height="20px" />
    </div>
  </div>
);

// Product Grid Skeleton
interface ProductGridSkeletonProps {
  count?: number;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({ count = 8 }) => (
  <div className={styles.productGrid}>
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Category List Skeleton
export const CategoryListSkeleton: React.FC = () => (
  <div className={styles.categoryList}>
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className={styles.categoryItem}>
        <LoadingSkeleton variant="circular" width="40px" height="40px" />
        <LoadingSkeleton variant="text" width="80px" />
      </div>
    ))}
  </div>
);

// Table Skeleton
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => (
  <div className={styles.tableSkeleton}>
    {/* Header */}
    <div className={styles.tableRow}>
      {Array.from({ length: columns }).map((_, index) => (
        <LoadingSkeleton key={index} height="20px" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className={styles.tableRow}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <LoadingSkeleton key={colIndex} height="16px" />
        ))}
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
