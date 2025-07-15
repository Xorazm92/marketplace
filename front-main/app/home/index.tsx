import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HeroSection from '../../components/marketplace/HeroSection';
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
      if (products.length === 0) {
        try {
          dispatch(setLoading(true));

          // Try to load from API
          try {
            const response = await getAllProducts();
            if (response && response.length > 0) {
              // Safe processing of API products
              const safeProducts = response.map((product: any, index: number) => ({
                ...product,
                id: product.id || index + 1,
                title: String(product.title || 'Mahsulot'),
                description: String(product.description || ''),
                price: Number(product.price || 0),
                originalPrice: Number(product.originalPrice || product.price || 0),
                category: String(product.category?.name || product.category || 'Kategoriya'),
                brand: String(product.brand || 'Brand'),
                stock: Number(product.stock || 0),
                product_image: product.product_image || [],
                createdAt: String(product.createdAt || new Date().toISOString()),
                updatedAt: String(product.updatedAt || new Date().toISOString()),
                status: product.status || 'active',
                is_active: Boolean(product.is_active !== false)
              }));
              dispatch(setProducts(safeProducts));
              return;
            }
          } catch (apiError) {
            console.log('API not available, using mock data');
          }

          // Fallback to mock data
          const mockProducts = [
            {
              id: 1,
              title: "Bolalar o'yinchoq mashina",
              description: "Rangli va xavfsiz bolalar uchun o'yinchoq mashina",
              price: 50000,
              originalPrice: 60000,
              category: "O'yinchiqlar",
              brand: "ToyBrand",
              stock: 25,
              product_image: [{ id: 1, url: "uploads/toy1.svg", product_id: 1 }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active' as const,
              is_active: true
            },
            {
              id: 2,
              title: "Bolalar kitob to'plami",
              description: "Ta'limiy va qiziqarli hikoyalar to'plami",
              price: 35000,
              originalPrice: 40000,
              category: "Kitoblar",
              brand: "BookBrand",
              stock: 15,
              product_image: [{ id: 2, url: "uploads/book1.svg", product_id: 2 }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active' as const,
              is_active: true
            },
            {
              id: 3,
              title: "Bolalar sumkasi",
              description: "Maktab uchun chiroyli va amaliy sumka",
              price: 75000,
              originalPrice: 85000,
              category: "Sumkalar",
              brand: "BagBrand",
              stock: 10,
              product_image: [{ id: 3, url: "uploads/bag1.svg", product_id: 3 }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active' as const,
              is_active: true
            },
            {
              id: 4,
              title: "Bolalar kiyimi",
              description: "Yumshoq va qulay bolalar kiyimi",
              price: 45000,
              originalPrice: 50000,
              category: "Kiyim-kechak",
              brand: "FashionKids",
              stock: 20,
              product_image: [{ id: 4, url: "uploads/clothing1.svg", product_id: 4 }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active' as const,
              is_active: true
            },
            {
              id: 5,
              title: "Sport to'pi",
              description: "Bolalar uchun sport to'pi",
              price: 25000,
              originalPrice: 30000,
              category: "Sport anjomlar",
              brand: "SportKids",
              stock: 30,
              product_image: [{ id: 5, url: "uploads/sports1.svg", product_id: 5 }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active' as const,
              is_active: true
            },
            {
              id: 6,
              title: "Maktab daftari",
              description: "Bolalar uchun chiroyli maktab daftari",
              price: 8000,
              originalPrice: 10000,
              category: "Maktab buyumlari",
              brand: "SchoolSupply",
              stock: 50,
              product_image: [{ id: 6, url: "uploads/school1.svg", product_id: 6 }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active' as const,
              is_active: true
            },
            {
              id: 7,
              title: "Chaqaloq kiyimi",
              description: "Yumshoq va xavfsiz chaqaloq kiyimi",
              price: 35000,
              originalPrice: 40000,
              category: "Chaqaloq buyumlari",
              brand: "BabyWear",
              stock: 25,
              product_image: [{ id: 7, url: "uploads/baby1.svg", product_id: 7 }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active' as const,
              is_active: true
            },
            {
              id: 8,
              title: "Bolalar plansheti",
              description: "Ta'limiy o'yinlar bilan bolalar plansheti",
              price: 250000,
              originalPrice: 300000,
              category: "Elektronika",
              brand: "KidsTab",
              stock: 12,
              product_image: [{ id: 8, url: "uploads/electronics1.svg", product_id: 8 }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active' as const,
              is_active: true
            },
            {
              id: 9,
              title: "Vitamin kompleksi",
              description: "Bolalar uchun foydali vitamin kompleksi",
              price: 45000,
              originalPrice: 50000,
              category: "Sog'liq",
              brand: "HealthKids",
              stock: 18,
              product_image: [{ id: 9, url: "uploads/health1.svg", product_id: 9 }],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active' as const,
              is_active: true
            }
          ];

          dispatch(setProducts(mockProducts));

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
