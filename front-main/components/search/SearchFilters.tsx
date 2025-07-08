import React, { useState } from 'react';
import styles from './SearchFilters.module.scss';

interface SearchFilters {
  category: string[];
  priceRange: [number, number];
  brands: string[];
  ratings: number;
  availability: string;
  ageRange: string[];
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

const categories = [
  { id: 'clothing', name: 'Kiyim-kechak', count: 1250 },
  { id: 'toys', name: "O'yinchoqlar", count: 890 },
  { id: 'books', name: 'Kitoblar', count: 650 },
  { id: 'sports', name: 'Sport anjomlar', count: 420 },
  { id: 'school', name: 'Maktab buyumlari', count: 780 },
  { id: 'baby', name: 'Chaqaloq buyumlari', count: 560 },
  { id: 'electronics', name: 'Elektronika', count: 340 },
  { id: 'health', name: "Sog'liq", count: 290 }
];

const brands = [
  { id: 'faber-castell', name: 'Faber-Castell', count: 45 },
  { id: 'lego', name: 'LEGO', count: 120 },
  { id: 'fisher-price', name: 'Fisher-Price', count: 85 },
  { id: 'nike', name: 'Nike Kids', count: 67 },
  { id: 'adidas', name: 'Adidas Kids', count: 52 },
  { id: 'disney', name: 'Disney', count: 98 },
  { id: 'barbie', name: 'Barbie', count: 76 },
  { id: 'hot-wheels', name: 'Hot Wheels', count: 43 }
];

const ageRanges = [
  { id: '0-2', name: '0-2 yosh', count: 340 },
  { id: '3-5', name: '3-5 yosh', count: 520 },
  { id: '6-8', name: '6-8 yosh', count: 680 },
  { id: '9-12', name: '9-12 yosh', count: 450 },
  { id: '13+', name: '13+ yosh', count: 210 }
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    brands: false,
    ratings: true,
    availability: true,
    age: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    const newCategories = filters.category.includes(categoryId)
      ? filters.category.filter(c => c !== categoryId)
      : [...filters.category, categoryId];
    
    onFilterChange({ ...filters, category: newCategories });
  };

  const handleBrandChange = (brandId: string) => {
    const newBrands = filters.brands.includes(brandId)
      ? filters.brands.filter(b => b !== brandId)
      : [...filters.brands, brandId];
    
    onFilterChange({ ...filters, brands: newBrands });
  };

  const handlePriceChange = (min: number, max: number) => {
    onFilterChange({ ...filters, priceRange: [min, max] });
  };

  const handleRatingChange = (rating: number) => {
    onFilterChange({ ...filters, ratings: rating });
  };

  const handleAvailabilityChange = (availability: string) => {
    onFilterChange({ ...filters, availability });
  };

  const handleAgeRangeChange = (ageId: string) => {
    const newAgeRanges = filters.ageRange.includes(ageId)
      ? filters.ageRange.filter(a => a !== ageId)
      : [...filters.ageRange, ageId];
    
    onFilterChange({ ...filters, ageRange: newAgeRanges });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`${styles.star} ${i <= rating ? styles.filled : ''}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className={styles.searchFilters}>
      <div className={styles.filtersHeader}>
        <h3>Filtrlar</h3>
        <button onClick={onClearFilters} className={styles.clearButton}>
          Tozalash
        </button>
      </div>

      {/* Kategoriyalar */}
      <div className={styles.filterSection}>
        <button 
          className={styles.sectionHeader}
          onClick={() => toggleSection('category')}
        >
          <span>Kategoriyalar</span>
          <span>{expandedSections.category ? '▲' : '▼'}</span>
        </button>
        
        {expandedSections.category && (
          <div className={styles.sectionContent}>
            {categories.map(category => (
              <label key={category.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.category.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                />
                <span className={styles.checkboxText}>
                  {category.name} ({category.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Narx oralig'i */}
      <div className={styles.filterSection}>
        <button 
          className={styles.sectionHeader}
          onClick={() => toggleSection('price')}
        >
          <span>Narx oralig'i</span>
          <span>{expandedSections.price ? '▲' : '▼'}</span>
        </button>
        
        {expandedSections.price && (
          <div className={styles.sectionContent}>
            <div className={styles.priceInputs}>
              <input
                type="number"
                placeholder="Min narx"
                value={filters.priceRange[0]}
                onChange={(e) => handlePriceChange(parseInt(e.target.value) || 0, filters.priceRange[1])}
                className={styles.priceInput}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max narx"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceChange(filters.priceRange[0], parseInt(e.target.value) || 1000000)}
                className={styles.priceInput}
              />
            </div>
            <div className={styles.priceRange}>
              {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
            </div>
          </div>
        )}
      </div>

      {/* Brendlar */}
      <div className={styles.filterSection}>
        <button 
          className={styles.sectionHeader}
          onClick={() => toggleSection('brands')}
        >
          <span>Brendlar</span>
          <span>{expandedSections.brands ? '▲' : '▼'}</span>
        </button>
        
        {expandedSections.brands && (
          <div className={styles.sectionContent}>
            {brands.map(brand => (
              <label key={brand.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.id)}
                  onChange={() => handleBrandChange(brand.id)}
                />
                <span className={styles.checkboxText}>
                  {brand.name} ({brand.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reyting */}
      <div className={styles.filterSection}>
        <button 
          className={styles.sectionHeader}
          onClick={() => toggleSection('ratings')}
        >
          <span>Reyting</span>
          <span>{expandedSections.ratings ? '▲' : '▼'}</span>
        </button>
        
        {expandedSections.ratings && (
          <div className={styles.sectionContent}>
            {[4, 3, 2, 1].map(rating => (
              <label key={rating} className={styles.ratingLabel}>
                <input
                  type="radio"
                  name="rating"
                  checked={filters.ratings === rating}
                  onChange={() => handleRatingChange(rating)}
                />
                <span className={styles.ratingText}>
                  {renderStars(rating)} va yuqori
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Mavjudlik */}
      <div className={styles.filterSection}>
        <button 
          className={styles.sectionHeader}
          onClick={() => toggleSection('availability')}
        >
          <span>Mavjudlik</span>
          <span>{expandedSections.availability ? '▲' : '▼'}</span>
        </button>
        
        {expandedSections.availability && (
          <div className={styles.sectionContent}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="availability"
                checked={filters.availability === 'all'}
                onChange={() => handleAvailabilityChange('all')}
              />
              <span>Barchasi</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="availability"
                checked={filters.availability === 'in_stock'}
                onChange={() => handleAvailabilityChange('in_stock')}
              />
              <span>Mavjud</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="availability"
                checked={filters.availability === 'out_of_stock'}
                onChange={() => handleAvailabilityChange('out_of_stock')}
              />
              <span>Mavjud emas</span>
            </label>
          </div>
        )}
      </div>

      {/* Yosh oralig'i */}
      <div className={styles.filterSection}>
        <button 
          className={styles.sectionHeader}
          onClick={() => toggleSection('age')}
        >
          <span>Yosh oralig'i</span>
          <span>{expandedSections.age ? '▲' : '▼'}</span>
        </button>
        
        {expandedSections.age && (
          <div className={styles.sectionContent}>
            {ageRanges.map(age => (
              <label key={age.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.ageRange.includes(age.id)}
                  onChange={() => handleAgeRangeChange(age.id)}
                />
                <span className={styles.checkboxText}>
                  {age.name} ({age.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
