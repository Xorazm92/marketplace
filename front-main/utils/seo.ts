/**
 * SEO-friendly URL utilities for INBOLA Kids Marketplace
 * Optimized for Uzbek, Russian, and English content
 */

// Character mappings for URL-friendly slugs
const CYRILLIC_TO_LATIN = {
  '\u0430': 'a', '\u0431': 'b', '\u0432': 'v', '\u0433': 'g', '\u0434': 'd', '\u0435': 'e', '\u0451': 'yo',
  '\u0436': 'zh', '\u0437': 'z', '\u0438': 'i', '\u0439': 'y', '\u043a': 'k', '\u043b': 'l', '\u043c': 'm',
  '\u043d': 'n', '\u043e': 'o', '\u043f': 'p', '\u0440': 'r', '\u0441': 's', '\u0442': 't', '\u0443': 'u',
  '\u0444': 'f', '\u0445': 'h', '\u0446': 'ts', '\u0447': 'ch', '\u0448': 'sh', '\u0449': 'sch',
  '\u044a': '', '\u044b': 'y', '\u044c': '', '\u044d': 'e', '\u044e': 'yu', '\u044f': 'ya',
  '\u0410': 'A', '\u0411': 'B', '\u0412': 'V', '\u0413': 'G', '\u0414': 'D', '\u0415': 'E', '\u0401': 'Yo',
  '\u0416': 'Zh', '\u0417': 'Z', '\u0418': 'I', '\u0419': 'Y', '\u041a': 'K', '\u041b': 'L', '\u041c': 'M',
  '\u041d': 'N', '\u041e': 'O', '\u041f': 'P', '\u0420': 'R', '\u0421': 'S', '\u0422': 'T', '\u0423': 'U',
  '\u0424': 'F', '\u0425': 'H', '\u0426': 'Ts', '\u0427': 'Ch', '\u0428': 'Sh', '\u0429': 'Sch',
  '\u042a': '', '\u042b': 'Y', '\u042c': '', '\u042d': 'E', '\u042e': 'Yu', '\u042f': 'Ya'
};

const UZBEK_TO_LATIN = {
  '\u049b': 'q', '\u0493': 'g', '\u04b3': 'h', '\u045e': 'o',
  '\u049a': 'Q', '\u0492': 'G', '\u04b2': 'H', '\u040e': 'O'
};

const SPECIAL_CHARACTERS = {
  '\u2019': \"'\", '\u2018': \"'\", '\u201c': '\"', '\u201d': '\"',
  '\u2013': '-', '\u2014': '-', '\u2026': '...'
};

/**
 * Generate SEO-friendly slug from any text
 * Supports Uzbek, Russian, and English
 */
export function generateSlug(text: string, maxLength = 60): string {
  if (!text) return '';
  
  let slug = text.toLowerCase().trim();
  
  // Replace special characters
  Object.entries(SPECIAL_CHARACTERS).forEach(([char, replacement]) => {
    slug = slug.replace(new RegExp(char, 'g'), replacement);
  });
  
  // Convert Cyrillic to Latin
  Object.entries(CYRILLIC_TO_LATIN).forEach(([cyrillic, latin]) => {
    slug = slug.replace(new RegExp(cyrillic, 'g'), latin);
  });
  
  // Convert Uzbek specific characters
  Object.entries(UZBEK_TO_LATIN).forEach(([uzbek, latin]) => {
    slug = slug.replace(new RegExp(uzbek, 'g'), latin);
  });
  
  // Remove non-alphanumeric characters except hyphens
  slug = slug.replace(/[^a-z0-9\\s-]/g, '');
  
  // Replace spaces and multiple hyphens with single hyphen
  slug = slug.replace(/[\\s_]+/g, '-').replace(/-+/g, '-');
  
  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');
  
  // Truncate to max length
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Don't break words
    const lastHyphen = slug.lastIndexOf('-');
    if (lastHyphen > maxLength * 0.8) {
      slug = slug.substring(0, lastHyphen);
    }
  }
  
  return slug || 'item';
}

/**
 * Generate product URL with SEO-friendly structure
 * Format: /products/category-name/product-name
 */
export function generateProductUrl(product: {
  id: number;
  title: string;
  category?: string;
  brand?: string;
}): string {
  const categorySlug = product.category ? generateSlug(product.category) : 'products';
  const productSlug = generateSlug(product.title);
  
  return `/products/${categorySlug}/${productSlug}-${product.id}`;
}

/**
 * Generate category URL with hierarchy
 * Format: /categories/parent-category/sub-category
 */
export function generateCategoryUrl(category: {
  slug?: string;
  name: string;
  parent?: string;
}): string {
  const categorySlug = category.slug || generateSlug(category.name);
  
  if (category.parent) {
    const parentSlug = generateSlug(category.parent);
    return `/categories/${parentSlug}/${categorySlug}`;
  }
  
  return `/categories/${categorySlug}`;
}

