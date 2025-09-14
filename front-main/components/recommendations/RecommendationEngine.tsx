import React, { useState, useEffect } from 'react';
import { MdTrendingUp, MdHistory, MdPersonalize, MdStar, MdFavorite, MdShoppingCart } from 'react-icons/md';
import RelatedProductsCarousel, { Product } from '../product/RelatedProductsCarousel';
import { TrustBadge } from '../common/TrustBadges';
import styles from './RecommendationEngine.module.scss';

interface RecommendationEngineProps {
  userId?: string;
  currentProductId?: string;
  categoryId?: string;
  viewHistory?: string[];
  wishlist?: string[];
  recommendations?: {
    trending: Product[];
    personalized: Product[];
    recentlyViewed: Product[];
    similarProducts: Product[];
    frequentlyBoughtTogether: Product[];
    recommendedForYou: Product[];
  };
  onProductClick: (productId: number) => void;
  onAddToCart: (productId: number) => void;
  onToggleWishlist: (productId: number) => void;
  className?: string;
}

const RecommendationEngine: React.FC<RecommendationEngineProps> = ({
  userId,
  currentProductId,
  categoryId,
  viewHistory = [],
  wishlist = [],
  recommendations = {
    trending: [],
    personalized: [],
    recentlyViewed: [],
    similarProducts: [],
    frequentlyBoughtTogether: [],
    recommendedForYou: []
  },
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  className = ''
}) => {
  const [activeSection, setActiveSection] = useState<string>('trending');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration
  const mockTrendingProducts: Product[] = [
    {
      id: 1,
      title: "LEGO Creator 3-in-1 Deep Sea Creatures",
      price: 899000,
      originalPrice: 1200000,
      discount: 25,
      rating: 4.8,
      reviewCount: 156,
      images: ["/img/lego-sea-creatures.jpg"],
      seller: {
        name: "LEGO Store Uzbekistan",
        isVerified: true,
        rating: 4.9
      },
      badges: ['parent-approved', 'educational', 'bestseller'],
      category: "Constructor",
      isInWishlist: false,
      inStock: true
    },
    {
      id: 2,
      title: "Hot Wheels Track Builder Unlimited",
      price: 650000,
      rating: 4.6,
      reviewCount: 89,
      images: ["/img/hot-wheels-track.jpg"],
      seller: {
        name: "Mattel Official",
        isVerified: true,
        rating: 4.7
      },
      badges: ['parent-approved', 'bestseller'],
      category: "Toys",
      isInWishlist: true,
      inStock: true
    },
    {
      id: 3,
      title: "Barbie Dreamhouse Adventures",
      price: 1250000,
      originalPrice: 1500000,
      discount: 17,
      rating: 4.9,
      reviewCount: 234,
      images: ["/img/barbie-dreamhouse.jpg"],
      seller: {
        name: "Barbie Official Store",
        isVerified: true,
        rating: 4.8
      },
      badges: ['parent-approved', 'educational'],
      category: "Dolls",
      isInWishlist: false,
      inStock: true
    },
    {
      id: 4,
      title: "Melissa & Doug Wooden Puzzle Set",
      price: 320000,
      rating: 4.7,
      reviewCount: 67,
      images: ["/img/wooden-puzzle.jpg"],
      seller: {
        name: "Melissa & Doug",
        isVerified: true,
        rating: 4.9
      },
      badges: ['parent-approved', 'educational', 'eco-friendly'],
      category: "Educational",
      isInWishlist: false,
      inStock: true
    }
  ];

  const mockPersonalizedProducts: Product[] = [
    {
      id: 5,
      title: "National Geographic Break Open 10 Geodes Kit",
      price: 450000,
      rating: 4.5,
      reviewCount: 78,
      images: ["/img/geodes-kit.jpg"],
      seller: {
        name: "National Geographic Kids",
        isVerified: true,
        rating: 4.6
      },
      badges: ['educational', 'parent-approved'],
      category: "Science",
      isInWishlist: false,
      inStock: true
    },
    {
      id: 6,
      title: "Crayola Light-up Tracing Pad",
      price: 280000,
      rating: 4.4,
      reviewCount: 45,
      images: ["/img/crayola-tracing.jpg"],
      seller: {
        name: "Crayola Store",
        isVerified: true,
        rating: 4.5
      },
      badges: ['educational', 'parent-approved'],
      category: "Art",
      isInWishlist: true,
      inStock: true
    }
  ];

  const mockRecentlyViewed: Product[] = [
    {
      id: 7,
      title: "Fisher-Price Laugh & Learn Smart Phone",
      price: 180000,
      rating: 4.3,
      reviewCount: 92,
      images: ["/img/fisher-price-phone.jpg"],
      seller: {
        name: "Fisher-Price Official",
        isVerified: true,
        rating: 4.7
      },
      badges: ['parent-approved', 'educational'],
      category: "Educational",
      isInWishlist: false,
      inStock: true
    }
  ];

  const getRecommendationSections = () => {
    const sections = [];

    // Trending Products (always show)
    if (recommendations.trending.length > 0 || mockTrendingProducts.length > 0) {
      sections.push({
        id: 'trending',
        title: 'Mashhur mahsulotlar',
        subtitle: 'Bu hafta eng ko\'p sotilgan mahsulotlar',
        icon: MdTrendingUp,
        products: recommendations.trending.length > 0 ? recommendations.trending : mockTrendingProducts,
        autoPlay: true
      });
    }

    // Personalized Recommendations (for logged-in users)
    if (userId && (recommendations.personalized.length > 0 || mockPersonalizedProducts.length > 0)) {
      sections.push({
        id: 'personalized',
        title: 'Siz uchun tavsiya etamiz',
        subtitle: 'Sizning qiziqishlaringiz asosida tanlangan',
        icon: MdPersonalize,
        products: recommendations.personalized.length > 0 ? recommendations.personalized : mockPersonalizedProducts,
        autoPlay: false
      });
    }

    // Recently Viewed (for users with history)
    if (viewHistory.length > 0 && (recommendations.recentlyViewed.length > 0 || mockRecentlyViewed.length > 0)) {
      sections.push({
        id: 'recently-viewed',
        title: 'Yaqinda ko\'rilgan',
        subtitle: 'Siz ko\'rgan mahsulotlar',
        icon: MdHistory,
        products: recommendations.recentlyViewed.length > 0 ? recommendations.recentlyViewed : mockRecentlyViewed,
        autoPlay: false
      });
    }

    // Similar Products (on product pages)
    if (currentProductId && recommendations.similarProducts.length > 0) {
      sections.push({
        id: 'similar',
        title: 'O\'xshash mahsulotlar',
        subtitle: 'Bu mahsulotga o\'xshash boshqa variantlar',
        icon: MdStar,
        products: recommendations.similarProducts,
        autoPlay: false
      });
    }

    // Frequently Bought Together
    if (currentProductId && recommendations.frequentlyBoughtTogether.length > 0) {
      sections.push({
        id: 'bought-together',
        title: 'Ko\'pincha birga sotib olinadi',
        subtitle: 'Bu mahsulot bilan birga tez-tez sotib olinadigan mahsulotlar',
        icon: MdShoppingCart,
        products: recommendations.frequentlyBoughtTogether,
        autoPlay: false
      });
    }

    return sections;
  };

  const sections = getRecommendationSections();

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className={`${styles.recommendationEngine} ${className}`}>
      {sections.map((section) => (
        <div key={section.id} className={styles.recommendationSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionInfo}>
              <div className={styles.sectionTitleContainer}>
                <section.icon className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>{section.title}</h2>
              </div>
              <p className={styles.sectionSubtitle}>{section.subtitle}</p>
            </div>
            
            {/* Trust Indicators */}
            <div className={styles.trustIndicators}>
              <TrustBadge type="parent-approved" size="sm" showText={false} />
              <span className={styles.trustText}>Xavfsiz xarid</span>
            </div>
          </div>

          <RelatedProductsCarousel
            title=""
            products={section.products}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            autoPlay={section.autoPlay}
            showControls={true}
            itemsPerView={{
              mobile: 1,
              tablet: 2,
              desktop: section.id === 'trending' ? 5 : 4
            }}
            className={styles.carousel}
          />

          {/* Section-specific features */}
          {section.id === 'trending' && (
            <div className={styles.trendingStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>2.5k+</span>
                <span className={styles.statLabel}>Bu hafta sotilgan</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>4.8★</span>
                <span className={styles.statLabel}>O'rtacha reyting</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>98%</span>
                <span className={styles.statLabel}>Mamnun mijozlar</span>
              </div>
            </div>
          )}

          {section.id === 'personalized' && userId && (
            <div className={styles.personalizationInfo}>
              <div className={styles.infoCard}>
                <MdPersonalize className={styles.infoIcon} />
                <div className={styles.infoContent}>
                  <h4>Shaxsiylashtirilgan tavsiyalar</h4>
                  <p>Bu mahsulotlar sizning oldingi xaridlaringiz va qiziqishlaringiz asosida tanlangan</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Recommendation Insights */}
      {userId && (
        <div className={styles.recommendationInsights}>
          <h3>Sizning qiziqishlaringiz</h3>
          <div className={styles.insightsGrid}>
            <div className={styles.insightCard}>
              <h4>Eng ko'p qaragan kategoriya</h4>
              <p>Ta'limiy o'yinchoqlar</p>
              <div className={styles.insightBar}>
                <div className={styles.insightProgress} style={{ width: '75%' }}></div>
              </div>
            </div>
            <div className={styles.insightCard}>
              <h4>O'rtacha xarid narxi</h4>
              <p>650,000 so'm</p>
              <div className={styles.insightTrend}>📈 +15% o'tgan oyga nisbatan</div>
            </div>
            <div className={styles.insightCard}>
              <h4>Sevimli brendlar</h4>
              <div className={styles.brandList}>
                <span>LEGO</span>
                <span>Fisher-Price</span>
                <span>Melissa & Doug</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h3>Yangi mahsulotlardan xabardor bo'ling!</h3>
          <p>Eng yangi va qiziqarli mahsulotlar haqida birinchilardan bo'lib bilib oling</p>
          <button className={styles.ctaButton}>
            <MdTrendingUp />
            Obuna bo'lish
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationEngine;