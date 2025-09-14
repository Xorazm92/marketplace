import React from 'react';
import SEOHead from './SEOHead';
import StructuredData from './StructuredData';
import CanonicalTags from './CanonicalTags';
import WebVitals from './WebVitals';
import PerformanceOptimizer from './PerformanceOptimizer';
import CriticalCSS from './CriticalCSS';
import ResourcePreloader from './ResourcePreloader';
import type { Product, Seller, Article } from '../../utils/structured-data';

interface SEOProps {
  // Page metadata
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  
  // Structured data
  structuredDataType?: 'website' | 'product' | 'seller' | 'article' | 'local-business';
  structuredData?: Product | Seller | Article | any;
  breadcrumbs?: Array<{name: string; url: string}>;
  
  // Page type specific
  pageType?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  category?: string;
  tags?: string[];
  
  // Product specific
  price?: {
    amount: number;
    currency: string;
  };
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
  rating?: {
    value: number;
    count: number;
  };
  
  // Multilingual
  hreflang?: Array<{
    lang: string;
    url: string;
  }>;
  
  // Performance options
  enableWebVitals?: boolean;
  enablePerformanceOptimizer?: boolean;
  enableCriticalCSS?: boolean;
  enableResourcePreloader?: boolean;
  
  // Analytics
  analyticsId?: string;
  debugMode?: boolean;
}

/**
 * Comprehensive SEO component that includes all optimization features
 * for INBOLA Kids Marketplace
 */
const SEO: React.FC<SEOProps> = ({
  // Page metadata
  title,
  description,
  keywords,
  image,
  canonicalUrl,
  noIndex = false,
  
  // Structured data
  structuredDataType = 'website',
  structuredData,
  breadcrumbs,
  
  // Page type specific
  pageType = 'website',
  author,
  publishedTime,
  modifiedTime,
  category,
  tags = [],
  
  // Product specific
  price,
  availability,
  rating,
  
  // Multilingual
  hreflang,
  
  // Performance options
  enableWebVitals = true,
  enablePerformanceOptimizer = true,
  enableCriticalCSS = true,
  enableResourcePreloader = true,
  
  // Analytics
  analyticsId,
  debugMode = process.env.NODE_ENV === 'development'
}) => {
  return (
    <>
      {/* Enhanced SEO Head with meta tags */}
      <SEOHead
        title={title}
        description={description}
        keywords={keywords}
        image={image}
        type={pageType}
        canonicalUrl={canonicalUrl}
        noIndex={noIndex}
        hreflang={hreflang}
        author={author}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
        category={category}
        tags={tags}
        price={price}
        availability={availability}
        rating={rating}
      />
      
      {/* Canonical URLs and hreflang tags */}
      <CanonicalTags
        canonicalUrl={canonicalUrl}
        alternateUrls={hreflang}
        noIndex={noIndex}
      />
      
      {/* Structured Data (Schema.org) */}
      <StructuredData
        type={structuredDataType}
        data={structuredData}
        breadcrumbs={breadcrumbs}
        includeBreadcrumbs={true}
        includeWebsite={structuredDataType !== 'website'}
        includeLocalBusiness={false}
      />
      
      {/* Core Web Vitals monitoring */}
      {enableWebVitals && (
        <WebVitals 
          analyticsId={analyticsId}
          debug={debugMode}
        />
      )}
      
      {/* Performance optimization */}
      {enablePerformanceOptimizer && (
        <PerformanceOptimizer
          enableLazyLoading={true}
          enableServiceWorker={true}
          preloadCriticalResources={true}
          optimizeScrolling={true}
        />
      )}
      
      {/* Critical CSS inlining */}
      {enableCriticalCSS && (
        <CriticalCSS route={typeof window !== 'undefined' ? window.location.pathname : '/'} />
      )}
      
      {/* Resource preloading */}
      {enableResourcePreloader && (
        <ResourcePreloader
          preloadFonts={true}
          preloadImages={true}
          preloadNextPages={true}
          preloadAPIData={true}
        />
      )}
    </>
  );
};

// Export individual components for granular usage
export {
  SEOHead,
  StructuredData,
  CanonicalTags,
  WebVitals,
  PerformanceOptimizer,
  CriticalCSS,
  ResourcePreloader
};

// Export types
export type {
  Product,
  Seller,
  Article
} from '../../utils/structured-data';

// Export utilities
export {
  generateSlug,
  generateProductUrl,
  generateCategoryUrl,
  generateSellerUrl,
  generateBlogUrl,
  generateSearchUrl,
  generateMultilingualUrl,
  getCanonicalUrl,
  generateBreadcrumbs
} from '../../utils/seo';

export {
  generateProductSchema,
  generateSellerSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateWebsiteSchema,
  generateLocalBusinessSchema
} from '../../utils/structured-data';

export default SEO;