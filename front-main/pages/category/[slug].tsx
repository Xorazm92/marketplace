import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SearchFilters from '../../components/search/SearchFilters';
import SearchResults from '../../components/search/SearchResults';
import SearchSorting from '../../components/search/SearchSorting';
import styles from '../../styles/Category.module.scss';

interface SearchFiltersType {
  category: string[];
  priceRange: [number, number];
  brands: string[];
  ratings: number;
  availability: string;
  ageRange: string[];
}

const categoryData: Record<string, { name: string; description: string; icon: string }> = {
  'clothing': {
    name: 'Kiyim-kechak',
    description: 'Bolalar uchun zamonaviy va qulay kiyim-kechaklar',
    icon: '👕'
  },
  'toys': {
    name: "O'yinchoqlar",
    description: 'Bolalarning rivojlanishi uchun foydali o\'yinchoqlar',
    icon: '🧸'
  },
  'books': {
    name: 'Kitoblar',
    description: 'Ta\'lim va o\'yin uchun bolalar kitoblari',
    icon: '📚'
  },
  'sports': {
    name: 'Sport anjomlar',
    description: 'Bolalar uchun sport va faollik anjomlar',
    icon: '⚽'
  },
  'school': {
    name: 'Maktab buyumlari',
    description: 'Maktab va ta\'lim uchun zarur buyumlar',
    icon: '🎒'
  },
  'baby': {
    name: 'Chaqaloq buyumlari',
    description: 'Chaqaloqlar uchun zarur mahsulotlar',
    icon: '🍼'
  },
  'electronics': {
    name: 'Elektronika',
    description: 'Bolalar uchun xavfsiz elektronika',
    icon: '📱'
  },
  'health': {
    name: "Sog'liq",
    description: 'Bolalar sog\'lig\'i uchun mahsulotlar',
    icon: '🏥'
  }
};

const CategoryPage: React.FC = () => {
  const router = useRouter();
  const { slug, brand, minPrice, maxPrice, rating, availability, sort } = router.query;
  
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

  const category = categoryData[slug as string];

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

  if (!category) {
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
        <title>{category.name} - INBOLA</title>
        <meta name="description" content={category.description} />
      </Head>
      
      <main className={styles.categoryPage}>
        <div className={styles.container}>
          <div className={styles.categoryHeader}>
            <div className={styles.categoryInfo}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              <div>
                <h1 className={styles.title}>{category.name}</h1>
                <p className={styles.description}>{category.description}</p>
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
