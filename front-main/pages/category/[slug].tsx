import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import SearchFilters from '../../components/search/SearchFilters';
import SearchResults from '../../components/search/SearchResults';
import SearchSorting from '../../components/search/SearchSorting';
import { getSubcategoriesByParent, getCategoryById } from '../../endpoints/category';
import styles from '../../styles/Category.module.scss';

// Helper function for category icons
const getCategoryIcon = (slug: string): string => {
  const icons: Record<string, string> = {
    'clothing': '👕',
    'kiyim-kechak': '👕',
    'ichki-kiyim': '👙',
    'tashqi-kiyim': '🧥',
    'toys': '🧸',
    'oyinchoqlar': '🧸',
    'konstruktor': '🧩',
    'yumshoq-oyinchoqlar': '🐻',
    'books': '📚',
    'kitoblar': '📚',
    'talim-kitoblari': '📖',
    'ertaklar': '📜',
    'sports': '⚽',
    'sport': '⚽',
    'school': '🎒',
    'maktab': '🎒',
    'baby': '🍼',
    'chaqaloq': '🍼',
  };
  return icons[slug.toLowerCase()] || '📦';
};

interface SearchFiltersType {
  category: string[];
  priceRange: [number, number];
  brands: string[];
  ratings: number;
  availability: string;
  ageRange: string[];
}

const categoryData: Record<string, { name: string; description: string; icon: string }> = {
  'kiyim-kechak': {
    name: 'Kiyim-kechak',
    description: 'Bolalar uchun zamonaviy va qulay kiyim-kechaklar',
    icon: '👕'
  },
  'clothing': {
    name: 'Kiyim-kechak',
    description: 'Bolalar uchun zamonaviy va qulay kiyim-kechaklar',
    icon: '👕'
  },
  'oyinchoqlar': {
    name: "O'yinchoqlar",
    description: 'Bolalarning rivojlanishi uchun foydali o\'yinchoqlar',
    icon: '🧸'
  },
  'toys': {
    name: "O'yinchoqlar",
    description: 'Bolalarning rivojlanishi uchun foydali o\'yinchoqlar',
    icon: '🧸'
  },
  'kitoblar': {
    name: 'Kitoblar',
    description: 'Ta\'lim va o\'yin uchun bolalar kitoblari',
    icon: '📚'
  },
  'books': {
    name: 'Kitoblar',
    description: 'Ta\'lim va o\'yin uchun bolalar kitoblari',
    icon: '📚'
  },
  'sport': {
    name: 'Sport anjomlar',
    description: 'Bolalar uchun sport va faollik anjomlar',
    icon: '⚽'
  },
  'sports': {
    name: 'Sport anjomlar',
    description: 'Bolalar uchun sport va faollik anjomlar',
    icon: '⚽'
  },
  'maktab': {
    name: 'Maktab buyumlari',
    description: 'Maktab va ta\'lim uchun zarur buyumlar',
    icon: '🎒'
  },
  'school': {
    name: 'Maktab buyumlari',
    description: 'Maktab va ta\'lim uchun zarur buyumlar',
    icon: '🎒'
  },
  'chaqaloq': {
    name: 'Chaqaloq buyumlari',
    description: 'Chaqaloqlar uchun zarur mahsulotlar',
    icon: '🍼'
  },
  'baby': {
    name: 'Chaqaloq buyumlari',
    description: 'Chaqaloqlar uchun zarur mahsulotlar',
    icon: '🍼'
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
          // Map slugs to backend category IDs
          const categoryIdMap: Record<string, number> = {
            'kiyim-kechak': 1,
            'clothing': 1,
            'oyinchoqlar': 4,
            'toys': 4,
            'kitoblar': 7,
            'books': 7,
            'sport': 10,
            'sports': 10,
            'sport-anjomlar': 10,
            'maktab': 11,
            'school': 11,
            'chaqaloq': 12,
            'baby': 12
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
          {/* Etsy-style Category Header */}
          <div className={styles.etsyHeader}>
            <h1 className={styles.etsyTitle}>{category.name}</h1>
            <p className={styles.etsySubtitle}>{category.description}</p>
          </div>

          {/* Etsy-style Subcategories Grid */}
          {subcategories.length > 0 && (
            <div className={styles.etsySubcategoriesSection}>
              <div className={styles.etsySubcategoriesGrid}>
                {subcategories.map((subcat) => (
                  <Link 
                    key={subcat.id} 
                    href={`/category/${subcat.slug || subcat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className={styles.etsySubcategoryCard}
                  >
                    <div className={styles.etsySubcategoryImage}>
                      {subcat.image_url ? (
                        <img src={subcat.image_url} alt={subcat.name} />
                      ) : (
                        <div className={styles.etsyPlaceholderImage}>
                          <span>{getCategoryIcon(subcat.slug || subcat.name)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className={styles.etsySubcategoryTitle}>{subcat.name}</h3>
                  </Link>
                ))}
              </div>
              
              {subcategories.length > 6 && (
                <div className={styles.etsyShowMore}>
                  <button className={styles.etsyShowMoreButton}>
                    Yana ko'rsatish ({subcategories.length - 6})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Etsy-style "Shop the look" section */}
          <div className={styles.etsyShopSection}>
            <div className={styles.etsyShopHeader}>
              <h2 className={styles.etsyShopTitle}>Barcha Mahsulotlar</h2>
              <div className={styles.etsyFilters}>
                <button className={styles.etsyFilterButton}>
                  <span>🎯</span> Filtrlar ko'rsatish
                </button>
                <div className={styles.etsySortBy}>
                  <span>1,000+ mahsulot mavjud</span>
                  <select 
                    className={styles.etsySortSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="relevance">Saralash: Mos kelishi bo'yicha</option>
                    <option value="price-asc">Narx: Arzondan qimmatiga</option>
                    <option value="price-desc">Narx: Qimmatdan arzonga</option>
                    <option value="newest">Reyting: Yuqoridan pastga</option>
                    <option value="oldest">Yangi mahsulotlar</option>
                    <option value="name-desc">Mashhur mahsulotlar</option>
                    <option value="name-asc">Eng katta chegirmalar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Etsy-style Products Grid */}
            <div className={styles.etsyProductsGrid}>
              <SearchResults 
                searchQuery=""
                filters={filters}
                sortBy={sortBy}
                isLoading={isLoading}
                categorySlug={slug as string}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CategoryPage;
