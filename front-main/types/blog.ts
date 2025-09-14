/**
 * Blog types for INBOLA Kids Marketplace
 * SEO-optimized content management system
 */

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  images: string[];
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  category: BlogCategory;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  views: number;
  status: 'draft' | 'published' | 'archived';
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };
  // Multilingual support
  translations: {
    uz: BlogPostContent;
    ru: BlogPostContent;
    en: BlogPostContent;
  };
}

export interface BlogPostContent {
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface BlogCategory {
  id: number;
  slug: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  postCount: number;
  translations: {
    uz: { name: string; description: string };
    ru: { name: string; description: string };
    en: { name: string; description: string };
  };
}

// Pre-defined blog categories for INBOLA
export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: 1,
    slug: 'safety-tips',
    name: 'Xavfsizlik maslahatlari',
    description: 'Bolalar xavfsizligi bo\'yicha foydali maslahatlar',
    color: '#22c55e',
    icon: '🛡️',
    postCount: 0,
    translations: {
      uz: {
        name: 'Xavfsizlik maslahatlari',
        description: 'Bolalar xavfsizligi bo\'yicha foydali maslahatlar'
      },
      ru: {
        name: 'Советы по безопасности',
        description: 'Полезные советы по безопасности детей'
      },
      en: {
        name: 'Safety Tips',
        description: 'Helpful tips for children\'s safety'
      }
    }
  },
  {
    id: 2,
    slug: 'education',
    name: 'Ta\'lim va rivojlanish',
    description: 'Bolalar ta\'limi va rivojlanishi haqida',
    color: '#3b82f6',
    icon: '📚',
    postCount: 0,
    translations: {
      uz: {
        name: 'Ta\'lim va rivojlanish',
        description: 'Bolalar ta\'limi va rivojlanishi haqida'
      },
      ru: {
        name: 'Образование и развитие',
        description: 'О образовании и развитии детей'
      },
      en: {
        name: 'Education & Development',
        description: 'About children\'s education and development'
      }
    }
  },
  {
    id: 3,
    slug: 'parenting',
    name: 'Ota-onalik maslahatlari',
    description: 'Ota-onalar uchun foydali maslahatlar',
    color: '#f59e0b',
    icon: '👨‍👩‍👧‍👦',
    postCount: 0,
    translations: {
      uz: {
        name: 'Ota-onalik maslahatlari',
        description: 'Ota-onalar uchun foydali maslahatlar'
      },
      ru: {
        name: 'Советы для родителей',
        description: 'Полезные советы для родителей'
      },
      en: {
        name: 'Parenting Tips',
        description: 'Helpful tips for parents'
      }
    }
  },
  {
    id: 4,
    slug: 'product-guides',
    name: 'Mahsulot yo\'riqnomalari',
    description: 'Mahsulotlarni tanlash va ishlatish bo\'yicha',
    color: '#8b5cf6',
    icon: '🛍️',
    postCount: 0,
    translations: {
      uz: {
        name: 'Mahsulot yo\'riqnomalari',
        description: 'Mahsulotlarni tanlash va ishlatish bo\'yicha'
      },
      ru: {
        name: 'Гиды по продуктам',
        description: 'По выбору и использованию продуктов'
      },
      en: {
        name: 'Product Guides',
        description: 'About choosing and using products'
      }
    }
  },
  {
    id: 5,
    slug: 'shopping-tips',
    name: 'Xarid maslahatlari',
    description: 'Onlayn xarid qilish bo\'yicha maslahatlar',
    color: '#ef4444',
    icon: '🛒',
    postCount: 0,
    translations: {
      uz: {
        name: 'Xarid maslahatlari',
        description: 'Onlayn xarid qilish bo\'yicha maslahatlar'
      },
      ru: {
        name: 'Советы по покупкам',
        description: 'Советы по онлайн покупкам'
      },
      en: {
        name: 'Shopping Tips',
        description: 'Tips for online shopping'
      }
    }
  }
];

