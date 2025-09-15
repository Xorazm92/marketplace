import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface StructuredDataProps {
  type: 'product' | 'seller' | 'article' | 'website' | 'faq' | 'howto';
  data?: any;
  breadcrumbs?: Array<{ name: string; url: string }>;
  includeBreadcrumbs?: boolean;
  includeWebsite?: boolean;
  includeLocalBusiness?: boolean;
}

interface Article {
  title: string;
  description: string;
  content: string;
  image?: string;
  readingTime?: number;
}

interface Product {
  name: string;
  description: string;
  price: number;
  rating?: {
    value: number;
    count: number;
    bestRating?: number;
    worstRating?: number;
  };
  image?: string;
  url?: string;
}

interface Seller {
  name: string;
  description: string;
  rating?: number;
}

const StructuredData: React.FC<StructuredDataProps> = ({
  type,
  data,
  breadcrumbs,
  includeBreadcrumbs = true,
  includeWebsite = false,
  includeLocalBusiness = false
}) => {
  const pathname = usePathname();
  
  // Generate basic website schema
  const generateWebsiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'INBOLA Kids Marketplace',
    url: process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz',
    description: 'Bolalar uchun xavfsiz va sifatli mahsulotlar marketi'
  });

  // Generate basic product schema
  const generateProductSchema = (product: Product) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'UZS'
    }
  });

  // Generate basic article schema
  const generateArticleSchema = (article: Article) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description
  });

  // Generate primary structured data based on type
  const generatePrimarySchema = () => {
    switch (type) {
      case 'product':
        return data ? generateProductSchema(data as Product) : null;
      case 'article':
        return data ? generateArticleSchema(data as Article) : null;
      case 'website':
        return generateWebsiteSchema();
      case 'faq':
        return generateFAQSchema();
      default:
        return null;
    }
  };

  const primarySchema = generatePrimarySchema();
  
  return (
    <Head>
      {primarySchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(primarySchema, null, 0)
          }}
        />
      )}
      
      {pathname === '/faq' && type !== 'faq' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(), null, 0)
          }}
        />
      )}
    </Head>
  );
};

// Helper function to generate FAQ schema
function generateFAQSchema() {
  const faqs = [
    {
      question: "INBOLA Kids Marketplace nima?",
      answer: "INBOLA - bu bolalar va ota-onalar uchun xavfsiz va sifatli mahsulotlar sotib oladigan onlayn platformadir."
    },
    {
      question: "Qanday to'lov usullari mavjud?",
      answer: "Bizda UzCard, Humo, Payme, Click, Uzum va xalqaro kartalar orqali to'lov qilish mumkin."
    },
    {
      question: "Yetkazib berish qancha vaqt oladi?",
      answer: "Toshkent bo'ylab 1-2 kun, O'zbekiston bo'ylab 2-5 kun ichida yetkazib beramiz."
    }
  ];
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// Helper function to generate Review schema
function generateReviewSchema(product: Product) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  if (!product.rating) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    itemReviewed: {
      '@type': 'Product',
      name: product.name,
      image: product.image,
      url: `${baseUrl}${product.url}`
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: product.rating.value,
      bestRating: product.rating.bestRating || 5,
      worstRating: product.rating.worstRating || 1
    },
    author: {
      '@type': 'Organization',
      name: 'INBOLA Customers'
    },
    reviewBody: `Mijozlar tomonidan ${product.rating.value} ball bilan baholangan mahsulot.`,
    reviewCount: product.rating.count
  };
}

export default StructuredData;