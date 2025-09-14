import React, { useState, useRef, useEffect } from 'react';
import { 
  MdSearch, 
  MdFilterList, 
  MdClose, 
  MdKeyboardArrowDown,
  MdStar,
  MdTune,
  MdClear,
  MdHistory,
  MdTrendingUp
} from 'react-icons/md';
import styles from './AdvancedSearchSystem.module.scss';

export interface SearchFilters {
  category: string[];
  priceRange: {
    min: number;
    max: number;
  };
  ageRange: {
    min: number;
    max: number;
  };
  rating: number;
  brand: string[];
  seller: string[];
  badges: string[];
  inStock: boolean;
  freeShipping: boolean;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'seller';
  count?: number;
  trending?: boolean;
}

export interface PopularSearch {
  id: string;
  text: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

interface AdvancedSearchSystemProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  isLoading?: boolean;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  popularSearches?: PopularSearch[];
  recentSearches?: string[];
  categories?: Array<{ id: string; name: string; count: number }>;
  brands?: Array<{ id: string; name: string; count: number }>;
  sellers?: Array<{ id: string; name: string; rating: number; verified: boolean }>;
  maxPrice?: number;
  className?: string;
}

const DEFAULT_FILTERS: SearchFilters = {
  category: [],
  priceRange: { min: 0, max: 10000000 },
  ageRange: { min: 0, max: 18 },
  rating: 0,
  brand: [],
  seller: [],
  badges: [],
  inStock: false,
  freeShipping: false,
  sortBy: 'relevance'
};

