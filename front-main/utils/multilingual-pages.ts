/**
 * Multilingual pages configuration for Next.js
 * Supporting Uzbek, Russian, and English versions
 */

import { GetStaticPaths, GetStaticProps } from 'next';
import { Language, getLocalizedSEO, generateHreflangTags } from '../utils/i18n';
import { generateProductSchema, generateSellerSchema, generateArticleSchema } from '../utils/structured-data';

// Supported languages
export const SUPPORTED_LANGUAGES: Language[] = ['uz', 'ru', 'en'];

// Language-specific content types
export interface MultilingualContent {
  [key: string]: {
    uz: any;
    ru: any;
    en: any;
  };
}

// Generate static paths for multilingual pages
export function generateMultilingualPaths(
  slugs: string[],
  includeDefault = true
): { paths: any[]; fallback: boolean | 'blocking' } {
  const paths = [];
  
  // Generate paths for each language
  for (const lang of SUPPORTED_LANGUAGES) {
    for (const slug of slugs) {
      if (lang === 'uz' && includeDefault) {
        // Default language without prefix
        paths.push({ params: { slug }, locale: lang });
      }
      
      // Language-prefixed paths
      paths.push({
        params: { lang, slug },
        locale: lang
      });
    }
  }
  
  return {
    paths,
    fallback: 'blocking'
  };
}

// Generate static props for multilingual pages
export function createMultilingualStaticProps<T>(
  fetchContent: (slug: string, lang: Language) => Promise<T>,
  pageType: 'product' | 'category' | 'seller' | 'article' = 'article'
) {
  return async ({ params, locale }: { params: any; locale: string }) => {
    const language = (params?.lang as Language) || (locale as Language) || 'uz';
    const slug = params?.slug as string;
    
    if (!slug) {
      return {
        notFound: true
      };
    }
    
    try {
      // Fetch content for the specific language
      const content = await fetchContent(slug, language);
      
      if (!content) {
        return {
          notFound: true
        };
      }
      
      // Generate SEO data
      const seoData = getLocalizedSEO(language);
      
      // Generate hreflang tags
      const currentPath = language === 'uz' ? `/${slug}` : `/${language}/${slug}`;
      const hreflangTags = generateHreflangTags(currentPath);
      
      // Generate structured data based on page type
      let structuredData = null;
      if (pageType === 'product' && content) {
        structuredData = generateProductSchema(content as any);
      } else if (pageType === 'seller' && content) {
        structuredData = generateSellerSchema(content as any);
      } else if (pageType === 'article' && content) {
        structuredData = generateArticleSchema(content as any);
      }
      
      return {
        props: {
          content,
          language,
          seoData,
          hreflangTags,
          structuredData,
          slug
        },
        revalidate: 3600 // 1 hour
      };
    } catch (error) {
      console.error(`Error fetching content for ${slug} in ${language}:`, error);
      
      return {
        notFound: true
      };
    }
  };
}

// Product pages configuration
export const getProductStaticPaths: GetStaticPaths = async () => {
  // In production, fetch from your API
  // const products = await fetchAllProducts();
  
  // Mock data for demonstration
  const productSlugs = [
    'lego-classic-creative-bricks',
    'wooden-educational-puzzle',
    'uzbek-childrens-book-collection',
    'kids-art-supplies-set',
    'soft-plush-teddy-bear'
  ];
  
  return generateMultilingualPaths(productSlugs);
};

export const getProductStaticProps = createMultilingualStaticProps(
  async (slug: string, lang: Language) => {
    // Mock product fetching - replace with actual API call
    const products = {
      'lego-classic-creative-bricks': {
        uz: {
          id: 1,
          title: 'LEGO Classic Ijodiy G\\'ishtlar',
          description: 'Bolalar uchun ijodiy LEGO to\\'plami. 500 ta rang-barang g\\'isht.',
          price: 89000,
          currency: 'UZS',
          category: 'O\\'yinchoqlar',
          ageRange: '4-12 yosh',
          availability: 'in_stock' as const
        },
        ru: {
          id: 1,
          title: 'LEGO Classic Творческие Кирпичики',
          description: 'Творческий набор LEGO для детей. 500 разноцветных кирпичиков.',
          price: 89000,
          currency: 'UZS',
          category: 'Игрушки',
          ageRange: '4-12 лет',
          availability: 'in_stock' as const
        },
        en: {
          id: 1,
          title: 'LEGO Classic Creative Bricks',
          description: 'Creative LEGO set for kids. 500 colorful bricks.',
          price: 89000,
          currency: 'UZS',
          category: 'Toys',
          ageRange: '4-12 years',
          availability: 'in_stock' as const
        }
      }
    };
    
    const product = products[slug as keyof typeof products];
    return product ? product[lang] : null;
  },
  'product'
);

// Category pages configuration
export const getCategoryStaticPaths: GetStaticPaths = async () => {
  const categorySlugs = [
    'toys',
    'books',
    'education',
    'clothes',
    'sports',
    'electronics'
  ];
  
  return generateMultilingualPaths(categorySlugs);
};

