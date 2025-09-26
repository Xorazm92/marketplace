import React, { useState, useMemo, useCallback } from 'react';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, TagIcon } from '@heroicons/react/24/outline';
import styles from './CategoryTree.module.scss';

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  children_count?: number;
  product_count?: number;
  children?: CategoryNode[];
}

interface CategoryTreeProps {
  categories: CategoryNode[];
  onCategorySelect?: (category: CategoryNode) => void;
  selectedCategoryId?: string;
  showProductCount?: boolean;
  searchQuery?: string;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories = [],
  onCategorySelect,
  selectedCategoryId,
  showProductCount = true,
  searchQuery = ''
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Build tree structure
  const categoryTree = useMemo(() => {
    const categoryMap = new Map<string, CategoryNode>();
    const rootCategories: CategoryNode[] = [];

    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach(category => {
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

    return rootCategories.sort((a, b) => a.sort_order - b.sort_order);
  }, [categories]);

  const handleToggleExpand = useCallback((categoryId: string) => {
    const newExpandedIds = new Set(expandedIds);
    if (newExpandedIds.has(categoryId)) {
      newExpandedIds.delete(categoryId);
    } else {
      newExpandedIds.add(categoryId);
    }
    setExpandedIds(newExpandedIds);
  }, [expandedIds]);

  const renderTreeNode = (category: CategoryNode, level = 0): React.ReactNode => {
    const hasChildren = (category.children?.length || 0) > 0;
    const isExpanded = expandedIds.has(category.id);
    const isSelected = selectedCategoryId === category.id;

    return (
      <div key={category.id} className={styles.treeNode}>
        <div
          className={`${styles.nodeContent} ${isSelected ? styles.selected : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onCategorySelect?.(category)}
        >
          {hasChildren && (
            <button
              className={styles.expandButton}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand(category.id);
              }}
            >
              {isExpanded ? (
                <ChevronDownIcon className={styles.expandIcon} />
              ) : (
                <ChevronRightIcon className={styles.expandIcon} />
              )}
            </button>
          )}
          
          {!hasChildren && <div className={styles.expandSpacer} />}
          
          {category.icon ? (
            <i className={`${category.icon} ${styles.categoryIcon}`} style={{ color: category.color }} />
          ) : (
            <FolderIcon className={styles.categoryIcon} />
          )}
          
          <span className={styles.categoryName}>{category.name}</span>
          
          {showProductCount && category.product_count !== undefined && (
            <span className={styles.productCount}>({category.product_count})</span>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className={styles.children}>
            {category.children?.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.categoryTree}>
      {categoryTree.map(category => renderTreeNode(category))}
    </div>
  );
};

export default CategoryTree;
