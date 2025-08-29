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
import { useAllProducts } from '../../hooks/products.use';
import styles from './home.module.scss';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state: RootState) => state.products);

  // Use React Query hook for products
  const { data: apiProducts, isLoading, error } = useAllProducts();

  // Load products from React Query to Redux
  useEffect(() => {
    if (apiProducts && Array.isArray(apiProducts) && apiProducts.length > 0) {
      const safeProducts = apiProducts.map((product: any) => ({
        ...product,
        id: product.id || Math.random(),
        title: String(product.title || 'Mahsulot'),
        description: String(product.description || ''),
        price: Number(product.price || 0),
        category: typeof product.category === 'object'
          ? String(product.category?.name || 'Kategoriya')
          : String(product.category || 'Kategoriya'),
        brand: String(product.brand || 'Brand'),
        stock: Number(product.stock || 0),
        product_image: Array.isArray(product.product_image) ? product.product_image : [],
        status: product.status || 'active',
        is_active: Boolean(product.is_active !== false),
        condition: product.condition || 'new',
        negotiable: Boolean(product.negotiable),
        user: product.user || { first_name: 'User', last_name: '' }
      }));

      dispatch(setProducts(safeProducts));
      localStorage.setItem('marketplace_products', JSON.stringify(safeProducts));
    }
  }, [apiProducts, dispatch]);

  // Set loading state
  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

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
