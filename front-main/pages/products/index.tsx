import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getProducts } from '../../endpoints/product';
import { getAllCategories } from '../../endpoints/category';
import ProductCard from '../../components/products/ProductCard';
import CategoryFilter from '../../components/filters/CategoryFilter';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from '../../styles/Products.module.scss';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category_id: number;
  brand_id: number;
  is_active: boolean;
  is_checked: string;
  product_image: Array<{
    id: number;
    url: string;
  }>;
  brand?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ProductsPage: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      
      if (response && response.products) {
        // Faqat tasdiqlangan va faol mahsulotlarni ko'rsatamiz
        const approvedProducts = response.products.filter(
          (product: Product) => product.is_checked === 'APPROVED' && product.is_active
        );
        setProducts(approvedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response) {
        setCategories(response);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category_id === selectedCategory : true;
    const matchesSearch = searchQuery ? 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Head>
        <title>Mahsulotlar - INBOLA</title>
        <meta name="description" content="Bolalar uchun xavfsiz va sifatli mahsulotlar" />
      </Head>

      <div className={styles.productsPage}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>Barcha Mahsulotlar</h1>
            <p>Bolalar uchun xavfsiz va sifatli mahsulotlar</p>
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Mahsulot qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.categoryFilter}>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className={styles.categorySelect}
              >
                <option value="">Barcha kategoriyalar</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className={styles.loading}>
              <LoadingSpinner />
              <p>Mahsulotlar yuklanmoqda...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <h3>Mahsulotlar topilmadi</h3>
              <p>Qidiruv shartlariga mos mahsulotlar yo'q</p>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => router.push(`/product/${product.id}`)}
                />
              ))}
            </div>
          )}

          {/* Results Info */}
          {!loading && (
            <div className={styles.resultsInfo}>
              <p>
                {filteredProducts.length} ta mahsulot topildi
                {selectedCategory && (
                  <span> - {categories.find(c => c.id === selectedCategory)?.name}</span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
