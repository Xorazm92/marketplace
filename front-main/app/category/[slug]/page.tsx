'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '../../../endpoints/product';
import { getAllCategories } from '../../../endpoints/category';
import ProductCard from '../../../components/marketplace/ProductCard';
import styles from './CategoryPage.module.scss';

interface Product {
  id: number;
  title: string;
  price: number;
  images?: string[];
  product_image?: Array<{ url: string }>;
  category?: { name: string; slug: string };
  brand?: { name: string };
  rating?: number;
  description?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.slug as string;
  
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Fetch categories to get category info
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getAllCategories();
      return Array.isArray(response) ? response : (response?.data || response?.categories || []);
    }
  });

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', categorySlug],
    queryFn: async () => {
      const response = await getAllProducts();
      return Array.isArray(response) ? response : (response?.data || response?.products || []);
    }
  });

  const currentCategory = categories.find((cat: Category) => cat.slug === categorySlug);

  // Filter products by category
  useEffect(() => {
    if (!products.length || !currentCategory) {
      setFilteredProducts([]);
      return;
    }

    let filtered = products.filter((product: Product) => {
      // Check if product belongs to current category
      const productCategory = product.category;
      if (productCategory) {
        return productCategory.slug === categorySlug || 
               productCategory.name?.toLowerCase().includes(categorySlug.toLowerCase());
      }
      return false;
    });

    // Apply price filter
    filtered = filtered.filter((product: Product) => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => b.id - a.id);
        break;
    }

    setFilteredProducts(filtered);
  }, [products, categorySlug, currentCategory, sortBy, priceRange]);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange({ min, max });
    setCurrentPage(1);
  };

  // Pagination
  const productsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}>⏳</div>
        <h2>Mahsulotlar yuklanmoqda...</h2>
      </div>
    );
  }

  return (
    <div className={styles.categoryPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.breadcrumb}>
          <span>Bosh sahifa</span>
          <span className={styles.separator}>/</span>
          <span>Kategoriyalar</span>
          <span className={styles.separator}>/</span>
          <span className={styles.current}>{currentCategory?.name || categorySlug}</span>
        </div>
        
        <h1 className={styles.pageTitle}>
          {currentCategory?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)}
        </h1>
        
        {currentCategory?.description && (
          <p className={styles.categoryDescription}>{currentCategory.description}</p>
        )}
        
        <div className={styles.resultsInfo}>
          {filteredProducts.length} ta mahsulot topildi
        </div>
      </div>

      <div className={styles.pageContent}>
        {/* Filters Sidebar */}
        <aside className={styles.filtersSidebar}>
          <div className={styles.filterSection}>
            <h3>Saralash</h3>
            <select 
              value={sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">Eng yangi</option>
              <option value="price-low">Arzon narx</option>
              <option value="price-high">Qimmat narx</option>
              <option value="rating">Reyting bo'yicha</option>
            </select>
          </div>

          <div className={styles.filterSection}>
            <h3>Narx oralig'i</h3>
            <div className={styles.priceRange}>
              <input
                type="number"
                placeholder="Min narx"
                value={priceRange.min || ''}
                onChange={(e) => handlePriceRangeChange(Number(e.target.value) || 0, priceRange.max)}
                className={styles.priceInput}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max narx"
                value={priceRange.max || ''}
                onChange={(e) => handlePriceRangeChange(priceRange.min, Number(e.target.value) || 1000000)}
                className={styles.priceInput}
              />
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className={styles.productsMain}>
          {currentProducts.length > 0 ? (
            <>
              <div className={styles.productsGrid}>
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={
                      product.product_image?.[0]?.url ||
                      product.images?.[0] ||
                      '/placeholder-product.jpg'
                    }
                    category={product.category?.name || 'Kategoriya'}
                    brand={product.brand?.name}
                    rating={product.rating}
                    description={product.description}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={styles.paginationButton}
                  >
                    ← Oldingi
                  </button>
                  
                  <div className={styles.pageNumbers}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={styles.paginationButton}
                  >
                    Keyingi →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.noProducts}>
              <div className={styles.noProductsIcon}>📦</div>
              <h3>Bu kategoriyada mahsulot topilmadi</h3>
              <p>Boshqa kategoriyalarni ko'rib chiqing yoki qidiruv so'zini o'zgartiring.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
