import React from 'react';
import styles from './SearchSorting.module.scss';

interface SearchSortingProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

const sortOptions = [
  { value: 'relevance', label: 'Mos kelishi bo\'yicha' },
  { value: 'price_low_high', label: 'Narx: Arzondan qimmmatga' },
  { value: 'price_high_low', label: 'Narx: Qimmatdan arzonga' },
  { value: 'rating_high_low', label: 'Reyting: Yuqoridan pastga' },
  { value: 'newest', label: 'Yangi mahsulotlar' },
  { value: 'popular', label: 'Mashhur mahsulotlar' },
  { value: 'discount', label: 'Eng katta chegirmalar' }
];

const SearchSorting: React.FC<SearchSortingProps> = ({
  sortBy,
  onSortChange
}) => {
  return (
    <div className={styles.searchSorting}>
      <label className={styles.sortLabel}>
        Saralash:
      </label>
      <select 
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className={styles.sortSelect}
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SearchSorting;
