import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import styles from './CategorySelect.module.scss';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  level: number;
  children?: Category[];
  hasChildren?: boolean;
  childrenCount?: number;
}

interface CategorySelectProps {
  selectedCategoryId?: number;
  selectedSubcategoryId?: number;
  onCategoryChange: (categoryId: number) => void;
  onSubcategoryChange: (subcategoryId: number | null) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const CategorySelect: React.FC<CategorySelectProps> = ({
  selectedCategoryId,
  selectedSubcategoryId,
  onCategoryChange,
  onSubcategoryChange,
  placeholder = "Kategoriya tanlang",
  error,
  required = false
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Demo categories data
  const demoCategories: Category[] = [
    { id: 1, name: 'Kiyim-kechak', slug: 'kiyim-kechak', level: 0, hasChildren: true, childrenCount: 2 },
    { id: 4, name: 'O\'yinchoqlar', slug: 'oyinchoqlar', level: 0, hasChildren: true, childrenCount: 2 },
    { id: 7, name: 'Kitoblar', slug: 'kitoblar', level: 0, hasChildren: true, childrenCount: 2 },
    { id: 10, name: 'Sport', slug: 'sport', level: 0, hasChildren: false, childrenCount: 0 },
    { id: 11, name: 'Maktab', slug: 'maktab', level: 0, hasChildren: false, childrenCount: 0 },
    { id: 12, name: 'Chaqaloq', slug: 'chaqaloq', level: 0, hasChildren: false, childrenCount: 0 },
  ];

  const demoSubcategories: { [key: number]: Category[] } = {
    1: [
      { id: 2, name: 'Ichki kiyim', slug: 'ichki-kiyim', parent_id: 1, level: 1 },
      { id: 3, name: 'Tashqi kiyim', slug: 'tashqi-kiyim', parent_id: 1, level: 1 },
    ],
    4: [
      { id: 5, name: 'Konstruktor', slug: 'konstruktor', parent_id: 4, level: 1 },
      { id: 6, name: 'Yumshoq o\'yinchoqlar', slug: 'yumshoq-oyinchoqlar', parent_id: 4, level: 1 },
    ],
    7: [
      { id: 8, name: 'Ta\'lim kitoblari', slug: 'talim-kitoblari', parent_id: 7, level: 1 },
      { id: 9, name: 'Ertaklar', slug: 'ertaklar', parent_id: 7, level: 1 },
    ],
  };

  // Load root categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      loadSubcategories(selectedCategoryId);
    } else {
      setSubcategories([]);
      onSubcategoryChange(null);
    }
  }, [selectedCategoryId]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setCategories(demoCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (categoryId: number) => {
    setLoadingSubcategories(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      const subs = demoSubcategories[categoryId] || [];
      setSubcategories(subs);
    } catch (error) {
      console.error('Error loading subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const handleCategoryChange = (categoryId: number) => {
    onCategoryChange(categoryId);
    // Reset subcategory when category changes
    onSubcategoryChange(null);
  };

  const handleSubcategoryChange = (subcategoryId: number) => {
    onSubcategoryChange(subcategoryId);
  };

  const getSelectedCategoryName = () => {
    const category = categories.find(cat => cat.id === selectedCategoryId);
    return category?.name || '';
  };

  const getSelectedSubcategoryName = () => {
    const subcategory = subcategories.find(sub => sub.id === selectedSubcategoryId);
    return subcategory?.name || '';
  };

  return (
    <div className={styles.categorySelect}>
      {/* Main Category Select */}
      <div className={styles.selectGroup}>
        <label className={styles.label}>
          Asosiy kategoriya {required && <span className={styles.required}>*</span>}
        </label>
        <div className={`${styles.selectWrapper} ${error ? styles.error : ''}`}>
          <select
            value={selectedCategoryId || ''}
            onChange={(e) => handleCategoryChange(Number(e.target.value))}
            className={styles.select}
            disabled={loading}
          >
            <option value="">{loading ? 'Yuklanmoqda...' : placeholder}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.hasChildren && ` (${category.childrenCount} ta ichki kategoriya)`}
              </option>
            ))}
          </select>
          <FiChevronDown className={styles.selectIcon} />
        </div>
      </div>

      {/* Subcategory Select */}
      {selectedCategoryId && (
        <div className={styles.selectGroup}>
          <label className={styles.label}>
            Ichki kategoriya
            <span className={styles.optional}>(ixtiyoriy)</span>
          </label>
          <div className={styles.selectWrapper}>
            <select
              value={selectedSubcategoryId || ''}
              onChange={(e) => handleSubcategoryChange(Number(e.target.value))}
              className={styles.select}
              disabled={loadingSubcategories || subcategories.length === 0}
            >
              <option value="">
                {loadingSubcategories 
                  ? 'Yuklanmoqda...' 
                  : subcategories.length === 0 
                    ? 'Ichki kategoriya yo\'q'
                    : 'Ichki kategoriya tanlang'
                }
              </option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            <FiChevronDown className={styles.selectIcon} />
          </div>
        </div>
      )}

      {/* Selected Path Display */}
      {selectedCategoryId && (
        <div className={styles.selectedPath}>
          <div className={styles.pathLabel}>Tanlangan yo'l:</div>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbItem}>{getSelectedCategoryName()}</span>
            {selectedSubcategoryId && (
              <>
                <FiChevronRight className={styles.breadcrumbSeparator} />
                <span className={styles.breadcrumbItem}>{getSelectedSubcategoryName()}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Helper Text */}
      <div className={styles.helperText}>
        Avval asosiy kategoriyani tanlang, keyin ichki kategoriya paydo bo'ladi
      </div>
    </div>
  );
};

export default CategorySelect;
