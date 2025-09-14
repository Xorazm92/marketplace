/**
 * SSG/ISR Configuration for INBOLA Kids Marketplace
 * Optimized for SEO and performance
 */

// Revalidation intervals (in seconds)
export const REVALIDATION_INTERVALS = {
  STATIC_CONTENT: 86400,     // 24 hours - About, Contact, etc.
  PRODUCTS: 3600,            // 1 hour - Product pages
  CATEGORIES: 7200,          // 2 hours - Category pages  
  SELLERS: 14400,            // 4 hours - Seller pages
  BLOG_POSTS: 1800,          // 30 minutes - Blog content
  HOMEPAGE: 900,             // 15 minutes - Homepage
  SEARCH_RESULTS: 300,       // 5 minutes - Search pages
  DYNAMIC_CONTENT: 60        // 1 minute - Highly dynamic content
};

// Pages that should be statically generated
export const STATIC_PATHS = [
  '/',
  '/about',
  '/contact',
  '/faq',
  '/privacy-policy',
  '/terms-of-service',
  '/shipping-info',
  '/return-policy',
  '/size-guide',
  '/help'
];

// Configuration for different page types
export const PAGE_CONFIGS = {
  // Homepage configuration
  homepage: {
    revalidate: REVALIDATION_INTERVALS.HOMEPAGE,
    generateStaticParams: true,
    cache: 'force-cache'
  },
  
  // Product pages configuration
  products: {
    revalidate: REVALIDATION_INTERVALS.PRODUCTS,
    generateStaticParams: true,
    fallback: 'blocking', // Generate on-demand for new products
    cache: 'force-cache'
  },
  
  // Category pages configuration
  categories: {
    revalidate: REVALIDATION_INTERVALS.CATEGORIES,
    generateStaticParams: true,
    fallback: 'blocking',
    cache: 'force-cache'
  },
  
  // Seller pages configuration
  sellers: {
    revalidate: REVALIDATION_INTERVALS.SELLERS,
    generateStaticParams: true,
    fallback: 'blocking',
    cache: 'force-cache'
  },
  
  // Blog pages configuration
  blog: {
    revalidate: REVALIDATION_INTERVALS.BLOG_POSTS,
    generateStaticParams: true,
    fallback: 'blocking',
    cache: 'force-cache'
  },
  
  // Search pages configuration
  search: {
    revalidate: REVALIDATION_INTERVALS.SEARCH_RESULTS,
    generateStaticParams: false,
    fallback: 'blocking',
    cache: 'no-store' // Always fresh for search
  }
};

// Helper function to get static paths for products
export async function getProductStaticPaths() {
  try {
    // In production, fetch from your API
    // const products = await fetchFeaturedProducts(100);
    
    // Mock data for demonstration
    const featuredProducts = [
      { id: 1, slug: 'lego-classic-creative-bricks' },
      { id: 2, slug: 'wooden-educational-puzzle' },
      { id: 3, slug: 'uzbek-childrens-book-collection' },
      { id: 4, slug: 'kids-art-supplies-set' },
      { id: 5, slug: 'soft-plush-teddy-bear' }
    ];
    
    const paths = featuredProducts.map(product => ({
      params: {
        slug: product.slug,
        id: product.id.toString()
      }
    }));
    
    return {
      paths,
      fallback: 'blocking' // Generate other pages on-demand
    };
  } catch (error) {
    console.error('Error generating product static paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

// Helper function to get static paths for categories
export async function getCategoryStaticPaths() {
  try {
    // In production, fetch from your API
    // const categories = await fetchAllCategories();
    
    // Mock data
    const categories = [
      { slug: 'toys' },
      { slug: 'books' },
      { slug: 'education' },
      { slug: 'clothes' },
      { slug: 'sports' },
      { slug: 'electronics' }
    ];
    
    const paths = categories.map(category => ({
      params: {
        slug: category.slug
      }
    }));
    
    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error generating category static paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

// Helper function to get static paths for sellers
export async function getSellerStaticPaths() {
  try {
    // In production, fetch from your API
    // const sellers = await fetchVerifiedSellers(50);
    
    // Mock data
    const sellers = [
      { id: 1, slug: 'inbola-toys' },
      { id: 2, slug: 'edu-uzbekistan' },
      { id: 3, slug: 'kids-world-tashkent' },
      { id: 4, slug: 'smart-toys-uz' },
      { id: 5, slug: 'book-palace' }
    ];
    
    const paths = sellers.map(seller => ({
      params: {
        slug: seller.slug,
        id: seller.id.toString()
      }
    }));
    
    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error generating seller static paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

// Helper function to get static paths for blog posts
export async function getBlogStaticPaths() {
  try {
    // In production, fetch from your API
    // const posts = await fetchBlogPosts(100);
    
    // Mock data
    const posts = [
      { slug: 'safe-toys-for-children' },
      { slug: 'educational-toys-benefits' },
      { slug: 'choosing-right-books-kids' },
      { slug: 'uzbek-traditional-toys' },
      { slug: 'digital-learning-tools' }
    ];
    
    const paths = posts.map(post => ({
      params: {
        slug: post.slug
      }
    }));
    
    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error generating blog static paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

// On-demand revalidation helper
export async function revalidatePage(path: string) {
  try {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path })
    });
    
    if (!response.ok) {
      throw new Error('Failed to revalidate');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error revalidating page:', error);
    throw error;
  }
}

// Cache configuration for different content types
export const CACHE_CONFIGS = {
  // Static content (long cache)
  static: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'CDN-Cache-Control': 'public, max-age=31536000'
  },
  
  // Dynamic content (short cache with revalidation)
  dynamic: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'CDN-Cache-Control': 'public, max-age=60'
  },
  
  // API responses
  api: {
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    'CDN-Cache-Control': 'public, max-age=300'
  },
  
  // Images and assets
  assets: {
    'Cache-Control': 'public, max-age=2592000, immutable',
    'CDN-Cache-Control': 'public, max-age=2592000'
  }
};

// ISR page generation priorities
export const GENERATION_PRIORITIES = {
  HIGH: ['/', '/products', '/categories'],
  MEDIUM: ['/sellers', '/blog', '/about'],
  LOW: ['/help', '/faq', '/terms-of-service']
};

// Prerender configuration
export const PRERENDER_CONFIG = {
  // Number of pages to prerender at build time
  maxPages: {
    products: 100,
    categories: 20,
    sellers: 50,
    blog: 30
  },
  
  // Batch size for generating pages
  batchSize: 10,
  
  // Timeout for page generation (ms)
  timeout: 30000
};"}, {
  
  // Enable ISR for production
  enableISR: process.env.NODE_ENV === 'production',
  
  // Fallback behavior
  fallbackBehavior: 'blocking'
};