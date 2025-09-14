import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SearchFilters from '../../components/search/SearchFilters';
import SearchResults from '../../components/search/SearchResults';
import SearchSorting from '../../components/search/SearchSorting';
import styles from '../../styles/Category.module.scss';
import { getCategoryBySlug } from '../../endpoints/category';

interface SearchFiltersType {
  category: string[];
  priceRange: [number, number];
  brands: string[];
  ratings: number;
  availability: string;
  ageRange: string[];
}

// Category UI info loaded dynamically from backend by slug

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { slug, brand, minPrice, maxPrice, rating, availability, sort } = router.query;

  const [categoryInfo, setCategoryInfo] = useState<{ name: string; description?: string; icon?: string } | null>(null);
  
  const [filters, setFilters] = useState<SearchFiltersType>({
    category: [],
    priceRange: [0, 1000000],
    brands: [],
    ratings: 0,
    availability: 'all',
    ageRange: []
  });
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Load category meta by slug from backend to avoid hardcoded mismatches
  useEffect(() => {
    const loadCategory = async () => {
      if (!slug) return;
      const data = await getCategoryBySlug(slug as string);
      if (data) {
        setCategoryInfo({
          name: data.name || 'Kategoriya',
          description: data.description || '',
          icon: '📚'
        });
      } else {
        setCategoryInfo(null);
      }
    };
    loadCategory();
  }, [slug]);

  useEffect(() => {
    if (slug) {
      // URL parametrlaridan filtrlarni o'rnatish
      const newFilters: SearchFiltersType = {
        category: [slug as string], // Current category is always selected
        priceRange: [
          minPrice ? parseInt(minPrice as string) : 0,
          maxPrice ? parseInt(maxPrice as string) : 1000000
        ],
        brands: brand ? (Array.isArray(brand) ? brand : [brand]) : [],
        ratings: rating ? parseInt(rating as string) : 0,
        availability: (availability as string) || 'all',
        ageRange: []
      };
      
      setFilters(newFilters);
      setSortBy((sort as string) || 'relevance');
    }
  }, [slug, brand, minPrice, maxPrice, rating, availability, sort]);

  const handleFilterChange = (newFilters: SearchFiltersType) => {
    // Keep current category in filters
    const updatedFilters = {
      ...newFilters,
      category: [slug as string]
    };
    setFilters(updatedFilters);
    updateURL({
      brand: updatedFilters.brands,
      minPrice: updatedFilters.priceRange[0].toString(),
      maxPrice: updatedFilters.priceRange[1].toString(),
      rating: updatedFilters.ratings.toString(),
      availability: updatedFilters.availability
    });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateURL({ sort: newSort });
  };

  const updateURL = (params: Record<string, any>) => {
    const newQuery = { ...router.query, ...params };
    
    // Bo'sh qiymatlarni olib tashlash
    Object.keys(newQuery).forEach(key => {
      if (!newQuery[key] || newQuery[key] === '' || 
          (Array.isArray(newQuery[key]) && newQuery[key].length === 0)) {
        delete newQuery[key];
      }
    });

    router.push({
      pathname: `/category/${slug}`,
      query: newQuery
    }, undefined, { shallow: true });
  };

  const clearFilters = () => {
    const clearedFilters: SearchFiltersType = {
      category: [slug as string], // Keep current category
      priceRange: [0, 1000000],
      brands: [],
      ratings: 0,
      availability: 'all',
      ageRange: []
    };
    setFilters(clearedFilters);
    setSortBy('relevance');
    
    router.push({
      pathname: `/category/${slug}`,
      query: {}
    }, undefined, { shallow: true });
  };

  if (!categoryInfo) {
    return (
      <>
        <div className={styles.notFound}>
          <h1>Kategoriya topilmadi</h1>
          <p>Siz qidirayotgan kategoriya mavjud emas.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{categoryInfo.name} - INBOLA</title>
        <meta name="description" content={categoryInfo.description || ''} />
      </Head>
      
      <main className={styles.categoryPage}>
        <div className={styles.container}>
          <div className={styles.categoryHeader}>
            <div className={styles.categoryInfo}>
              <span className={styles.categoryIcon}>{categoryInfo.icon || '📁'}</span>
              <div>
                <h1 className={styles.title}>{categoryInfo.name}</h1>
                <p className={styles.description}>{categoryInfo.description}</p>
              </div>
            </div>
            
            <div className={styles.categoryControls}>
              <button 
                className={styles.filterToggle}
                onClick={() => setShowFilters(!showFilters)}
              >
                🔍 Filtrlar {showFilters ? '▲' : '▼'}
              </button>
              
              <SearchSorting 
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
            </div>
          </div>

          <div className={styles.categoryContent}>
            {showFilters && (
              <div className={styles.filtersSection}>
                <SearchFilters 
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                />
              </div>
            )}
            
            <div className={styles.resultsSection}>
              <SearchResults 
                searchQuery=""
                filters={filters}
                sortBy={sortBy}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CategoryPage;