// Sample blog posts for initial content
export const SAMPLE_BLOG_POSTS: Omit<BlogPost, 'id'>[] = [
  {
    slug: 'bolalar-uchun-xavfsiz-oyinchoqlar',
    title: 'Bolalar uchun xavfsiz o\'yinchoqlarni qanday tanlash mumkin?',
    excerpt: 'Farzandingiz uchun eng xavfsiz va sifatli o\'yinchoqlarni tanlash bo\'yicha to\'liq qo\'llanma.',
    content: '',
    featuredImage: '/img/blog/safe-toys-featured.jpg',
    images: ['/img/blog/safe-toys-1.jpg', '/img/blog/safe-toys-2.jpg'],
    author: {
      name: 'INBOLA Jamoasi',
      avatar: '/img/authors/inbola-team.jpg',
      bio: 'Bolalar mahsulotlari sohasidagi mutaxassislar jamoasi'
    },
    category: BLOG_CATEGORIES[0],
    tags: ['xavfsizlik', 'o\'yinchoqlar', 'bolalar', 'tanlash', 'sertifikat'],
    publishedAt: '2024-01-15T10:00:00Z',
    readingTime: 8,
    views: 0,
    status: 'published',
    seo: {
      metaTitle: 'Bolalar uchun xavfsiz o\'yinchoqlar - INBOLA Blog',
      metaDescription: 'O\'zbekiston ota-onalari uchun xavfsiz va sertifikatlangan bolalar o\'yinchoqlari ro\'yxati. Ekspert maslahatlari bilan.',
      keywords: ['bolalar o\'yinchoqlari', 'xavfsiz o\'yinchoq', 'sertifikatlangan o\'yinchoq', 'bolalar xavfsizligi', 'o\'yinchoq tanlash']
    },
    translations: {
      uz: {
        title: 'Bolalar uchun xavfsiz o\'yinchoqlarni qanday tanlash mumkin?',
        excerpt: 'Farzandingiz uchun eng xavfsiz va sifatli o\'yinchoqlarni tanlash bo\'yicha to\'liq qo\'llanma.',
        content: '',
        metaTitle: 'Bolalar uchun xavfsiz o\'yinchoqlar - INBOLA Blog',
        metaDescription: 'O\'zbekiston ota-onalari uchun xavfsiz va sertifikatlangan bolalar o\'yinchoqlari ro\'yxati.',
        keywords: ['bolalar o\'yinchoqlari', 'xavfsiz o\'yinchoq', 'sertifikatlangan o\'yinchoq']
      },
      ru: {
        title: 'Как выбрать безопасные игрушки для детей?',
        excerpt: 'Полное руководство по выбору самых безопасных и качественных игрушек для вашего ребенка.',
        content: '',
        metaTitle: 'Безопасные игрушки для детей - INBOLA Blog',
        metaDescription: 'Список безопасных и сертифицированных детских игрушек для родителей в Узбекистане.',
        keywords: ['детские игрушки', 'безопасные игрушки', 'сертифицированные игрушки']
      },
      en: {
        title: 'How to Choose Safe Toys for Children?',
        excerpt: 'Complete guide to choosing the safest and highest quality toys for your child.',
        content: '',
        metaTitle: 'Safe Toys for Children - INBOLA Blog',
        metaDescription: 'List of safe and certified children\'s toys for parents in Uzbekistan.',
        keywords: ['children toys', 'safe toys', 'certified toys']
      }
    }
  },
  {
    slug: 'maktab-uchun-zarur-buyumlar',
    title: 'O\'zbekistonda maktab uchun eng zarur 10 buyum',
    excerpt: 'Maktab yili boshlanishiga tayyorgarlik: eng kerakli buyumlar ro\'yxati va tanlash maslahatlari.',
    content: '',
    featuredImage: '/img/blog/school-supplies-featured.jpg',
    images: ['/img/blog/school-supplies-1.jpg', '/img/blog/school-supplies-2.jpg'],
    author: {
      name: 'Nilufar Karimova',
      avatar: '/img/authors/nilufar.jpg',
      bio: 'Ta\'lim sohasidagi mutaxassis va ona'
    },
    category: BLOG_CATEGORIES[1],
    tags: ['maktab', 'ta\'lim', 'buyumlar', 'ro\'yxat', 'tayyorgarlik'],
    publishedAt: '2024-01-14T09:00:00Z',
    readingTime: 6,
    views: 0,
    status: 'published',
    seo: {
      metaTitle: 'Maktab uchun zarur buyumlar 2024 - INBOLA',
      metaDescription: 'O\'zbekiston maktablari uchun eng zarur buyumlar ro\'yxati. Narxlar va tanlash bo\'yicha maslahatlar.',
      keywords: ['maktab buyumlari', 'maktab sumkasi', 'daftar qalam', 'maktab kiyimi', 'o\'quv qurollari']
    },
    translations: {
      uz: {
        title: 'O\'zbekistonda maktab uchun eng zarur 10 buyum',
        excerpt: 'Maktab yili boshlanishiga tayyorgarlik: eng kerakli buyumlar ro\'yxati.',
        content: '',
        metaTitle: 'Maktab uchun zarur buyumlar 2024 - INBOLA',
        metaDescription: 'O\'zbekiston maktablari uchun eng zarur buyumlar ro\'yxati.',
        keywords: ['maktab buyumlari', 'maktab sumkasi', 'daftar qalam']
      },
      ru: {
        title: '10 самых необходимых вещей для школы в Узбекистане',
        excerpt: 'Подготовка к началу учебного года: список самых необходимых вещей.',
        content: '',
        metaTitle: 'Необходимые школьные принадлежности 2024 - INBOLA',
        metaDescription: 'Список самых необходимых вещей для школ Узбекистана.',
        keywords: ['школьные принадлежности', 'школьная сумка', 'тетради ручки']
      },
      en: {
        title: 'Top 10 Essential School Items in Uzbekistan',
        excerpt: 'Preparing for the school year: list of most essential items.',
        content: '',
        metaTitle: 'Essential School Supplies 2024 - INBOLA',
        metaDescription: 'List of most essential items for schools in Uzbekistan.',
        keywords: ['school supplies', 'school bag', 'notebooks pens']
      }
    }
  }
];