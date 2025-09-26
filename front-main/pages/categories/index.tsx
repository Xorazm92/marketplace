import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import CategoryTree, { CategoryNode } from '../../components/category/CategoryTree';
import categoryService from '../../services/categoryService';
import styles from './Categories.module.scss';

const CategoriesPage: NextPage = () => {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoryTree = await categoryService.getCategoryTree();
      setCategories(categoryTree);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: CategoryNode) => {
    setSelectedCategory(category);
    console.log('Selected category:', category);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Kategoriyalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Xatolik yuz berdi</h2>
          <p>{error}</p>
          <button onClick={loadCategories} className={styles.retryButton}>
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Kategoriyalar - INBOLA Marketplace</title>
        <meta name="description" content="Barcha mahsulot kategoriyalari" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Kategoriyalar</h1>
            <p>Barcha mahsulot kategoriyalari ierarxik tarzda</p>
          </div>
          
          <button className={styles.addButton}>
            <PlusIcon className={styles.addIcon} />
            Yangi kategoriya
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.sidebar}>
            <div className={styles.searchSection}>
              <div className={styles.searchBox}>
                <MagnifyingGlassIcon className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Kategoriyalarni qidirish..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className={styles.searchInput}
                />
              </div>
            </div>

            <div className={styles.treeSection}>
              <CategoryTree
                categories={categories}
                onCategorySelect={handleCategorySelect}
                selectedCategoryId={selectedCategory?.id}
                showProductCount={true}
                searchQuery={searchQuery}
              />
            </div>
          </div>

          <div className={styles.mainContent}>
            {selectedCategory ? (
              <div className={styles.categoryDetails}>
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryInfo}>
                    {selectedCategory.icon && (
                      <i 
                        className={`${selectedCategory.icon} ${styles.categoryIcon}`}
                        style={{ color: selectedCategory.color || '#6B7280' }}
                      />
                    )}
                    <div>
                      <h2>{selectedCategory.name}</h2>
                      <p className={styles.categorySlug}>/{selectedCategory.slug}</p>
                    </div>
                  </div>
                  
                  <div className={styles.categoryStats}>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {selectedCategory.product_count || 0}
                      </span>
                      <span className={styles.statLabel}>Mahsulotlar</span>
                    </div>
                    <div className={styles.stat}>
                      <span className={styles.statValue}>
                        {selectedCategory.children_count || 0}
                      </span>
                      <span className={styles.statLabel}>Subkategoriyalar</span>
                    </div>
                  </div>
                </div>

                {selectedCategory.description && (
                  <div className={styles.categoryDescription}>
                    <h3>Tavsif</h3>
                    <p>{selectedCategory.description}</p>
                  </div>
                )}

                <div className={styles.categoryActions}>
                  <button className={styles.editButton}>
                    Tahrirlash
                  </button>
                  <button className={styles.viewProductsButton}>
                    Mahsulotlarni ko'rish
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📁</div>
                <h3>Kategoriya tanlanmagan</h3>
                <p>Tafsilotlarni ko'rish uchun chap tarafdan kategoriya tanlang</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoriesPage;
