import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EtsyStyleHero from '../../components/marketplace/EtsyStyleHero';
import FeaturedProducts from '../../components/marketplace/FeaturedProducts';
import ProductSection from '../../components/marketplace/ProductSection';
import Footer from '../../components/marketplace/Footer';
import { RootState } from '../../store/store';
import { setProducts, setLoading } from '../../store/features/productSlice';
import { getAllProducts } from '../../endpoints/product';
import styles from './home.module.scss';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state: RootState) => state.products);

  // Load products on page load if not already loaded
  useEffect(() => {
    const loadProducts = async () => {
      // Clear old cache and reload fresh data
      localStorage.removeItem('marketplace_products');
      dispatch(setProducts([]));

      if (products.length === 0) {
        try {
          dispatch(setLoading(true));

          // Try to load from API
          try {
            console.log('Loading products from API...');
            const response = await getAllProducts();
            console.log('API Response:', response);

            if (response && response.length > 0) {
              // Safe processing of API products
              const safeProducts = response.map((product: any, index: number) => ({
                ...product,
                id: product.id || index + 1,
                title: String(product.title || 'Mahsulot'),
                description: String(product.description || ''),
                price: Number(product.price || 0),
                originalPrice: Number(product.original_price || product.price * 1.2 || 0),
                category: String(product.category?.name || product.category || 'Kategoriya'),
                brand: String(product.brand?.name || product.brand || 'Brand'),
                stock: Number(product.stock || 10),
                product_image: product.product_image || [],
                createdAt: String(product.createdAt || new Date().toISOString()),
                updatedAt: String(product.updatedAt || new Date().toISOString()),
                status: product.status || 'active',
                is_active: Boolean(product.is_active !== false),
                condition: product.condition || 'new',
                negotiable: Boolean(product.negotiable),
                user: product.user || { first_name: 'User', last_name: '' }
              }));

              console.log('Processed products:', safeProducts);
              dispatch(setProducts(safeProducts));

              // Cache products in localStorage
              localStorage.setItem('marketplace_products', JSON.stringify(safeProducts));
              dispatch(setLoading(false));
              return;
            }
          } catch (apiError) {
            console.log('API error:', apiError);
            console.log('API not available, using mock data');
          }

          // If API fails, show empty state
          console.log('No products available from API');
          dispatch(setProducts([]));

        } catch (error) {
          console.error('Error loading products:', error);
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    loadProducts();
  }, [dispatch, products.length]);

  return (
    <div className={styles.homepage}>
      <main className={styles.mainContent}>
        <EtsyStyleHero />

        {/* Tavsiya etiladigan mahsulotlar */}
        <section className={styles.section}>
          <FeaturedProducts />
        </section>

        {/* Kategoriya bo'yicha mahsulotlar */}
        <section className={styles.section}>
          <ProductSection
            title="Kiyim-kechak"
            viewAllLink="/category/clothing"
            products="clothing"
          />
        </section>

        <section className={styles.section}>
          <ProductSection
            title="O'yinchoqlar"
            viewAllLink="/category/toys"
            products="toys"
          />
        </section>

        <section className={styles.section}>
          <ProductSection
            title="Kitoblar"
            viewAllLink="/category/books"
            products="books"
          />
        </section>

        <section className={styles.section}>
          <ProductSection
            title="Sport anjomlar"
            viewAllLink="/category/sports"
            products="sports"
          />
        </section>

        <section className={styles.section}>
          <ProductSection
            title="Maktab buyumlari"
            viewAllLink="/category/school"
            products="school"
          />
        </section>

        <section className={styles.section}>
          <ProductSection
            title="Chaqaloq buyumlari"
            viewAllLink="/category/baby"
            products="baby"
          />
        </section>

        <section className={styles.section}>
          <ProductSection
            title="Elektronika"
            viewAllLink="/category/electronics"
            products="electronics"
          />
        </section>

        <section className={styles.section}>
          <ProductSection
            title="Sog'liq"
            viewAllLink="/category/health"
            products="health"
          />
        </section>
      </main>

      {/* O'zbek Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
