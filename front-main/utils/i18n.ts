/**
 * Internationalization utilities for INBOLA Kids Marketplace
 * Supporting Uzbek, Russian, and English
 */

export type Language = 'uz' | 'ru' | 'en';

export interface TranslationStrings {
  // Common UI elements
  home: string;
  products: string;
  categories: string;
  about: string;
  contact: string;
  cart: string;
  checkout: string;
  login: string;
  register: string;
  search: string;
  
  // Product related
  price: string;
  addToCart: string;
  buyNow: string;
  outOfStock: string;
  inStock: string;
  reviews: string;
  rating: string;
  
  // Categories
  toys: string;
  books: string;
  education: string;
  clothes: string;
  sports: string;
  electronics: string;
  
  // SEO specific
  pageTitle: string;
  pageDescription: string;
  keywords: string;
}

export const translations: Record<Language, TranslationStrings> = {
  uz: {
    home: 'Bosh sahifa',
    products: 'Mahsulotlar',
    categories: 'Toifalar',
    about: 'Biz haqimizda',
    contact: 'Aloqa',
    cart: 'Savat',
    checkout: 'To\\'lovga o\\'tish',
    login: 'Kirish',
    register: 'Ro\\'yxatdan o\\'tish',
    search: 'Qidirish',
    
    price: 'Narx',
    addToCart: 'Savatga qo\\'shish',
    buyNow: 'Hoziroq sotib olish',
    outOfStock: 'Tugagan',
    inStock: 'Mavjud',
    reviews: 'Sharhlar',
    rating: 'Reyting',
    
    toys: 'O\\'yinchoqlar',
    books: 'Kitoblar',
    education: 'Ta\\'lim',
    clothes: 'Kiyim-kechak',
    sports: 'Sport',
    electronics: 'Elektronika',
    
    pageTitle: 'INBOLA - Bolalar uchun xavfsiz onlayn do\\'kon',
    pageDescription: 'O\\'zbekistondagi eng yirik bolalar mahsulotlari onlayn do\\'koni. Xavfsiz va sifatli o\\'yinchoqlar, kitoblar, ta\\'lim materiallari. Tez yetkazib berish va ishonchli to\\'lov.',
    keywords: 'bolalar o\\'yinchoq, xavfsiz o\\'yinchoq, ta\\'limiy o\\'yinlar, bolalar kitoblari, uzbekistan marketplace, onlayn do\\'kon, INBOLA'
  },
  
  ru: {
    home: 'Главная',
    products: 'Товары',
    categories: 'Категории',
    about: 'О нас',
    contact: 'Контакты',
    cart: 'Корзина',
    checkout: 'Оформить заказ',
    login: 'Войти',
    register: 'Регистрация',
    search: 'Поиск',
    
    price: 'Цена',
    addToCart: 'В корзину',
    buyNow: 'Купить сейчас',
    outOfStock: 'Нет в наличии',
    inStock: 'В наличии',
    reviews: 'Отзывы',
    rating: 'Рейтинг',
    
    toys: 'Игрушки',
    books: 'Книги',
    education: 'Образование',
    clothes: 'Одежда',
    sports: 'Спорт',
    electronics: 'Электроника',
    
    pageTitle: 'INBOLA - Безопасный интернет-магазин для детей',
    pageDescription: 'Крупнейший интернет-магазин детских товаров в Узбекистане. Безопасные и качественные игрушки, книги, образовательные материалы. Быстрая доставка и надежная оплата.',
    keywords: 'детские игрушки, безопасные игрушки, развивающие игры, детские книги, узбекистан магазин, интернет магазин, INBOLA'
  },
  
  en: {
    home: 'Home',
    products: 'Products',
    categories: 'Categories',
    about: 'About Us',
    contact: 'Contact',
    cart: 'Cart',
    checkout: 'Checkout',
    login: 'Login',
    register: 'Register',
    search: 'Search',
    
    price: 'Price',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    reviews: 'Reviews',
    rating: 'Rating',
    
    toys: 'Toys',
    books: 'Books',
    education: 'Education',
    clothes: 'Clothes',
    sports: 'Sports',
    electronics: 'Electronics',
    
    pageTitle: 'INBOLA - Safe Online Kids Store',
    pageDescription: 'Uzbekistan\\'s largest online store for children\\'s products. Safe and quality toys, books, educational materials. Fast delivery and secure payment.',
    keywords: 'kids toys, safe toys, educational games, children books, uzbekistan marketplace, online store, INBOLA'
  }
};

