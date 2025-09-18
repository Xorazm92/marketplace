import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiHeart, FiStar, FiShoppingCart, FiEye, FiArrowRight } from 'react-icons/fi';
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import styles from './FeaturedProducts.module.scss';
import { getAllProducts } from '../../endpoints/product';

interface Product {
  id: number;
  title: string;
  price: number;
  slug: string;
  product_image: Array<{ url: string }>;
  brand: { name: string };
  category: { name: string };
  reviews: Array<{ rating: number }>;
  view_count: number;
  like_count: number;
}

const FeaturedProducts: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'top' | 'new'>('all');
  const [displayCount, setDisplayCount] = useState(6);

  useEffect(() => {
    loadFeaturedProducts();
  }, [filter]);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();
      if (response && Array.isArray(response) && response.length > 0) {
        // Filter and sort products based on filter
        let filteredProducts = response;

        if (filter === 'top') {
          filteredProducts = response.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        } else if (filter === 'new') {
          filteredProducts = response.sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
        }

        setAllProducts(filteredProducts);
        setProducts(filteredProducts.slice(0, 6));
      } else {
        console.warn('No products received from API, using demo products');
        // Demo products for fallback
        const demoProducts = [
          {
            id: 1,
            title: "Bolalar uchun yumshoq o'yinchoq ayiq",
            price: 150000,
            slug: "yumshoq-oyinchoq-ayiq",
            product_image: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop" }],
            brand: { name: "ToyLand" },
            category: { name: "O'yinchoqlar" },
            reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
            view_count: 245,
            like_count: 32
          },
          {
            id: 2,
            title: "Bolalar kiyimi - rangli ko'ylak",
            price: 85000,
            slug: "bolalar-koylagi",
            product_image: [{ url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=300&fit=crop" }],
            brand: { name: "KidsWear" },
            category: { name: "Kiyimlar" },
            reviews: [{ rating: 4 }, { rating: 5 }, { rating: 4 }],
            view_count: 189,
            like_count: 28
          },
          {
            id: 3,
            title: "Ta'limiy kitob - Alifbo",
            price: 45000,
            slug: "talimiy-kitob-alifbo",
            product_image: [{ url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop" }],
            brand: { name: "EduBooks" },
            category: { name: "Kitoblar" },
            reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }],
            view_count: 156,
            like_count: 41
          },
          {
            id: 4,
            title: "Ijodiy to'plam - Ranglar",
            price: 120000,
            slug: "ijodiy-toplam-ranglar",
            product_image: [{ url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop" }],
            brand: { name: "ArtKids" },
            category: { name: "Ijodiy" },
            reviews: [{ rating: 4 }, { rating: 4 }, { rating: 5 }],
            view_count: 203,
            like_count: 35
          },
          {
            id: 5,
            title: "Sport to'pi - futbol",
            price: 75000,
            slug: "sport-topi-futbol",
            product_image: [{ url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop" }],
            brand: { name: "SportKids" },
            category: { name: "Sport" },
            reviews: [{ rating: 5 }, { rating: 4 }],
            view_count: 134,
            like_count: 22
          },
          {
            id: 6,
            title: "Maktab sumkasi - rangli",
            price: 95000,
            slug: "maktab-sumkasi",
            product_image: [{ url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop" }],
            brand: { name: "SchoolBag" },
            category: { name: "Maktab" },
            reviews: [{ rating: 4 }, { rating: 5 }, { rating: 4 }],
            view_count: 178,
            like_count: 29
          },
          {
            id: 7,
            title: "Bolalar velosipedi - qizil",
            price: 450000,
            slug: "bolalar-velosipedi",
            product_image: [{ url: "https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=300&h=300&fit=crop" }],
            brand: { name: "BikeKids" },
            category: { name: "Sport" },
            reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }],
            view_count: 312,
            like_count: 45
          },
          {
            id: 8,
            title: "Puzzle o'yini - hayvonlar",
            price: 65000,
            slug: "puzzle-hayvonlar",
            product_image: [{ url: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=300&fit=crop" }],
            brand: { name: "PuzzleWorld" },
            category: { name: "O'yinlar" },
            reviews: [{ rating: 4 }, { rating: 4 }, { rating: 5 }],
            view_count: 198,
            like_count: 33
          },
          {
            id: 9,
            title: "Chiroyli ko'ylak - pushti",
            price: 120000,
            slug: "chiroyli-koylak",
            product_image: [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop" }],
            brand: { name: "FashionKids" },
            category: { name: "Kiyimlar" },
            reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
            view_count: 267,
            like_count: 38
          },
          {
            id: 10,
            title: "Musiqa asboblari to'plami",
            price: 180000,
            slug: "musiqa-asboblari",
            product_image: [{ url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" }],
            brand: { name: "MusicToys" },
            category: { name: "Musiqa" },
            reviews: [{ rating: 4 }, { rating: 5 }, { rating: 4 }],
            view_count: 234,
            like_count: 41
          },
          {
            id: 11,
            title: "Rasm chizish to'plami",
            price: 85000,
            slug: "rasm-chizish-toplami",
            product_image: [{ url: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=300&fit=crop" }],
            brand: { name: "ArtSupply" },
            category: { name: "Ijodiy" },
            reviews: [{ rating: 5 }, { rating: 4 }, { rating: 4 }],
            view_count: 156,
            like_count: 27
          },
          {
            id: 12,
            title: "Bolalar shlyapasi - qishki",
            price: 55000,
            slug: "bolalar-shlyapasi",
            product_image: [{ url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop" }],
            brand: { name: "WinterWear" },
            category: { name: "Kiyimlar" },
            reviews: [{ rating: 4 }, { rating: 4 }, { rating: 5 }],
            view_count: 143,
            like_count: 22
          },
          {
            id: 13,
            title: "Elektron o'yinchoq robot",
            price: 320000,
            slug: "elektron-robot",
            product_image: [{ url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=300&fit=crop" }],
            brand: { name: "TechToys" },
            category: { name: "Elektronika" },
            reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }],
            view_count: 389,
            like_count: 56
          },
          {
            id: 14,
            title: "Bolalar poyabzali - sport",
            price: 180000,
            slug: "bolalar-poyabzali",
            product_image: [{ url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop" }],
            brand: { name: "SportShoes" },
            category: { name: "Poyabzal" },
            reviews: [{ rating: 4 }, { rating: 5 }, { rating: 4 }],
            view_count: 278,
            like_count: 42
          },
          {
            id: 15,
            title: "Bolalar soati - rangli",
            price: 95000,
            slug: "bolalar-soati",
            product_image: [{ url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=300&h=300&fit=crop" }],
            brand: { name: "TimeKids" },
            category: { name: "Aksessuarlar" },
            reviews: [{ rating: 4 }, { rating: 4 }, { rating: 5 }],
            view_count: 167,
            like_count: 29
          },
          {
            id: 16,
            title: "Konstruktor to'plami - katta",
            price: 250000,
            slug: "konstruktor-toplami",
            product_image: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop" }],
            brand: { name: "BuildToys" },
            category: { name: "Konstruktor" },
            reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
            view_count: 298,
            like_count: 47
          },
          {
            id: 17,
            title: "Bolalar daftari - chiroyli",
            price: 25000,
            slug: "bolalar-daftari",
            product_image: [{ url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=300&fit=crop" }],
            brand: { name: "SchoolSupply" },
            category: { name: "Maktab" },
            reviews: [{ rating: 4 }, { rating: 4 }, { rating: 4 }],
            view_count: 124,
            like_count: 18
          },
          {
            id: 18,
            title: "Yumshoq o'yinchoq - qo'zi",
            price: 135000,
            slug: "yumshoq-qozi",
            product_image: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop" }],
            brand: { name: "SoftToys" },
            category: { name: "O'yinchoqlar" },
            reviews: [{ rating: 5 }, { rating: 5 }, { rating: 4 }],
            view_count: 245,
            like_count: 39
          }
        ];
        setAllProducts(demoProducts);
        setProducts(demoProducts.slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Use demo products on error
      const demoProducts = [
        {
          id: 1,
          title: "Demo mahsulot 1",
          price: 100000,
          slug: "demo-1",
          product_image: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop" }],
          brand: { name: "Demo Brand" },
          category: { name: "Demo" },
          reviews: [{ rating: 5 }],
          view_count: 100,
          like_count: 10
        }
      ];
      setAllProducts(demoProducts);
      setProducts(demoProducts.slice(0, 6));
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId })
      });

      if (response.ok) {
        // Update UI to show added to wishlist
        if (process.env.NODE_ENV === "development") console.log('Added to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });

      if (response.ok) {
        // Update UI to show added to cart
        if (process.env.NODE_ENV === "development") console.log('Added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const calculateAverageRating = (reviews: Array<{ rating: number }> | undefined) => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const loadMoreProducts = () => {
    setLoadingMore(true);
    const newDisplayCount = displayCount + 6;
    setDisplayCount(newDisplayCount);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      setProducts(allProducts.slice(0, newDisplayCount));
      setLoadingMore(false);
    }, 500);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? styles.starFilled : styles.starEmpty}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <section className={styles.featured}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Mahsulotlar yuklanmoqda...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.featured}>
      <div className={styles.container}>
        {/* Section Header - Etsy Style */}
        <div className={styles.header}>
          <h2>Tavsiya etilgan mahsulotlar</h2>
        </div>


        {/* Products Grid */}
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <Link href={`/product/${product.slug}`} className={styles.productLink}>
                <div className={styles.productImageContainer}>
                  <img
                    src={
                      product.product_image[0]?.url
                        ? (product.product_image[0].url.startsWith('http')
                            ? product.product_image[0].url
                            : `http://127.0.0.1:4001${product.product_image[0].url.replace('/uploads//uploads/', '/uploads/')}`)
                        : '/img/placeholder-product.jpg'
                    }
                    alt={product.title}
                    className={styles.productImage}
                  />
                  <button
                    className={styles.wishlistBtn}
                    onClick={(e) => {
                      e.preventDefault();
                      addToWishlist(product.id);
                    }}
                  >
                    <MdFavoriteBorder className={styles.heartIcon} />
                  </button>
                </div>

                <div className={styles.productInfo}>
                  <div className={styles.shopName}>{product.brand.name}</div>
                  <h3 className={styles.productTitle}>{product.title}</h3>

                  <div className={styles.rating}>
                    <div className={styles.stars}>
                      {renderStars(Math.round(calculateAverageRating(product.reviews)))}
                    </div>
                    <span className={styles.reviewCount}>
                      ({product.reviews?.length || 0})
                    </span>
                  </div>

                  <div className={styles.priceContainer}>
                    <span className={styles.currency}>UZS</span>
                    <span className={styles.price}>{Number(product.price).toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Load More / View All */}
        <div className={styles.viewMore}>
          {products.length < allProducts.length ? (
            <button 
              onClick={loadMoreProducts}
              disabled={loadingMore}
              className={styles.loadMoreBtn}
            >
              {loadingMore ? (
                <>
                  <div className={styles.miniSpinner}></div>
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  Yanada ko'proq ko'rish ({allProducts.length - products.length} ta qoldi)
                  <FiArrowRight className={styles.arrowIcon} />
                </>
              )}
            </button>
          ) : (
            <Link href="/products" className={styles.viewMoreBtn}>
              Barcha mahsulotlarni ko'rish
              <FiArrowRight className={styles.arrowIcon} />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
