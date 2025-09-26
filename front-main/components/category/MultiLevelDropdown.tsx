import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CategoryNode } from './CategoryTree';
import styles from './MultiLevelDropdown.module.scss';

interface MultiLevelDropdownProps {
  categories: CategoryNode[];
  trigger?: React.ReactNode;
  triggerText?: string;
  onCategorySelect?: (category: CategoryNode) => void;
  maxDepth?: number;
  showProductCount?: boolean;
  className?: string;
}

const MultiLevelDropdown: React.FC<MultiLevelDropdownProps> = ({
  categories = [],
  trigger,
  triggerText = 'Kategoriyalar',
  onCategorySelect,
  maxDepth = 3,
  showProductCount = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHoveredPath([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = (categoryId: string, level: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const newPath = hoveredPath.slice(0, level);
    newPath[level] = categoryId;
    setHoveredPath(newPath);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredPath([]);
    }, 150);
  };

  const handleCategoryClick = (category: CategoryNode) => {
    onCategorySelect?.(category);
    setIsOpen(false);
    setHoveredPath([]);
  };

  const buildCategoryTree = (cats: CategoryNode[]): CategoryNode[] => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    // Build map
    cats.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build hierarchy
    cats.forEach(category => {
      const categoryNode = categoryMap.get(category.id);
      if (!categoryNode) return;

      if (category.parent_id) {
        const parent = categoryMap.get(category.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryNode);
        }
      } else {
        rootCategories.push(categoryNode);
      }
    });

    // Sort by sort_order
    const sortCategories = (cats: CategoryNode[]): CategoryNode[] => {
      return cats
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(cat => ({
          ...cat,
          children: cat.children ? sortCategories(cat.children) : []
        }));
    };

    return sortCategories(rootCategories);
  };

  const getVisibleCategories = (cats: CategoryNode[], level: number): CategoryNode[] => {
    if (level === 0) return cats;
    
    const parentId = hoveredPath[level - 1];
    if (!parentId) return [];

    const findCategory = (categories: CategoryNode[]): CategoryNode | null => {
      for (const cat of categories) {
        if (cat.id === parentId) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };

    const parentCategory = findCategory(cats);
    return parentCategory?.children || [];
  };

  const renderCategoryLevel = (cats: CategoryNode[], level: number) => {
    const visibleCategories = getVisibleCategories(cats, level);
    
    if (visibleCategories.length === 0 || level >= maxDepth) return null;

    return (
      <div 
        className={`${styles.dropdownLevel} ${styles[`level${level}`]}`}
        style={{ left: `${level * 280}px` }}
      >
        <div className={styles.categoryList}>
          {visibleCategories.map(category => {
            const hasChildren = (category.children?.length || 0) > 0;
            const isHovered = hoveredPath[level] === category.id;

            return (
              <div
                key={category.id}
                className={`${styles.categoryItem} ${isHovered ? styles.hovered : ''}`}
                onMouseEnter={() => handleMouseEnter(category.id, level)}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className={styles.categoryLink}
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className={styles.categoryContent}>
                    {category.icon && (
                      <i 
                        className={`${category.icon} ${styles.categoryIcon}`}
                        style={{ color: category.color || '#6B7280' }}
                      />
                    )}
                    
                    <span className={styles.categoryName}>{category.name}</span>
                    
                    {showProductCount && category.product_count !== undefined && (
                      <span className={styles.productCount}>
                        ({category.product_count})
                      </span>
                    )}
                    
                    {hasChildren && (
                      <ChevronRightIcon className={styles.chevronIcon} />
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const categoryTree = buildCategoryTree(categories);

  return (
    <div className={`${styles.multiLevelDropdown} ${className}`} ref={dropdownRef}>
      <button
        className={`${styles.trigger} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        {trigger || (
          <>
            <span>{triggerText}</span>
            <ChevronDownIcon className={styles.triggerIcon} />
          </>
        )}
      </button>

      {isOpen && (
        <div 
          className={styles.dropdownContainer}
          onMouseLeave={() => {
            timeoutRef.current = setTimeout(() => {
              setIsOpen(false);
              setHoveredPath([]);
            }, 300);
          }}
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
        >
          {renderCategoryLevel(categoryTree, 0)}
          {renderCategoryLevel(categoryTree, 1)}
          {renderCategoryLevel(categoryTree, 2)}
        </div>
      )}
    </div>
  );
};

export default MultiLevelDropdown;
