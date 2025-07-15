import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './SearchResults.module.scss';
import { getAllProducts, searchProducts, getAllProductsWithFilters } from '../../endpoints/product';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  discount?: number;
  badge?: string;
  slug: string;
  inStock: boolean;
  brand: string;
  category: string;
}

interface SearchFilters {
  category: string[];
  priceRange: [number, number];
  brands: string[];
  ratings: number;
  availability: string;
  ageRange: string[];
}

interface SearchResultsProps {
  searchQuery: string;
  filters: SearchFilters;
  sortBy: string;
  isLoading: boolean;
}

// Mock data - real loyihada API dan keladi
const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Bolalar uchun rangli qalam to\'plami',
    price: 45000,
    originalPrice: 60000,
    image: '/img/products/colored-pencils.jpg',
    rating: 4.8,
    reviews: 124,
    discount: 25,
    badge: 'Bestseller',
    slug: 'colored-pencils-set',
    inStock: true,
    brand: 'faber-castell',
    category: 'school'
  },
  {
    id: 2,
    title: 'Yumshoq ayiq o\'yinchoq',
    price: 120000,
    originalPrice: 150000,
    image: '/img/products/teddy-bear.jpg',
    rating: 4.9,
    reviews: 89,
    discount: 20,
    slug: 'soft-teddy-bear',
    inStock: true,
    brand: 'disney',
    category: 'toys'
  },
  {
    id: 3,
    title: 'Bolalar sport kiyimi',
    price: 85000,
    image: '/img/products/kids-sportswear.jpg',
    rating: 4.7,
    reviews: 156,
    badge: 'New',
    slug: 'kids-sportswear',
    inStock: false,
    brand: 'nike',
    category: 'clothing'
  },
  {
    id: 4,
    title: 'Ta\'lim kitoblari to\'plami',
    price: 95000,
    originalPrice: 120000,
    image: '/img/products/education-books.jpg',
    rating: 4.6,
    reviews: 203,
    discount: 21,
    slug: 'education-books-set',
    inStock: true,
    brand: 'faber-castell',
    category: 'books'
  },
  {
    id: 5,
    title: 'Bolalar velosipedi',
    price: 450000,
    originalPrice: 550000,
    image: '/img/products/kids-bicycle.jpg',
    rating: 4.8,
    reviews: 67,
    discount: 18,
    badge: 'Popular',
    slug: 'kids-bicycle',
    inStock: true,
    brand: 'nike',
    category: 'sports'
  },
  {
    id: 6,
    title: 'Maktab sumkasi',
    price: 75000,
    image: '/img/products/school-bag.jpg',
    rating: 4.5,
    reviews: 134,
    slug: 'school-backpack',
    inStock: true,
    brand: 'adidas',
    category: 'school'
  }
];

const SearchResults: React.FC<SearchResultsProps> = ({
  searchQuery,
  filters,
  sortBy,
  isLoading
}) => {
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const productsPerPage = 12;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts();
        if (response && response.length > 0) {
          let results = response;

          // Search query filter
          if (searchQuery) {
            results = results.filter((product: any) =>
              product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.brand?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }

          // Brand filter
          if (filters.brands.length > 0) {
            results = results.filter((product: any) =>
              filters.brands.includes(product.brand?.name)
            );
          }

          // Price range filter
          results = results.filter((product: any) =>
            parseFloat(product.price) >= filters.priceRange[0] &&
            parseFloat(product.price) <= filters.priceRange[1]
          );

          // Sorting
          switch (sortBy) {
            case 'price_low_high':
              results.sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));
              break;
            case 'price_high_low':
              results.sort((a: any, b: any) => parseFloat(b.price) - parseFloat(a.price));
              break;
            case 'newest':
              results.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              break;
            case 'popular':
              results.sort((a: any, b: any) => (b.reviews || 0) - (a.reviews || 0));
              break;
            case 'discount':
              results.sort((a: any, b: any) => (b.discount || 0) - (a.discount || 0));
              break;
            default:
              // relevance - keep original order
              break;
          }

          setFilteredProducts(results);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchQuery, filters, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.star}>★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.halfStar}>★</span>);
    }

    return stars;
  };

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Qidirilmoqda...</p>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className={styles.noResults}>
        <div className={styles.noResultsIcon}>🔍</div>
        <h3>Hech narsa topilmadi</h3>
        <p>
          {searchQuery ? (
            `"${searchQuery}" uchun hech qanday mahsulot topilmadi.`
          ) : (
            'Tanlangan filtrlar bo\'yicha hech qanday mahsulot topilmadi.'
          )}
        </p>
        <p>Qidiruv so'zlarini o'zgartiring yoki filtrlarni qayta sozlang.</p>
      </div>
    );
  }

  return (
    <div className={styles.searchResults}>
      <div className={styles.resultsHeader}>
        <p className={styles.resultsCount}>
          {filteredProducts.length} ta mahsulot topildi
          {searchQuery && ` "${searchQuery}" uchun`}
        </p>
      </div>

      <div className={styles.productsGrid}>
        {currentProducts.map((product) => (
          <Link 
            href={`/product/${product.slug}`} 
            key={product.id}
            className={styles.productCard}
          >
            <div className={styles.imageContainer}>
              <div className={styles.imagePlaceholder}>
                <span className={styles.productIcon}>📦</span>
              </div>
              {product.badge && (
                <span className={`${styles.badge} ${styles[product.badge.toLowerCase()]}`}>
                  {product.badge}
                </span>
              )}
              {product.discount && (
                <span className={styles.discount}>-{product.discount}%</span>
              )}
              {!product.inStock && (
                <div className={styles.outOfStock}>Mavjud emas</div>
              )}
            </div>
            
            <div className={styles.content}>
              <h3 className={styles.productTitle}>{product.title}</h3>
              
              <div className={styles.rating}>
                <div className={styles.stars}>
                  {renderStars(product.rating)}
                </div>
                <span className={styles.reviewCount}>({product.reviews})</span>
              </div>
              
              <div className={styles.priceContainer}>
                <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            ← Oldingi
          </button>
          
          <span className={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>
          
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            Keyingi →
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