// Language detection utilities
export function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'uz';
  
  // Check URL first
  const path = window.location.pathname;
  if (path.startsWith('/ru')) return 'ru';
  if (path.startsWith('/en')) return 'en';
  if (path.startsWith('/uz')) return 'uz';
  
  // Check localStorage
  const saved = localStorage.getItem('inbola_language') as Language;
  if (saved && translations[saved]) return saved;
  
  // Check browser language
  const browser = navigator.language.toLowerCase();
  if (browser.startsWith('ru')) return 'ru';
  if (browser.startsWith('en')) return 'en';
  
  // Default to Uzbek
  return 'uz';
}

export function setLanguage(lang: Language) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('inbola_language', lang);
}

export function getTranslation(key: keyof TranslationStrings, lang?: Language): string {
  const language = lang || detectLanguage();
  return translations[language][key] || translations.uz[key];
}

// URL generation for different languages
export function getLocalizedUrl(path: string, lang: Language): string {
  const cleanPath = path.replace(/^\\/(uz|ru|en)/, '');
  
  switch (lang) {
    case 'uz':
      return cleanPath || '/';
    case 'ru':
      return `/ru${cleanPath || ''}`;
    case 'en':
      return `/en${cleanPath || ''}`;
    default:
      return cleanPath || '/';
  }
}

// SEO meta generation for different languages
export function getLocalizedSEO(lang: Language) {
  const t = translations[lang];
  
  return {
    title: t.pageTitle,
    description: t.pageDescription,
    keywords: t.keywords,
    language: lang,
    locale: getLocale(lang)
  };
}

export function getLocale(lang: Language): string {
  const locales = {
    uz: 'uz_UZ',
    ru: 'ru_RU',
    en: 'en_US'
  };
  
  return locales[lang];
}

// Product title and description translations
export interface ProductTranslations {
  title: Record<Language, string>;
  description: Record<Language, string>;
  category: Record<Language, string>;
}

export function getProductTranslation(
  translations: ProductTranslations,
  field: 'title' | 'description' | 'category',
  lang?: Language
): string {
  const language = lang || detectLanguage();
  return translations[field][language] || translations[field].uz || '';
}

// Category translations
export const categoryTranslations: Record<string, Record<Language, string>> = {
  toys: {
    uz: 'O\\'yinchoqlar',
    ru: 'Игрушки',
    en: 'Toys'
  },
  books: {
    uz: 'Kitoblar',
    ru: 'Книги',
    en: 'Books'
  },
  education: {
    uz: 'Ta\\'lim',
    ru: 'Образование',
    en: 'Education'
  },
  clothes: {
    uz: 'Kiyim-kechak',
    ru: 'Одежда',
    en: 'Clothes'
  },
  sports: {
    uz: 'Sport',
    ru: 'Спорт',
    en: 'Sports'
  },
  electronics: {
    uz: 'Elektronika',
    ru: 'Электроника',
    en: 'Electronics'
  }
};

export function getCategoryTranslation(categoryKey: string, lang?: Language): string {
  const language = lang || detectLanguage();
  const category = categoryTranslations[categoryKey];
  
  if (!category) return categoryKey;
  
  return category[language] || category.uz || categoryKey;
}

// Hreflang generation
export function generateHreflangTags(currentPath: string): Array<{lang: string; url: string}> {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  const cleanPath = currentPath.replace(/^\\/(uz|ru|en)/, '');
  
  return [
    { lang: 'uz', url: `${baseUrl}${cleanPath}` },
    { lang: 'ru', url: `${baseUrl}/ru${cleanPath}` },
    { lang: 'en', url: `${baseUrl}/en${cleanPath}` },
    { lang: 'x-default', url: `${baseUrl}${cleanPath}` }
  ];
}

// Currency formatting based on language
export function formatPrice(amount: number, currency: string = 'UZS', lang?: Language): string {
  const language = lang || detectLanguage();
  
  const formatters = {
    uz: new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol'
    }),
    ru: new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol'
    }),
    en: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol'
    })
  };
  
  try {
    return formatters[language].format(amount);
  } catch {
    // Fallback for UZS
    return `${amount.toLocaleString()} so'm`;
  }
}

// Date formatting based on language
export function formatDate(date: Date, lang?: Language): string {
  const language = lang || detectLanguage();
  
  const formatters = {
    uz: new Intl.DateTimeFormat('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    ru: new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    en: new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
  
  return formatters[language].format(date);
}"