/**
 * Generate seller URL
 * Format: /sellers/seller-name
 */
export function generateSellerUrl(seller: {
  id: number;
  name: string;
  slug?: string;
}): string {
  const sellerSlug = seller.slug || generateSlug(seller.name);
  return `/sellers/${sellerSlug}-${seller.id}`;
}

/**
 * Generate blog post URL
 * Format: /blog/category/post-title
 */
export function generateBlogUrl(post: {
  id: number;
  title: string;
  category?: string;
  publishedAt?: string;
}): string {
  const postSlug = generateSlug(post.title);
  
  if (post.category) {
    const categorySlug = generateSlug(post.category);
    return `/blog/${categorySlug}/${postSlug}`;
  }
  
  return `/blog/${postSlug}`;
}

/**
 * Generate search URL with SEO-friendly parameters
 * Format: /search/query?filters
 */
export function generateSearchUrl(query: string, filters?: Record<string, any>): string {
  const querySlug = generateSlug(query);
  let url = `/search/${querySlug}`;
  
  if (filters && Object.keys(filters).length > 0) {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v.toString()));
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
}

/**
 * Generate multilingual URL with proper hreflang
 */
export function generateMultilingualUrl(path: string, lang: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  switch (lang) {
    case 'uz':
      return `/uz/${cleanPath}`;
    case 'ru':
      return `/ru/${cleanPath}`;
    case 'en':
      return `/en/${cleanPath}`;
    default:
      return `/${cleanPath}`;
  }
}

/**
 * Get canonical URL for the current page
 */
export function getCanonicalUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  const cleanPath = path.replace(/\\/$/, '') || '/';
  
  // Remove language prefixes for canonical URL
  const canonicalPath = cleanPath.replace(/^\\/(uz|ru|en)/, '') || '/';
  
  return `${base}${canonicalPath}`;
}

/**
 * Generate breadcrumb URLs
 */
export function generateBreadcrumbs(path: string): Array<{name: string; url: string}> {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Bosh sahifa', url: '/' }];
  
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Convert segment to readable name
    let name = segment.replace(/-/g, ' ');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    
    // Special cases for known paths
    const specialNames: Record<string, string> = {
      'products': 'Mahsulotlar',
      'categories': 'Toifalar',
      'sellers': 'Sotuvchilar',
      'blog': 'Blog',
      'about': 'Biz haqimizda',
      'contact': 'Aloqa',
      'help': 'Yordam',
      'faq': 'Ko\\'p so\\'raladigan savollar',
      'toys': 'O\\'yinchoqlar',
      'books': 'Kitoblar',
      'education': 'Ta\\'lim',
      'clothes': 'Kiyim-kechak'
    };
    
    breadcrumbs.push({
      name: specialNames[segment] || name,
      url: currentPath
    });
  });
  
  return breadcrumbs;
}

/**
 * Validate and sanitize URL parameters
 */
export function sanitizeUrlParams(params: Record<string, any>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Remove potentially harmful characters
      const cleanKey = key.replace(/[^a-zA-Z0-9_-]/g, '');
      const cleanValue = String(value).replace(/[<>\"'&]/g, '');
      
      if (cleanKey && cleanValue) {
        sanitized[cleanKey] = cleanValue;
      }
    }
  });
  
  return sanitized;
}

/**
 * Generate sitemap entry for a URL
 */
export function generateSitemapEntry({
  url,
  lastmod,
  changefreq = 'weekly',
  priority = '0.8',
  images = [],
  alternates = []
}: {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
  images?: string[];
  alternates?: Array<{lang: string; url: string}>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const lastModified = lastmod || new Date().toISOString();
  
  return {
    url: fullUrl,
    lastmod: lastModified,
    changefreq,
    priority,
    images: images.map(img => ({
      loc: img.startsWith('http') ? img : `${baseUrl}${img}`,
      title: 'Product Image',
      caption: 'INBOLA Kids Marketplace'
    })),
    alternates: alternates.length > 0 ? alternates : [
      { lang: 'uz', url: `${baseUrl}/uz${url}` },
      { lang: 'ru', url: `${baseUrl}/ru${url}` },
      { lang: 'en', url: `${baseUrl}/en${url}` }
    ]
  };
}

/**
 * Extract product ID from SEO-friendly URL
 */
export function extractProductId(slug: string): number | null {
  const match = slug.match(/-([0-9]+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract seller ID from SEO-friendly URL
 */
export function extractSellerId(slug: string): number | null {
  const match = slug.match(/-([0-9]+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Generate JSON-LD structured data for breadcrumbs
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{name: string; url: string}>) {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`
    }))
  };
}