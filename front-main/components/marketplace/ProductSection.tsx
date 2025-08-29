import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { getAllProducts } from '../../endpoints/product';
import { RootState } from '../../store/store';
import EtsyStyleProductCard from './EtsyStyleProductCard';
import OptimizedImage from '../common/OptimizedImage';
import styles from './ProductSection.module.scss';

interface Product {
  id: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  discount?: number;
  badge?: string;
  slug: string;
}

interface ProductSectionProps {
  title: string;
  viewAllLink: string;
  products: string; // category type
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, viewAllLink, products }) => {
  // Get products from Redux store
  const { products: allProducts } = useSelector((state: RootState) => state.products);
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Map frontend categories to backend category slugs
  const getCategorySlug = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'clothing': 'kiyim-kechak',
      'toys': 'oyinchoqlar',
      'books': 'kitoblar',
      'sports': 'sport',
      'school': 'maktab',
      'baby': 'chaqaloq',
      'electronics': 'elektronika',
      'health': 'soglik'
    };
    return categoryMap[category] || category;
  };

  // Load real products from API or Redux
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);

        // Get current products from Redux store
        const currentProducts = allProducts;

        // First check Redux store
        if (currentProducts.length > 0) {
          console.log('All products from Redux:', currentProducts);
          console.log('Looking for category:', title, 'or products:', products);
          console.log('First product structure:', currentProducts[0]);

          // Filter products by category from Redux store with safe checks
          const filteredProducts = currentProducts.filter(product => {
            try {
              // Safe category extraction
              const productCategory = product?.category;
              if (!productCategory || typeof productCategory !== 'string') {
                console.log('Product without valid category:', product);
                return false; // Skip products without valid category
              }

              const productCategoryLower = productCategory.toLowerCase();
              const titleLower = title.toLowerCase();
              const productsLower = products.toLowerCase();

              console.log(`Comparing: "${productCategory}" with title: "${title}" and products: "${products}"`);

              // Enhanced matching strategies
              const isMatch = (
                productCategoryLower.includes(titleLower) ||
                productCategoryLower.includes(productsLower) ||
                titleLower.includes(productCategoryLower) ||
                productsLower.includes(productCategoryLower) ||
                productCategory === title ||
                // Exact mappings for better matching
                (title === "Kiyim-kechak" && (
                  productCategoryLower.includes("kiyim") ||
                  productCategoryLower.includes("clothing") ||
                  productCategory === "Kiyim-kechak"
                )) ||
                (title === "O'yinchiqlar" && (
                  productCategoryLower.includes("o'yinchiq") ||
                  productCategoryLower.includes("toy") ||
                  productCategory === "O'yinchiqlar"
                )) ||
                (title === "Kitoblar" && (
                  productCategoryLower.includes("kitob") ||
                  productCategoryLower.includes("book") ||
                  productCategory === "Kitoblar"
                )) ||
                (title === "Sport anjomlar" && (
                  productCategoryLower.includes("sport") ||
                  productCategory === "Sport anjomlar"
                )) ||
                (title === "Maktab buyumlari" && (
                  productCategoryLower.includes("maktab") ||
                  productCategoryLower.includes("ta'lim") ||
                  productCategoryLower.includes("school") ||
                  productCategory === "Maktab buyumlari"
                )) ||
                (title === "Chaqaloq buyumlari" && (
                  productCategoryLower.includes("chaqaloq") ||
                  productCategoryLower.includes("baby") ||
                  productCategory === "Chaqaloq buyumlari"
                )) ||
                (title === "Elektronika" && (
                  productCategoryLower.includes("elektronika") ||
                  productCategoryLower.includes("electronic") ||
                  productCategory === "Elektronika"
                )) ||
                (title === "Sog'liq" && (
                  productCategoryLower.includes("sog'liq") ||
                  productCategoryLower.includes("health") ||
                  productCategory === "Sog'liq"
                ))
              );

              console.log(`Match result for "${productCategory}": ${isMatch}`);
              return isMatch;
            } catch (error) {
              console.error('Error filtering product:', error, product);
              return false;
            }
          });

          console.log('Filtered products:', filteredProducts);

          if (filteredProducts.length > 0) {
            setRealProducts(filteredProducts.slice(0, 8)); // Show max 8 products
            setLoading(false);
            return;
          } else {
            // If no specific category match, show all available products
            console.log('No category match found, showing all products for:', title);
            if (currentProducts.length > 0) {
              setRealProducts(currentProducts.slice(0, 4)); // Show first 4 products
            } else {
              // Show empty state or placeholder products
              setRealProducts([]);
            }
            setLoading(false);
            return;
          }
        }

        // Fallback to API call
        const categorySlug = getCategorySlug(products);
        const response = await getAllProducts(categorySlug);

        if (response && response.length > 0) {
          // Take first 4 products for this category
          setRealProducts(response.slice(0, 4));
        } else {
          // If no products in this category, try without category filter
          const allResponse = await getAllProducts();
          if (allResponse && allResponse.length > 0) {
            // Take random 4 products
            const shuffled = allResponse.sort(() => 0.5 - Math.random());
            setRealProducts(shuffled.slice(0, 4));
          } else {
            // Fallback to sample data if no real products at all
            setRealProducts(getProductsByCategory(products));
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample data on error
        setRealProducts(getProductsByCategory(products));
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [title]); // Only re-run when title changes, not when products change

  // Sample products data based on category (fallback)
  const getProductsByCategory = (category: string): Product[] => {
    const clothingProducts = [
      {
        id: 1,
        title: 'Bolalar ko\'ylagi',
        price: 45000,
        originalPrice: 60000,
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop',
        rating: 4.5,
        reviews: 124,
        discount: 25,
        slug: 'kids-shirt'
      },
      {
        id: 2,
        title: 'Qizlar uchun ko\'ylak',
        price: 55000,
        originalPrice: 75000,
        image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=300&fit=crop',
        rating: 4.7,
        reviews: 89,
        discount: 27,
        slug: 'girls-dress'
      },
      {
        id: 3,
        title: 'O\'g\'il bolalar shim',
        price: 35000,
        image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=300&fit=crop',
        rating: 4.3,
        reviews: 156,
        slug: 'boys-pants'
      },
      {
        id: 4,
        title: 'Bolalar kurtka',
        price: 85000,
        originalPrice: 110000,
        image: '/img/products/kids-jacket.jpg',
        rating: 4.6,
        reviews: 203,
        discount: 23,
        slug: 'kids-jacket'
      },
      {
        id: 5,
        title: 'Bolalar poyabzal',
        price: 65000,
        originalPrice: 80000,
        image: '/img/products/kids-shoes.jpg',
        rating: 4.4,
        reviews: 67,
        discount: 19,
        slug: 'kids-shoes'
      },
      {
        id: 6,
        title: 'Bolalar shapka',
        price: 25000,
        image: '/img/products/kids-hat.jpg',
        rating: 4.2,
        reviews: 134,
        slug: 'kids-hat'
      }
    ];

    const toysProducts = [
      {
        id: 7,
        title: 'Lego konstruktor',
        price: 120000,
        originalPrice: 150000,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        rating: 4.8,
        reviews: 345,
        discount: 20,
        slug: 'lego-set'
      },
      {
        id: 8,
        title: 'Yumshoq ayiq',
        price: 45000,
        originalPrice: 60000,
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop',
        rating: 4.6,
        reviews: 234,
        discount: 25,
        slug: 'teddy-bear'
      },
      {
        id: 9,
        title: 'Mashina o\'yinchoq',
        price: 35000,
        image: '/img/products/toy-car.jpg',
        rating: 4.4,
        reviews: 189,
        slug: 'toy-car'
      },
      {
        id: 10,
        title: 'Qo\'g\'irchoq',
        price: 55000,
        originalPrice: 70000,
        image: '/img/products/doll.jpg',
        rating: 4.7,
        reviews: 156,
        discount: 21,
        slug: 'doll'
      },
      {
        id: 11,
        title: 'Puzzle o\'yin',
        price: 25000,
        image: '/img/products/puzzle.jpg',
        rating: 4.3,
        reviews: 98,
        slug: 'puzzle'
      },
      {
        id: 12,
        title: 'Robot o\'yinchoq',
        price: 85000,
        originalPrice: 100000,
        image: '/img/products/robot.jpg',
        rating: 4.5,
        reviews: 123,
        discount: 15,
        slug: 'robot-toy'
      }
    ];

    const booksProducts = [
      {
        id: 13,
        title: 'Bolalar ertaklari',
        price: 35000,
        originalPrice: 45000,
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        rating: 4.6,
        reviews: 267,
        discount: 22,
        slug: 'fairy-tales'
      },
      {
        id: 14,
        title: 'Matematik kitob',
        price: 25000,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
        rating: 4.4,
        reviews: 145,
        slug: 'math-book'
      },
      {
        id: 15,
        title: 'Ingliz tili',
        price: 40000,
        originalPrice: 50000,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        rating: 4.5,
        reviews: 189,
        discount: 20,
        slug: 'english-book'
      },
      {
        id: 16,
        title: 'Rang berish kitobi',
        price: 15000,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
        rating: 4.3,
        reviews: 234,
        slug: 'coloring-book'
      },
      {
        id: 17,
        title: 'Ensiklopediya',
        price: 65000,
        originalPrice: 80000,
        image: '/img/products/encyclopedia.jpg',
        rating: 4.7,
        reviews: 98,
        discount: 19,
        slug: 'encyclopedia'
      },
      {
        id: 18,
        title: 'Hikoyalar to\'plami',
        price: 30000,
        image: '/img/products/stories.jpg',
        rating: 4.4,
        reviews: 156,
        slug: 'stories'
      }
    ];

    const sportsProducts = [
      {
        id: 19,
        title: 'Bolalar futbol to\'pi',
        price: 35000,
        originalPrice: 45000,
        image: '/img/products/football.jpg',
        rating: 4.5,
        reviews: 123,
        discount: 22,
        slug: 'football'
      },
      {
        id: 20,
        title: 'Velosiped',
        price: 450000,
        originalPrice: 550000,
        image: '/img/products/bicycle.jpg',
        rating: 4.7,
        reviews: 89,
        discount: 18,
        slug: 'bicycle'
      },
      {
        id: 21,
        title: 'Basketbol to\'pi',
        price: 40000,
        image: '/img/products/basketball.jpg',
        rating: 4.3,
        reviews: 67,
        slug: 'basketball'
      },
      {
        id: 22,
        title: 'Suzish uchun aksesuar',
        price: 25000,
        originalPrice: 35000,
        image: '/img/products/swimming.jpg',
        rating: 4.4,
        reviews: 145,
        discount: 29,
        slug: 'swimming-gear'
      },
      {
        id: 23,
        title: 'Tennis raketkasi',
        price: 85000,
        originalPrice: 100000,
        image: '/img/products/tennis.jpg',
        rating: 4.6,
        reviews: 234,
        discount: 15,
        slug: 'tennis-racket'
      },
      {
        id: 24,
        title: 'Roller',
        price: 120000,
        image: '/img/products/roller.jpg',
        rating: 4.2,
        reviews: 178,
        slug: 'roller-skates'
      }
    ];

    const schoolProducts = [
      {
        id: 25,
        title: 'Maktab sumkasi',
        price: 75000,
        originalPrice: 95000,
        image: '/img/products/school-bag.jpg',
        rating: 4.5,
        reviews: 234,
        discount: 21,
        slug: 'school-bag'
      },
      {
        id: 26,
        title: 'Qalam to\'plami',
        price: 25000,
        originalPrice: 35000,
        image: '/img/products/pencil-set.jpg',
        rating: 4.3,
        reviews: 156,
        discount: 29,
        slug: 'pencil-set'
      },
      {
        id: 27,
        title: 'Daftar to\'plami',
        price: 15000,
        image: '/img/products/notebooks.jpg',
        rating: 4.2,
        reviews: 189,
        slug: 'notebooks'
      },
      {
        id: 28,
        title: 'Geometriya to\'plami',
        price: 35000,
        originalPrice: 45000,
        image: '/img/products/geometry-set.jpg',
        rating: 4.4,
        reviews: 98,
        discount: 22,
        slug: 'geometry-set'
      },
      {
        id: 29,
        title: 'Rangli qalamlar',
        price: 45000,
        originalPrice: 60000,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
        rating: 4.6,
        reviews: 267,
        discount: 25,
        slug: 'colored-pencils'
      },
      {
        id: 30,
        title: 'Maktab stoli',
        price: 250000,
        image: '/img/products/school-desk.jpg',
        rating: 4.7,
        reviews: 45,
        slug: 'school-desk'
      }
    ];

    const babyProducts = [
      {
        id: 31,
        title: 'Chaqaloq kiyimi',
        price: 35000,
        originalPrice: 45000,
        image: '/img/products/baby-clothes.jpg',
        rating: 4.6,
        reviews: 189,
        discount: 22,
        slug: 'baby-clothes'
      },
      {
        id: 32,
        title: 'Sutshisha',
        price: 15000,
        originalPrice: 20000,
        image: '/img/products/baby-bottle.jpg',
        rating: 4.4,
        reviews: 234,
        discount: 25,
        slug: 'baby-bottle'
      },
      {
        id: 33,
        title: 'Chaqaloq o\'yinchoq',
        price: 25000,
        image: '/img/products/baby-toy.jpg',
        rating: 4.5,
        reviews: 156,
        slug: 'baby-toy'
      },
      {
        id: 34,
        title: 'Pampers',
        price: 45000,
        originalPrice: 55000,
        image: '/img/products/diapers.jpg',
        rating: 4.7,
        reviews: 345,
        discount: 18,
        slug: 'diapers'
      },
      {
        id: 35,
        title: 'Chaqaloq kravati',
        price: 350000,
        originalPrice: 450000,
        image: '/img/products/baby-crib.jpg',
        rating: 4.8,
        reviews: 67,
        discount: 22,
        slug: 'baby-crib'
      },
      {
        id: 36,
        title: 'Chaqaloq aravachasi',
        price: 450000,
        image: '/img/products/baby-stroller.jpg',
        rating: 4.6,
        reviews: 89,
        slug: 'baby-stroller'
      }
    ];

    const electronicsProducts = [
      {
        id: 37,
        title: 'Bolalar plansheti',
        price: 250000,
        originalPrice: 300000,
        image: '/img/products/kids-tablet.jpg',
        rating: 4.5,
        reviews: 123,
        discount: 17,
        slug: 'kids-tablet'
      },
      {
        id: 38,
        title: 'O\'yin konsoli',
        price: 450000,
        originalPrice: 550000,
        image: '/img/products/game-console.jpg',
        rating: 4.7,
        reviews: 89,
        discount: 18,
        slug: 'game-console'
      },
      {
        id: 39,
        title: 'Bolalar kamerasi',
        price: 85000,
        image: '/img/products/kids-camera.jpg',
        rating: 4.3,
        reviews: 67,
        slug: 'kids-camera'
      },
      {
        id: 40,
        title: 'Musiqa pleyer',
        price: 65000,
        originalPrice: 80000,
        image: '/img/products/music-player.jpg',
        rating: 4.4,
        reviews: 145,
        discount: 19,
        slug: 'music-player'
      },
      {
        id: 41,
        title: 'Bolalar soati',
        price: 120000,
        originalPrice: 150000,
        image: '/img/products/kids-watch.jpg',
        rating: 4.6,
        reviews: 234,
        discount: 20,
        slug: 'kids-watch'
      },
      {
        id: 42,
        title: 'Naushnik',
        price: 45000,
        image: '/img/products/headphones.jpg',
        rating: 4.2,
        reviews: 178,
        slug: 'headphones'
      }
    ];

    const healthProducts = [
      {
        id: 43,
        title: 'Vitamin kompleksi',
        price: 55000,
        originalPrice: 70000,
        image: '/img/products/vitamins.jpg',
        rating: 4.5,
        reviews: 234,
        discount: 21,
        slug: 'vitamins'
      },
      {
        id: 44,
        title: 'Tish cho\'tkasi',
        price: 15000,
        originalPrice: 20000,
        image: '/img/products/toothbrush.jpg',
        rating: 4.3,
        reviews: 156,
        discount: 25,
        slug: 'toothbrush'
      },
      {
        id: 45,
        title: 'Shampu',
        price: 25000,
        image: '/img/products/shampoo.jpg',
        rating: 4.4,
        reviews: 189,
        slug: 'shampoo'
      },
      {
        id: 46,
        title: 'Termometr',
        price: 35000,
        originalPrice: 45000,
        image: '/img/products/thermometer.jpg',
        rating: 4.6,
        reviews: 98,
        discount: 22,
        slug: 'thermometer'
      },
      {
        id: 47,
        title: 'Birinchi yordam to\'plami',
        price: 65000,
        originalPrice: 80000,
        image: '/img/products/first-aid.jpg',
        rating: 4.7,
        reviews: 67,
        discount: 19,
        slug: 'first-aid'
      },
      {
        id: 48,
        title: 'Antiseptik',
        price: 20000,
        image: '/img/products/antiseptic.jpg',
        rating: 4.2,
        reviews: 145,
        slug: 'antiseptic'
      }
    ];

    switch (category) {
      case 'clothing':
        return clothingProducts;
      case 'toys':
        return toysProducts;
      case 'books':
        return booksProducts;
      case 'sports':
        return sportsProducts;
      case 'school':
        return schoolProducts;
      case 'baby':
        return babyProducts;
      case 'electronics':
        return electronicsProducts;
      case 'health':
        return healthProducts;
      default:
        return clothingProducts;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  // Map real product data to display format with safe checks
  const mapRealProduct = (product: any) => {
    try {
      return {
        id: product?.id || Math.random(),
        title: product?.title || 'Mahsulot',
        price: product?.price || 0,
        originalPrice: product?.original_price || product?.originalPrice,
        image: product?.product_image?.[0]?.url ?
          (product.product_image[0].url.startsWith('http') ?
            product.product_image[0].url :
            `http://127.0.0.1:3001${product.product_image[0].url.replace('/uploads//uploads/', '/uploads/')}`) :
          '/img/placeholder-product.jpg',
        rating: 4.5, // Default rating
        reviews: Math.floor(Math.random() * 100) + 10,
        slug: `product-${product?.id || Math.random()}`
      };
    } catch (error) {
      console.error('Error mapping product:', error, product);
      return {
        id: Math.random(),
        title: 'Xatolik',
        price: 0,
        originalPrice: 0,
        image: '/img/placeholder-product.jpg',
        rating: 0,
        reviews: 0,
        slug: 'error-product'
      };
    }
  };

  if (loading) {
    return (
      <section className={styles.productSection}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
            <Link href={viewAllLink} className={styles.viewAll}>
              BARCHASINI KO'RISH
            </Link>
          </div>
          <div className={styles.productsGrid}>
            {[1,2,3,4].map((i) => (
              <div key={i} className={styles.productCard}>
                <div className={styles.imageContainer}>
                  <div className={styles.imagePlaceholder}>
                    <span>Yuklanmoqda...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.productSection}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <Link href={viewAllLink} className={styles.viewAll}>
            BARCHASINI KO'RISH
          </Link>
        </div>

        <div className={styles.productsGrid}>
          {realProducts.map((product) => {
            const mappedProduct = mapRealProduct(product);
            return (
            <Link
              href={`/productdetails/${mappedProduct.id}`}
              key={mappedProduct.id}
              className={styles.productCard}
            >
              <div className={styles.imageContainer}>
                {mappedProduct.image ? (
                  <OptimizedImage
                    src={mappedProduct.image}
                    alt={mappedProduct.title}
                    width={250}
                    height={200}
                    className={styles.productImage}
                    fallbackSrc="/img/placeholder-product.jpg"
                    lazy={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span className={styles.productIcon}>📦</span>
                  </div>
                )}
                {mappedProduct.originalPrice && (
                  <span className={styles.discount}>
                    {Math.round(((mappedProduct.originalPrice - mappedProduct.price) / mappedProduct.originalPrice) * 100)}% off
                  </span>
                )}
              </div>
              
              <div className={styles.content}>
                <h3 className={styles.productTitle}>
                  {typeof mappedProduct.title === 'string' ? mappedProduct.title : 'Mahsulot'}
                </h3>

                <div className={styles.priceContainer}>
                  <span className={styles.currentPrice}>{formatPrice(mappedProduct.price)}</span>
                  {mappedProduct.originalPrice && (
                    <span className={styles.originalPrice}>{formatPrice(mappedProduct.originalPrice)}</span>
                  )}
                </div>

                {mappedProduct.rating && (
                  <div className={styles.rating}>
                    <span className={styles.ratingValue}>{mappedProduct.rating}</span>
                    <span className={styles.star}>★</span>
                  </div>
                )}
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