const AdvancedSearchSystem: React.FC<AdvancedSearchSystemProps> = ({
  onSearch,
  onSuggestionSelect,
  isLoading = false,
  placeholder = "Mahsulot, kategoriya yoki brend qidiring...",
  suggestions = [],
  popularSearches = [],
  recentSearches = [],
  categories = [],
  brands = [],
  sellers = [],
  maxPrice = 10000000,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSuggestionIndex(-1);
      }
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update active filters list
  useEffect(() => {
    const active: string[] = [];
    
    if (filters.category.length > 0) active.push(`${filters.category.length} kategoriya`);
    if (filters.priceRange.min > 0 || filters.priceRange.max < maxPrice) {
      active.push('Narx oralig\'i');
    }
    if (filters.ageRange.min > 0 || filters.ageRange.max < 18) {
      active.push('Yosh oralig\'i');
    }
    if (filters.rating > 0) active.push(`${filters.rating}+ yulduz`);
    if (filters.brand.length > 0) active.push(`${filters.brand.length} brend`);
    if (filters.seller.length > 0) active.push(`${filters.seller.length} sotuvchi`);
    if (filters.badges.length > 0) active.push(`${filters.badges.length} belgila`);
    if (filters.inStock) active.push('Mavjud');
    if (filters.freeShipping) active.push('Bepul yetkazib berish');
    
    setActiveFilters(active);
  }, [filters, maxPrice]);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim() || activeFilters.length > 0) {
      onSearch(finalQuery.trim(), filters);
      setShowSuggestions(false);
      setSuggestionIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0 || popularSearches.length > 0);
    setSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    const allSuggestions = [
      ...suggestions,
      ...popularSearches.map(p => ({ id: p.id, text: p.text, type: 'product' as const }))
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSuggestionIndex(prev => Math.min(prev + 1, allSuggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSuggestionIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestionIndex >= 0 && allSuggestions[suggestionIndex]) {
          handleSuggestionClick(allSuggestions[suggestionIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
    setSuggestionIndex(-1);
    handleSearch(suggestion.text);
  };

  const handleFilterChange = (filterType: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  const toggleFilter = (filterType: string, value: string) => {
    if (filterType === 'category') {
      const current = filters.category;
      const updated = current.includes(value)
        ? current.filter(c => c !== value)
        : [...current, value];
      handleFilterChange('category', updated);
    } else if (filterType === 'brand') {
      const current = filters.brand;
      const updated = current.includes(value)
        ? current.filter(b => b !== value)
        : [...current, value];
      handleFilterChange('brand', updated);
    } else if (filterType === 'seller') {
      const current = filters.seller;
      const updated = current.includes(value)
        ? current.filter(s => s !== value)
        : [...current, value];
      handleFilterChange('seller', updated);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'category': return '📂';
      case 'brand': return '🏷️';
      case 'seller': return '👤';
      default: return '🔍';
    }
  };

  return (
    <div className={`${styles.searchSystem} ${className}`}>
      {/* Main Search Bar */}
      <div className={styles.searchContainer} ref={searchRef}>
        <div className={styles.searchInputWrapper}>
          <MdSearch className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className={styles.searchInput}
            aria-label="Search products"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={clearSearch}
              className={styles.clearButton}
              aria-label="Clear search"
            >
              <MdClose />
            </button>
          )}
          <button
            onClick={handleSearch}
            className={styles.searchButton}
            disabled={isLoading}
            aria-label="Search"
          >
            {isLoading ? '⏳' : 'Qidirish'}
          </button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (
          <div className={styles.suggestionsContainer}>
            {/* Current query suggestion */}
            {query.trim() && (
              <div className={styles.suggestionSection}>
                <button
                  className={`${styles.suggestion} ${suggestionIndex === -1 ? styles.suggestionActive : ''}`}
                  onClick={() => handleSearch()}
                >
                  <MdSearch className={styles.suggestionIcon} />
                  <span>"{query}" ni qidirish</span>
                </button>
              </div>
            )}

            {/* Auto-suggestions */}
            {suggestions.length > 0 && (
              <div className={styles.suggestionSection}>
                <div className={styles.sectionTitle}>Takliflar</div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    className={`${styles.suggestion} ${suggestionIndex === index ? styles.suggestionActive : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className={styles.suggestionIcon}>
                      {getSuggestionIcon(suggestion.type)}
                    </span>
                    <span className={styles.suggestionText}>{suggestion.text}</span>
                    {suggestion.trending && (
                      <MdTrendingUp className={styles.trendingIcon} />
                    )}
                    {suggestion.count && (
                      <span className={styles.suggestionCount}>({suggestion.count})</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Popular searches */}
            {popularSearches.length > 0 && !query && (
              <div className={styles.suggestionSection}>
                <div className={styles.sectionTitle}>Mashhur qidiruvlar</div>
                {popularSearches.slice(0, 5).map((search) => (
                  <button
                    key={search.id}
                    className={styles.suggestion}
                    onClick={() => handleSuggestionClick({ 
                      id: search.id, 
                      text: search.text, 
                      type: 'product' 
                    })}
                  >
                    <MdTrendingUp className={styles.suggestionIcon} />
                    <span className={styles.suggestionText}>{search.text}</span>
                    <span className={styles.trendIcon}>
                      {search.trend === 'up' ? '📈' : search.trend === 'down' ? '📉' : '➡️'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Recent searches */}
            {recentSearches.length > 0 && !query && (
              <div className={styles.suggestionSection}>
                <div className={styles.sectionTitle}>Oxirgi qidiruvlar</div>
                {recentSearches.slice(0, 3).map((search, index) => (
                  <button
                    key={index}
                    className={styles.suggestion}
                    onClick={() => handleSuggestionClick({ 
                      id: `recent-${index}`, 
                      text: search, 
                      type: 'product' 
                    })}
                  >
                    <MdHistory className={styles.suggestionIcon} />
                    <span className={styles.suggestionText}>{search}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className={styles.filterControls}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`${styles.filterToggle} ${activeFilters.length > 0 ? styles.filterToggleActive : ''}`}
        >
          <MdTune />
          <span>Filtrlar</span>
          {activeFilters.length > 0 && (
            <span className={styles.filterCount}>{activeFilters.length}</span>
          )}
          <MdKeyboardArrowDown 
            className={`${styles.toggleIcon} ${showFilters ? styles.toggleIconOpen : ''}`} 
          />
        </button>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className={styles.activeFilters}>
            {activeFilters.map((filter, index) => (
              <span key={index} className={styles.activeFilter}>
                {filter}
              </span>
            ))}
            <button onClick={clearFilters} className={styles.clearFiltersBtn}>
              <MdClear />
              Tozalash
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel} ref={filtersRef}>
          <div className={styles.filtersPanelContent}>
            {/* Categories */}
            {categories.length > 0 && (
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Kategoriyalar</h4>
                <div className={styles.filterOptions}>
                  {categories.map((category) => (
                    <label key={category.id} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category.id)}
                        onChange={() => toggleFilter('category', category.id)}
                      />
                      <span className={styles.filterOptionText}>
                        {category.name}
                        <span className={styles.filterOptionCount}>({category.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupTitle}>Narx oralig'i</h4>
              <div className={styles.priceRange}>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    min: Number(e.target.value) || 0
                  })}
                  className={styles.priceInput}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max === maxPrice ? '' : filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', {
                    ...filters.priceRange,
                    max: Number(e.target.value) || maxPrice
                  })}
                  className={styles.priceInput}
                />
                <span>so'm</span>
              </div>
            </div>

            {/* Age Range */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupTitle}>Yosh oralig'i</h4>
              <div className={styles.ageRange}>
                <input
                  type="range"
                  min="0"
                  max="18"
                  value={filters.ageRange.max}
                  onChange={(e) => handleFilterChange('ageRange', {
                    min: 0,
                    max: Number(e.target.value)
                  })}
                  className={styles.ageSlider}
                />
                <div className={styles.ageLabels}>
                  <span>0 yosh</span>
                  <span>{filters.ageRange.max} yosh</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupTitle}>Reyting</h4>
              <div className={styles.ratingFilter}>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <label key={rating} className={styles.ratingOption}>
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.rating === rating}
                      onChange={() => handleFilterChange('rating', rating)}
                    />
                    <div className={styles.ratingStars}>
                      {[...Array(rating)].map((_, i) => (
                        <MdStar key={i} className={styles.starFilled} />
                      ))}
                      {[...Array(5 - rating)].map((_, i) => (
                        <MdStar key={i} className={styles.starEmpty} />
                      ))}
                      <span>va yuqori</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Brendlar</h4>
                <div className={styles.filterOptions}>
                  {brands.slice(0, 10).map((brand) => (
                    <label key={brand.id} className={styles.filterOption}>
                      <input
                        type="checkbox"
                        checked={filters.brand.includes(brand.id)}
                        onChange={() => toggleFilter('brand', brand.id)}
                      />
                      <span className={styles.filterOptionText}>
                        {brand.name}
                        <span className={styles.filterOptionCount}>({brand.count})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Options */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupTitle}>Qo'shimcha</h4>
              <div className={styles.filterOptions}>
                <label className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  />
                  <span className={styles.filterOptionText}>Faqat mavjud mahsulotlar</span>
                </label>
                <label className={styles.filterOption}>
                  <input
                    type="checkbox"
                    checked={filters.freeShipping}
                    onChange={(e) => handleFilterChange('freeShipping', e.target.checked)}
                  />
                  <span className={styles.filterOptionText}>Bepul yetkazib berish</span>
                </label>
              </div>
            </div>

            {/* Sort Options */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupTitle}>Saralash</h4>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className={styles.sortSelect}
              >
                <option value="relevance">Mos kelishi bo'yicha</option>
                <option value="price-low">Narx: past dan yuqori</option>
                <option value="price-high">Narx: yuqori dan past</option>
                <option value="rating">Reyting bo'yicha</option>
                <option value="newest">Yangi mahsulotlar</option>
                <option value="popular">Mashhur mahsulotlar</option>
              </select>
            </div>
          </div>

          {/* Filter Panel Actions */}
          <div className={styles.filterActions}>
            <button onClick={clearFilters} className={styles.clearBtn}>
              Tozalash
            </button>
            <button 
              onClick={() => {
                handleSearch();
                setShowFilters(false);
              }} 
              className={styles.applyBtn}
            >
              Qo'llash ({activeFilters.length})
            </button>
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      {isMobile && showFilters && (
        <div className={styles.mobileOverlay} onClick={() => setShowFilters(false)}>
          <div className={styles.mobileFilterDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3>Filtrlar</h3>
              <button onClick={() => setShowFilters(false)}>
                <MdClose />
              </button>
            </div>
            <div className={styles.drawerContent}>
              {/* Same filter content as above */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchSystem;