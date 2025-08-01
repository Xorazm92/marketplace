import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SearchFilters from '../components/search/SearchFilters';
import SearchResults from '../components/search/SearchResults';
import SearchSorting from '../components/search/SearchSorting';
import EtsyStyleProductCard from '../components/marketplace/EtsyStyleProductCard';
import styles from '../styles/Search.module.scss';

interface SearchFilters {
  category: string[];
  priceRange: [number, number];
  brands: string[];
  ratings: number;
  availability: string;
  ageRange: string[];
}

const SearchPage: React.FC = () => {
  const router = useRouter();
  const { q, category, brand, minPrice, maxPrice, rating, availability, sort } = router.query;
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({
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

  useEffect(() => {
    if (q) {
      setSearchQuery(q as string);
    }
    
    // URL parametrlaridan filtrlarni o'rnatish
    const newFilters: SearchFilters = {
      category: category ? (Array.isArray(category) ? category : [category]) : [],
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
  }, [q, category, brand, minPrice, maxPrice, rating, availability, sort]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateURL({ q: query });
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    updateURL({
      category: newFilters.category,
      brand: newFilters.brands,
      minPrice: newFilters.priceRange[0].toString(),
      maxPrice: newFilters.priceRange[1].toString(),
      rating: newFilters.ratings.toString(),
      availability: newFilters.availability
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
      pathname: '/search',
      query: newQuery
    }, undefined, { shallow: true });
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      category: [],
      priceRange: [0, 1000000],
      brands: [],
      ratings: 0,
      availability: 'all',
      ageRange: []
    };
    setFilters(clearedFilters);
    setSortBy('relevance');
    
    router.push({
      pathname: '/search',
      query: { q: searchQuery }
    }, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>
          {searchQuery ? `"${searchQuery}" uchun qidiruv natijalari` : 'Qidiruv'} - INBOLA
        </title>
        <meta name="description" content={`INBOLA da ${searchQuery} uchun qidiruv natijalari`} />
      </Head>

      <main className={styles.searchPage}>
        <div className={styles.container}>
          <div className={styles.searchHeader}>
            <h1 className={styles.title}>
              {searchQuery ? (
                <>"{searchQuery}" uchun qidiruv natijalari</>
              ) : (
                'Barcha mahsulotlar'
              )}
            </h1>
            
            <div className={styles.searchControls}>
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

          <div className={styles.searchContent}>
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
                searchQuery={searchQuery}
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

export default SearchPage;
