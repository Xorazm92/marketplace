import React from 'react';
import { GetStaticProps } from 'next/types';
import Layout from '../../layout';
import SEOHead from '../../components/seo/SEOHead';
import FAQ from '../../components/faq/FAQ';
import { FAQ_DATA, getAllFAQ } from '../../data/faq';
import { FAQItem } from '../../components/faq/FAQ';
import { generateFAQStructuredData } from '../../utils/structured-data';
import styles from './FAQPage.module.scss';

interface FAQPageProps {
  allFAQItems: FAQItem[];
  categories: string[];
}

const FAQPage: React.FC<FAQPageProps> = ({ allFAQItems, categories }) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredItems = selectedCategory === 'all' 
    ? allFAQItems 
    : allFAQItems.filter(item => item.category === selectedCategory);

  const structuredData = generateFAQStructuredData(filteredItems);

  return (
    <Layout
      title="Tez-tez so'raladigan savollar - INBOLA"
      description="INBOLA Kids Marketplace bo'yicha eng ko'p so'raladigan savollar va javoblar. To'lov, yetkazib berish, qaytarish va boshqa muhim ma'lumotlar."
      keywords="FAQ, savol javob, INBOLA yordam, to'lov usullari, yetkazib berish, qaytarish"
    >
      <SEOHead
        title="Tez-tez so'raladigan savollar"
        description="INBOLA Kids Marketplace bo'yicha eng ko'p so'raladigan savollar va javoblar. To'lov, yetkazib berish, qaytarish va boshqa muhim ma'lumotlar."
        keywords="FAQ, savol javob, INBOLA yordam, to'lov usullari, yetkazib berish, qaytarish"
        structuredData={structuredData}
        canonicalUrl="https://inbola.uz/faq"
      />

      <div className={styles.faqPage}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className="container">
            <div className={styles.headerContent}>
              <h1 className={styles.title}>Tez-tez so'raladigan savollar</h1>
              <p className={styles.subtitle}>
                INBOLA Kids Marketplace bo'yicha eng muhim savollar va javoblarni toping
              </p>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Categories Filter */}
          <div className={styles.categoriesFilter}>
            <div className={styles.filterHeader}>
              <h2 className={styles.filterTitle}>Kategoriyalar bo'yicha filtrlash</h2>
            </div>
            <div className={styles.categoryButtons}>
              <button
                className={`${styles.categoryButton} ${selectedCategory === 'all' ? styles.active : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Barcha savollar ({allFAQItems.length})
              </button>
              {categories.map((category) => {
                const categoryItems = allFAQItems.filter(item => item.category === category);
                const categoryName = getCategoryName(category);
                
                return (
                  <button
                    key={category}
                    className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {categoryName} ({categoryItems.length})
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ Component */}
          <div className={styles.faqSection}>
            <FAQ
              items={filteredItems}
              title={selectedCategory === 'all' ? 'Barcha savollar' : getCategoryName(selectedCategory)}
              showSearch={true}
              language="uz"
              className={styles.faqComponent}
            />
          </div>

          {/* Contact Support */}
          <div className={styles.supportSection}>
            <div className={styles.supportCard}>
              <h3 className={styles.supportTitle}>Javobingizni topa olmadingizmi?</h3>
              <p className={styles.supportText}>
                Bizning mijozlar xizmati jamoasi sizga yordam berishga tayyor
              </p>
              <div className={styles.contactOptions}>
                <a 
                  href="tel:+998711234567" 
                  className={`${styles.contactButton} ${styles.phone}`}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  +998 71 123-45-67
                </a>
                <a 
                  href="https://t.me/inbola_support" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`${styles.contactButton} ${styles.telegram}`}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  Telegram
                </a>
                <a 
                  href="mailto:support@inbola.uz"
                  className={`${styles.contactButton} ${styles.email}`}
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  support@inbola.uz
                </a>
              </div>
              <div className={styles.workingHours}>
                <p>Ish vaqti: 9:00 - 20:00 (dushanba - yakshanba)</p>
              </div>
            </div>
          </div>

          {/* Popular Topics */}
          <div className={styles.popularTopics}>
            <h3 className={styles.topicsTitle}>Mashhur mavzular</h3>
            <div className={styles.topicsGrid}>
              <div className={styles.topicCard}>
                <h4 className={styles.topicTitle}>To'lov usullari</h4>
                <p className={styles.topicDescription}>
                  Uzcard, Humo, Payme, Click va xalqaro kartalar orqali to'lov
                </p>
                <button 
                  className={styles.topicButton}
                  onClick={() => setSelectedCategory('general')}
                >
                  Batafsil →
                </button>
              </div>
              
              <div className={styles.topicCard}>
                <h4 className={styles.topicTitle}>Yetkazib berish</h4>
                <p className={styles.topicDescription}>
                  Toshkent va viloyatlarga tez va xavfsiz yetkazib berish
                </p>
                <button 
                  className={styles.topicButton}
                  onClick={() => setSelectedCategory('general')}
                >
                  Batafsil →
                </button>
              </div>
              
              <div className={styles.topicCard}>
                <h4 className={styles.topicTitle}>Mahsulot xavfsizligi</h4>
                <p className={styles.topicDescription}>
                  Sertifikatlangan va xavfsiz bolalar mahsulotlari
                </p>
                <button 
                  className={styles.topicButton}
                  onClick={() => setSelectedCategory('toys')}
                >
                  Batafsil →
                </button>
              </div>
              
              <div className={styles.topicCard}>
                <h4 className={styles.topicTitle}>Qaytarish va almashtirish</h4>
                <p className={styles.topicDescription}>
                  30 kunlik kafolat va oson qaytarish jarayoni
                </p>
                <button 
                  className={styles.topicButton}
                  onClick={() => setSelectedCategory('general')}
                >
                  Batafsil →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Helper function to get category display name
function getCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    toys: "O'yinchoqlar",
    books: "Kitoblar", 
    education: "Ta'lim",
    general: "Umumiy savollar"
  };
  return categoryNames[category] || category;
}

export const getStaticProps: GetStaticProps = async () => {
  const allFAQItems = getAllFAQ();
  const categories = [...new Set(allFAQItems.map(item => item.category))];

  return {
    props: {
      allFAQItems,
      categories,
    },
    revalidate: 3600, // Revalidate every hour
  };
};

export default FAQPage;