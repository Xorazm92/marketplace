import React from 'react';
import Header from '../../components/marketplace/Header';
import HeroSection from '../../components/marketplace/HeroSection';
import FeaturedProducts from '../../components/marketplace/FeaturedProducts';
import ProductSection from '../../components/marketplace/ProductSection';
import Footer from '../../components/marketplace/Footer';
import styles from './home.module.scss';

const HomePage: React.FC = () => {
  return (
    <div className={styles.homepage}>
      <Header />
      <main className={styles.mainContent}>
        <HeroSection />

        {/* Kategoriya bo'yicha mahsulotlar */}
        <ProductSection
          title="Kiyim-kechak"
          viewAllLink="/category/clothing"
          products="clothing"
        />

        <ProductSection
          title="O'yinchoqlar"
          viewAllLink="/category/toys"
          products="toys"
        />

        <ProductSection
          title="Kitoblar"
          viewAllLink="/category/books"
          products="books"
        />

        <ProductSection
          title="Sport anjomlar"
          viewAllLink="/category/sports"
          products="sports"
        />

        <ProductSection
          title="Maktab buyumlari"
          viewAllLink="/category/school"
          products="school"
        />

        <ProductSection
          title="Chaqaloq buyumlari"
          viewAllLink="/category/baby"
          products="baby"
        />

        <ProductSection
          title="Elektronika"
          viewAllLink="/category/electronics"
          products="electronics"
        />

        <ProductSection
          title="Sog'liq"
          viewAllLink="/category/health"
          products="health"
        />
      </main>

      {/* O'zbek Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
