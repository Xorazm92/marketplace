import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EtsyStyleHero from '../../components/marketplace/EtsyStyleHero';
import FeaturedProducts from '../../components/marketplace/FeaturedProducts';
import ModernProductSection from '../../components/marketplace/ModernProductSection';
import CategoryShowcase from '../../components/marketplace/CategoryShowcase';
import TestimonialsSection from '../../components/marketplace/TestimonialsSection';
import WhyChooseUs from '../../components/marketplace/WhyChooseUs';
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
        {/* Hero Section */}
        <EtsyStyleHero />



        {/* Featured Products */}
        <section className={styles.section}>
          <FeaturedProducts />
        </section>

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Top Categories with Products */}
        <ModernProductSection
          title="Eng mashhur o'yinchoqlar"
          subtitle="Bolalar uchun eng yaxshi o'yinchoqlar to'plami"
          viewAllLink="/category/toys"
          categoryFilter="toys"
          maxProducts={8}
          showBadges={true}
        />

        <ModernProductSection
          title="Ta'limiy kitoblar"
          subtitle="Bolalarning rivojlanishi uchun foydali kitoblar"
          viewAllLink="/category/books"
          categoryFilter="books"
          maxProducts={8}
          showBadges={true}
        />

        <ModernProductSection
          title="Bolalar kiyimlari"
          subtitle="Zamonaviy va qulay kiyim-kechak"
          viewAllLink="/category/clothing"
          categoryFilter="clothing"
          maxProducts={8}
          showBadges={true}
        />

        {/* Customer Testimonials */}
        <TestimonialsSection />

        {/* More Categories */}
        <ModernProductSection
          title="Sport anjomlar"
          subtitle="Faol hayot uchun sport anjomlari"
          viewAllLink="/category/sports"
          categoryFilter="sports"
          maxProducts={6}
          showBadges={true}
        />

        <ModernProductSection
          title="Maktab buyumlari"
          subtitle="Ta'lim uchun zarur buyumlar"
          viewAllLink="/category/school"
          categoryFilter="school"
          maxProducts={6}
          showBadges={true}
        />
      </main>
    </div>
  );
};

export default HomePage;