export const getCategoryStaticProps = createMultilingualStaticProps(
  async (slug: string, lang: Language) => {
    // Mock category fetching
    const categories = {
      toys: {
        uz: {
          name: 'O\\'yinchoqlar',
          description: 'Bolalar uchun xavfsiz va sifatli o\\'yinchoqlar',
          slug: 'toys'
        },
        ru: {
          name: 'Игрушки',
          description: 'Безопасные и качественные игрушки для детей',
          slug: 'toys'
        },
        en: {
          name: 'Toys',
          description: 'Safe and quality toys for children',
          slug: 'toys'
        }
      },
      books: {
        uz: {
          name: 'Kitoblar',
          description: 'Bolalar uchun ta\\'limiy va ko\\'ngilochar kitoblar',
          slug: 'books'
        },
        ru: {
          name: 'Книги',
          description: 'Образовательные и развлекательные книги для детей',
          slug: 'books'
        },
        en: {
          name: 'Books',
          description: 'Educational and entertaining books for children',
          slug: 'books'
        }
      }
    };
    
    const category = categories[slug as keyof typeof categories];
    return category ? category[lang] : null;
  }
);

// Blog pages configuration
export const getBlogStaticPaths: GetStaticPaths = async () => {
  const blogSlugs = [
    'safe-toys-for-children',
    'educational-toys-benefits',
    'choosing-right-books-kids',
    'uzbek-traditional-toys',
    'digital-learning-tools'
  ];
  
  return generateMultilingualPaths(blogSlugs);
};

export const getBlogStaticProps = createMultilingualStaticProps(
  async (slug: string, lang: Language) => {
    // Mock blog post fetching
    const posts = {
      'safe-toys-for-children': {
        uz: {
          title: 'Bolalar uchun xavfsiz o\\'yinchoqlar',
          description: 'Bolangiz uchun xavfsiz o\\'yinchoq tanlash bo\\'yicha maslahatlar',
          content: 'Bu maqolada biz bolalar uchun xavfsiz o\\'yinchoqlar haqida gaplashamiz...',
          author: { name: 'INBOLA Jamoasi' },
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Maslahatlar',
          tags: ['xavfsizlik', 'o\\'yinchoqlar', 'bolalar']
        },
        ru: {
          title: 'Безопасные игрушки для детей',
          description: 'Советы по выбору безопасных игрушек для вашего ребенка',
          content: 'В этой статье мы расскажем о безопасных игрушках для детей...',
          author: { name: 'Команда INBOLA' },
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Советы',
          tags: ['безопасность', 'игрушки', 'дети']
        },
        en: {
          title: 'Safe Toys for Children',
          description: 'Tips for choosing safe toys for your child',
          content: 'In this article, we will talk about safe toys for children...',
          author: { name: 'INBOLA Team' },
          publishedAt: '2024-01-15T10:00:00Z',
          category: 'Tips',
          tags: ['safety', 'toys', 'children']
        }
      }
    };
    
    const post = posts[slug as keyof typeof posts];
    return post ? post[lang] : null;
  },
  'article'
);

// Seller pages configuration
export const getSellerStaticPaths: GetStaticPaths = async () => {
  const sellerSlugs = [
    'inbola-toys',
    'edu-uzbekistan',
    'kids-world-tashkent',
    'smart-toys-uz',
    'book-palace'
  ];
  
  return generateMultilingualPaths(sellerSlugs);
};

export const getSellerStaticProps = createMultilingualStaticProps(
  async (slug: string, lang: Language) => {
    // Mock seller fetching
    const sellers = {
      'inbola-toys': {
        uz: {
          id: 1,
          name: 'INBOLA O\\'yinchoqlar',
          description: 'Bolalar uchun sifatli o\\'yinchoqlar ishlab chiqaruvchisi',
          url: '/sellers/inbola-toys'
        },
        ru: {
          id: 1,
          name: 'INBOLA Игрушки',
          description: 'Производитель качественных игрушек для детей',
          url: '/ru/sellers/inbola-toys'
        },
        en: {
          id: 1,
          name: 'INBOLA Toys',
          description: 'Quality toy manufacturer for children',
          url: '/en/sellers/inbola-toys'
        }
      }
    };
    
    const seller = sellers[slug as keyof typeof sellers];
    return seller ? seller[lang] : null;
  },
  'seller'
);

// Utility function to get fallback language content
export function getFallbackContent<T>(
  content: MultilingualContent[string],
  preferredLang: Language
): T | null {
  // Try preferred language first
  if (content[preferredLang]) {
    return content[preferredLang];
  }
  
  // Fallback to Uzbek
  if (content.uz) {
    return content.uz;
  }
  
  // Fallback to English
  if (content.en) {
    return content.en;
  }
  
  // Fallback to Russian
  if (content.ru) {
    return content.ru;
  }
  
  return null;
}

// Language detection from URL
export function getLanguageFromPath(path: string): Language {
  if (path.startsWith('/ru/')) return 'ru';
  if (path.startsWith('/en/')) return 'en';
  return 'uz';
}

// Clean path from language prefix
export function getCleanPath(path: string): string {
  return path.replace(/^\\/(uz|ru|en)/, '') || '/';
}"