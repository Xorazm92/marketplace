import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import SearchFilters from '../../components/search/SearchFilters';
import SearchResults from '../../components/search/SearchResults';
import SearchSorting from '../../components/search/SearchSorting';
import { getSubcategoriesByParent, getCategoryById } from '../../endpoints/category';
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
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);

  const category = categoryData[slug as string];

  // Load category and subcategories
  useEffect(() => {
    const loadCategoryData = async () => {
      if (slug) {
        try {
          // Find category by slug from static data first
          const staticCategory = Object.entries(categoryData).find(([key]) => key === slug);
          if (staticCategory) {
            const [, categoryInfo] = staticCategory;
            setCurrentCategory({
              name: categoryInfo.name,
              description: categoryInfo.description,
              icon: categoryInfo.icon,
              slug: slug as string
            });
          }

          // Try to get category ID and load subcategories
          // For now, use static mapping - in production, you'd get this from API
          const categoryIdMap: Record<string, number> = {
            'clothing': 1,
            'toys': 2,
            'books': 3,
            'sports': 4,
            'school': 5,
            'baby': 6,
            'electronics': 7,
            'health': 8
          };

          const categoryId = categoryIdMap[slug as string];
          if (categoryId) {
            const subcategoriesData = await getSubcategoriesByParent(categoryId);
            setSubcategories(subcategoriesData || []);
            console.log('📂 Subcategories loaded:', subcategoriesData);
          }
        } catch (error) {
          console.error('Error loading category data:', error);
        }
      }
    };

    loadCategoryData();
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
          </div>

          {/* Subcategories */}
          {subcategories.length > 0 && (
            <div className={styles.subcategoriesSection}>
              <h3 className={styles.subcategoriesTitle}>Subkategoriyalar</h3>
              <div className={styles.subcategoriesGrid}>
                {subcategories.map((subcat) => (
                  <Link 
                    key={subcat.id} 
                    href={`/products?category=${subcat.id}`}
                    className={styles.subcategoryCard}
                  >
                    <div className={styles.subcategoryIcon}>
                      {subcat.image_url ? (
                        <img src={subcat.image_url} alt={subcat.name} />
                      ) : (
                        <span>📦</span>
                      )}
                    </div>
                    <div className={styles.subcategoryInfo}>
                      <h4>{subcat.name}</h4>
                      {subcat.description && (
                        <p>{subcat.description}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className={styles.filterBar}>
            <div className={styles.filterControls}>
              <button 
                className={styles.filterToggle}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtrlar {showFilters ? 'Yashirish' : 'Ko\'rsatish'}
              </button>

              {/* Category Filter Dropdown */}
              <div className={styles.categoryFilterDropdown}>
                <label htmlFor="categoryFilter">Saralash:</label>
                <select 
                  id="categoryFilter"
                  className={styles.categoryFilterSelect}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'price-asc') setSortBy('price-asc');
                    else if (value === 'price-desc') setSortBy('price-desc');
                    else if (value === 'name-asc') setSortBy('name-asc');
                    else if (value === 'name-desc') setSortBy('name-desc');
                    else if (value === 'newest') setSortBy('newest');
                    else if (value === 'oldest') setSortBy('oldest');
                    else setSortBy('relevance');
                  }}
                  value={sortBy}
                >
                  <option value="relevance">Mos kelishi bo'yicha</option>
                  <option value="price-asc">Narx: Arzondan qimmmatiga</option>
                  <option value="price-desc">Narx: Qimmatdan arzonga</option>
                  <option value="name-asc">Reyting: Yuqoridan pastga</option>
                  <option value="newest">Yangi mahsulotlar</option>
                  <option value="oldest">Mashhur mahsulotlar</option>
                  <option value="name-desc">Eng katta chegirmalar</option>
                </select>
              </div>
            </div>
            
            <SearchSorting 
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
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
