import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  generateProductSchema,
  generateSellerSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateWebsiteSchema,
  generateLocalBusinessSchema,
  Product,
  Seller,
  Article
} from '../../utils/structured-data';
import { generateBreadcrumbs } from '../../utils/seo';

interface StructuredDataProps {
  type: 'website' | 'product' | 'seller' | 'article' | 'local-business' | 'breadcrumb';
  data?: Product | Seller | Article | any;
  breadcrumbs?: Array<{name: string; url: string}>;
  includeBreadcrumbs?: boolean;
  includeWebsite?: boolean;
  includeLocalBusiness?: boolean;
}

const StructuredData: React.FC<StructuredDataProps> = ({
  type,
  data,
  breadcrumbs,
  includeBreadcrumbs = true,
  includeWebsite = false,
  includeLocalBusiness = false
}) => {
  const router = useRouter();
  
  // Generate primary structured data based on type
  const generatePrimarySchema = () => {
    switch (type) {
      case 'product':
        return data ? generateProductSchema(data as Product) : null;
      case 'seller':
        return data ? generateSellerSchema(data as Seller) : null;
      case 'article':
        return data ? generateArticleSchema(data as Article) : null;
      case 'website':
        return generateWebsiteSchema();
      case 'local-business':
        return generateLocalBusinessSchema();
      default:
        return null;
    }
  };
  
  // Generate breadcrumb schema
  const generateBreadcrumbData = () => {
    if (!includeBreadcrumbs) return null;
    
    const crumbs = breadcrumbs || generateBreadcrumbs(router.asPath);
    return generateBreadcrumbSchema(crumbs);
  };
  
  // Generate additional schemas
  const generateAdditionalSchemas = () => {
    const schemas = [];
    
    if (includeWebsite && type !== 'website') {
      schemas.push(generateWebsiteSchema());
    }
    
    if (includeLocalBusiness && type !== 'local-business') {
      schemas.push(generateLocalBusinessSchema());
    }
    
    return schemas;
  };
  
  const primarySchema = generatePrimarySchema();
  const breadcrumbSchema = generateBreadcrumbData();
  const additionalSchemas = generateAdditionalSchemas();
  
  return (
    <Head>
      {/* Primary Schema */}
      {primarySchema && (
        <script
          type=\"application/ld+json\"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(primarySchema, null, 0)
          }}
        />
      )}
      
      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script
          type=\"application/ld+json\"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema, null, 0)
          }}
        />
      )}
      
      {/* Additional Schemas */}
      {additionalSchemas.map((schema, index) => (
        <script
          key={`additional-schema-${index}`}
          type=\"application/ld+json\"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0)
          }}
        />
      ))}
      
      {/* FAQ Schema for specific pages */}
      {router.pathname === '/faq' && (
        <script
          type=\"application/ld+json\"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFAQSchema(), null, 0)
          }}
        />
      )}
      
      {/* How-to Schema for educational content */}
      {type === 'article' && data && isHowToArticle(data as Article) && (
        <script
          type=\"application/ld+json\"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateHowToSchema(data as Article), null, 0)
          }}
        />
      )}
      
      {/* Review Schema for product pages with reviews */}
      {type === 'product' && data && (data as Product).rating && (
        <script
          type=\"application/ld+json\"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateReviewSchema(data as Product), null, 0)
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
      question: \"INBOLA Kids Marketplace nima?\",
      answer: \"INBOLA - bu bolalar va ota-onalar uchun xavfsiz va sifatli mahsulotlar sotib oladigan onlayn platformadir. Biz faqat tekshirilgan va xavfsiz mahsulotlarni taklif etamiz.\"
    },
    {
      question: \"Qanday to'lov usullari mavjud?\",
      answer: \"Bizda UzCard, Humo, Payme, Click, Uzum va xalqaro kartalar (Visa, Mastercard) orqali to'lov qilish mumkin. Barcha to'lovlar SSL shifrlash bilan himoyalangan.\"
    },
    {
      question: \"Yetkazib berish qancha vaqt oladi?\",
      answer: \"Toshkent bo'ylab 1-2 kun, O'zbekiston bo'ylab 2-5 kun ichida yetkazib beramiz. Tezkor yetkazib berish xizmati ham mavjud.\"
    },
    {
      question: \"Mahsulotlar xavfsiymi?\",
      answer: \"Ha, barcha mahsulotlarimiz xalqaro xavfsizlik standartlariga javob beradi va bolalar uchun mutlaqo xavfsizdir. Har bir mahsulot alohida tekshiriladi.\"
    },
    {
      question: \"Qaytarish siyosati qanday?\",
      answer: \"Mahsulot olganingizdan keyin 14 kun ichida qaytarish mumkin. Mahsulot original holatda bo'lishi kerak.\"
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

// Helper function to check if article is a how-to guide
function isHowToArticle(article: Article): boolean {
  const howToKeywords = ['how to', 'qanday', 'как', 'step by step', 'guide', 'yo\\'riqnoma'];
  const title = article.title.toLowerCase();
  return howToKeywords.some(keyword => title.includes(keyword));
}

// Helper function to generate How-to schema
function generateHowToSchema(article: Article) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  // Extract steps from content (simplified)
  const steps = extractStepsFromContent(article.content);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: article.title,
    description: article.description,
    image: article.image,
    totalTime: article.readingTime ? `PT${article.readingTime}M` : 'PT10M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'UZS',
      value: '0'
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'INBOLA mahsulotlari'
      }
    ],
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description
    }))
  };
}

// Helper function to extract steps from content
function extractStepsFromContent(content: string) {
  // Simplified step extraction
  return [
    {
      title: \"1-qadam: Mahsulotni tanlash\",
      description: \"Bolangiz uchun mos mahsulotni tanlang\"
    },
    {
      title: \"2-qadam: Xavfsizlikni tekshirish\",
      description: \"Mahsulot xavfsizlik reytingini ko'rib chiqing\"
    },
    {
      title: \"3-qadam: Buyurtma berish\",
      description: \"Savatga qo'shing va buyurtma bering\"
    }
  ];
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