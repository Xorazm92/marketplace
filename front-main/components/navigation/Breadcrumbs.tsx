import React from 'react';
import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import styles from './Breadcrumbs.module.scss';

export interface BreadcrumbItem {
  id?: string;
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  homeText?: string;
  separator?: React.ReactNode;
  className?: string;
  maxItems?: number;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  homeText = 'Bosh sahifa',
  separator,
  className = '',
  maxItems = 5
}) => {
  // Add home item if needed
  const allItems: BreadcrumbItem[] = showHome 
    ? [{ name: homeText, href: '/' }, ...items]
    : items;

  // Truncate items if too many
  const displayItems = allItems.length > maxItems 
    ? [
        allItems[0],
        { name: '...', href: '#', id: 'ellipsis' },
        ...allItems.slice(-maxItems + 2)
      ]
    : allItems;

  const defaultSeparator = <ChevronRightIcon className={styles.separator} />;

  return (
    <nav className={`${styles.breadcrumbs} ${className}`} aria-label="Breadcrumb">
      <ol className={styles.breadcrumbList}>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.id === 'ellipsis';

          return (
            <li key={item.id || index} className={styles.breadcrumbItem}>
              {index > 0 && (
                <span className={styles.separatorWrapper}>
                  {separator || defaultSeparator}
                </span>
              )}
              
              {isEllipsis ? (
                <span className={styles.ellipsis}>{item.name}</span>
              ) : isLast || item.current ? (
                <span 
                  className={styles.currentItem}
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className={styles.breadcrumbLink}
                >
                  {index === 0 && showHome ? (
                    <span className={styles.homeItem}>
                      <HomeIcon className={styles.homeIcon} />
                      <span className={styles.homeText}>{item.name}</span>
                    </span>
                  ) : (
                    item.name
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
