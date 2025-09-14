/**
 * Structured Data (Schema.org) utilities for INBOLA Kids Marketplace
 * Optimized for Google, Yandex, and Bing rich snippets
 */

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  images?: string[];
  brand?: string;
  category: string;
  sku?: string;
  gtin?: string;
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'discontinued';
  condition: 'new' | 'used' | 'refurbished';
  seller: {
    id: number;
    name: string;
    image?: string;
    rating?: number;
    reviewCount?: number;
  };
  rating?: {
    value: number;
    count: number;
    bestRating?: number;
    worstRating?: number;
  };
  offers?: {
    price: number;
    currency: string;
    availability: string;
    priceValidUntil?: string;
    shippingCost?: number;
  }[];
  ageRange?: string;
  safetyRating?: number;
  educationalValue?: string;
  material?: string[];
  weight?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  url: string;
}

export interface Seller {
  id: number;
  name: string;
  description: string;
  image?: string;
  logo?: string;
  url: string;
  address?: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  rating?: {
    value: number;
    count: number;
  };
  verification?: {
    verified: boolean;
    badges: string[];
  };
  establishedYear?: number;
  specialties?: string[];
}

export interface Article {
  title: string;
  description: string;
  content: string;
  author: {
    name: string;
    image?: string;
    bio?: string;
  };
  publishedAt: string;
  modifiedAt?: string;
  image: string;
  url: string;
  category: string;
  tags: string[];
  readingTime?: number;
  wordCount?: number;
}

/**
 * Generate Product Schema.org JSON-LD
 */
export function generateProductSchema(product: Product): object {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/products/${product.id}`,
    name: product.name,
    description: product.description,
    image: product.images || [product.image],
    url: `${baseUrl}${product.url}`,
    sku: product.sku || `INBOLA-${product.id}`,
    ...(product.gtin && { gtin: product.gtin }),
    
    brand: {
      '@type': 'Brand',
      name: product.brand || 'INBOLA',
      logo: `${baseUrl}/img/logo-inbola.png`
    },
    
    category: product.category,
    
    // Product condition and availability
    condition: `https://schema.org/${product.condition === 'new' ? 'NewCondition' : 
                 product.condition === 'used' ? 'UsedCondition' : 'RefurbishedCondition'}`,
    
    // Offers
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${getAvailabilitySchema(product.availability)}`,
      url: `${baseUrl}${product.url}`,
      seller: {
        '@type': 'Organization',
        name: product.seller.name,
        ...(product.seller.image && { image: product.seller.image })
      },
      validFrom: new Date().toISOString(),
      ...(product.offers?.[0]?.priceValidUntil && {
        priceValidUntil: product.offers[0].priceValidUntil
      }),
      ...(product.offers?.[0]?.shippingCost && {
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: product.offers[0].shippingCost,
            currency: product.currency
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
            },
            cutoffTime: '15:00'
          }
        }
      })
    },
    
    // Ratings and reviews
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.value,
        reviewCount: product.rating.count,
        bestRating: product.rating.bestRating || 5,
        worstRating: product.rating.worstRating || 1
      }
    }),
    
    // Additional product properties for kids marketplace
    additionalProperty: [
      ...(product.ageRange ? [{
        '@type': 'PropertyValue',
        name: 'Age Range',
        value: product.ageRange
      }] : []),
      ...(product.safetyRating ? [{
        '@type': 'PropertyValue',
        name: 'Safety Rating',
        value: product.safetyRating,
        maxValue: 5
      }] : []),
      ...(product.educationalValue ? [{
        '@type': 'PropertyValue',
        name: 'Educational Value',
        value: product.educationalValue
      }] : []),
      ...(product.material ? [{
        '@type': 'PropertyValue',
        name: 'Material',
        value: product.material.join(', ')
      }] : [])
    ],
    
    // Physical properties
    ...(product.weight && {
      weight: {
        '@type': 'QuantitativeValue',
        value: product.weight
      }
    }),
    
    ...(product.dimensions && {
      depth: {
        '@type': 'QuantitativeValue',
        value: product.dimensions.length,
        unitCode: product.dimensions.unit.toUpperCase()
      },
      width: {
        '@type': 'QuantitativeValue',
        value: product.dimensions.width,
        unitCode: product.dimensions.unit.toUpperCase()
      },
      height: {
        '@type': 'QuantitativeValue',
        value: product.dimensions.height,
        unitCode: product.dimensions.unit.toUpperCase()
      }
    }),
    
    // Audience (important for kids products)
    audience: {
      '@type': 'PeopleAudience',
      suggestedMinAge: extractMinAge(product.ageRange),
      suggestedMaxAge: extractMaxAge(product.ageRange)
    },
    
    // Safety and compliance
    hasEnergyConsumptionDetails: false,
    isFamilyFriendly: true
  };
  
  return schema;
}

/**
 * Generate Organization/Seller Schema.org JSON-LD
 */
export function generateSellerSchema(seller: Seller): object {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/sellers/${seller.id}`,
    name: seller.name,
    description: seller.description,
    url: `${baseUrl}${seller.url}`,
    ...(seller.logo && { logo: seller.logo }),
    ...(seller.image && { image: seller.image }),
    
    // Address information
    ...(seller.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: seller.address.street,
        addressLocality: seller.address.city,
        addressRegion: seller.address.region,
        postalCode: seller.address.postalCode,
        addressCountry: seller.address.country
      }
    }),
    
    // Contact information
    ...(seller.contactInfo && {
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        ...(seller.contactInfo.phone && { telephone: seller.contactInfo.phone }),
        ...(seller.contactInfo.email && { email: seller.contactInfo.email }),
        availableLanguage: ['uz', 'ru', 'en']
      }
    }),
    
    // Ratings
    ...(seller.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: seller.rating.value,
        reviewCount: seller.rating.count,
        bestRating: 5,
        worstRating: 1
      }
    }),
    
    // Business details
    ...(seller.establishedYear && {
      foundingDate: `${seller.establishedYear}-01-01`
    }),
    
    // Specialties and services
    ...(seller.specialties && {
      knowsAbout: seller.specialties
    }),
    
    // Trust indicators
    ...(seller.verification?.verified && {
      hasCredential: {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Verified Seller',
        recognizedBy: {
          '@type': 'Organization',
          name: 'INBOLA Kids Marketplace'
        }
      }
    }),
    
    // Service area (for kids marketplace)
    areaServed: {
      '@type': 'Country',
      name: 'Uzbekistan'
    },
    
    // Business type
    '@type': 'Store',
    currenciesAccepted: 'UZS,USD,EUR,RUB'
  };
}

/**
 * Generate Article Schema.org JSON-LD for blog posts
 */
export function generateArticleSchema(article: Article): object {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    url: `${baseUrl}${article.url}`,
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    
    author: {
      '@type': 'Person',
      name: article.author.name,
      ...(article.author.image && { image: article.author.image }),
      ...(article.author.bio && { description: article.author.bio })
    },
    
    publisher: {
      '@type': 'Organization',
      name: 'INBOLA Kids Marketplace',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/img/logo-inbola.png`,
        width: 200,
        height: 60
      }
    },
    
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}${article.url}`
    },
    
    articleSection: article.category,
    keywords: article.tags.join(', '),
    
    ...(article.wordCount && {
      wordCount: article.wordCount
    }),
    
    // Article body
    articleBody: article.content,
    
    // Audience (family-friendly content)
    audience: {
      '@type': 'ParentAudience',
      name: 'Parents and Caregivers'
    },
    
    // Language
    inLanguage: 'uz',
    
    // Content rating
    contentRating: 'family-friendly'
  };
}

/**
 * Generate Breadcrumb Schema.org JSON-LD
 */
export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string; url: string}>): object {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${baseUrl}${crumb.url}`
    }))
  };
}

/**
 * Generate Website Schema.org JSON-LD
 */
export function generateWebsiteSchema(): object {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'INBOLA Kids Marketplace',
    description: 'Bolalar va ota-onalar uchun xavfsiz elektron tijorat platformasi',
    url: baseUrl,
    
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    
    publisher: {
      '@type': 'Organization',
      name: 'INBOLA',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/img/logo-inbola.png`
      }
    },
    
    sameAs: [
      'https://t.me/inbola_uz',
      'https://instagram.com/inbola.uz',
      'https://facebook.com/inbola.uz'
    ],
    
    audience: {
      '@type': 'Audience',
      audienceType: 'Parents, Children, Educators'
    },
    
    inLanguage: ['uz', 'ru', 'en']
  };
}

/**
 * Generate LocalBusiness Schema.org JSON-LD
 */
export function generateLocalBusinessSchema(): object {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#business`,
    name: 'INBOLA Kids Marketplace',
    description: 'O\'zbekistondagi eng yirik bolalar mahsulotlari onlayn do\'koni',
    url: baseUrl,
    
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tashkent',
      addressRegion: 'Tashkent',
      addressCountry: 'UZ'
    },
    
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.2995,
      longitude: 69.2401
    },
    
    telephone: '+998712345678',
    email: 'info@inbola.uz',
    
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59'
    },
    
    currenciesAccepted: 'UZS',
    paymentAccepted: 'UzCard, Humo, Payme, Click, Cash',
    
    priceRange: '$$',
    
    servedCuisine: undefined, // Not applicable
    
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Kids Products',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Toys'
        },
        {
          '@type': 'OfferCatalog',
          name: 'Books'
        },
        {
          '@type': 'OfferCatalog',
          name: 'Educational Materials'
        }
      ]
    }
  };
}

/**
 * Generate FAQ Page Schema.org JSON-LD
 */
export function generateFAQStructuredData(faqItems: any[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question.uz || item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer.uz || item.answer
      }
    }))
  };
}

/**
 * Simplified function names for backward compatibility
 */
export function generateProductStructuredData(product: Product): object {
  return generateProductSchema(product);
}

export function generateSellerStructuredData(seller: Seller): object {
  return generateSellerSchema(seller);
}

export function generateArticleStructuredData(article: Article): object {
  return generateArticleSchema(article);
}

export function generateWebsiteStructuredData(data?: {name?: string, description?: string, url?: string}): object {
  if (data) {
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: data.name || 'INBOLA Kids Marketplace',
      description: data.description || 'Bolalar va ota-onalar uchun xavfsiz elektron tijorat platformasi',
      url: data.url || baseUrl
    };
  }
  return generateWebsiteSchema();
}

export function generateLocalBusinessStructuredData(): object {
  return generateLocalBusinessSchema();
}

// Helper functions
function getAvailabilitySchema(availability: string): string {
  const mapping = {
    'in_stock': 'InStock',
    'out_of_stock': 'OutOfStock',
    'preorder': 'PreOrder',
    'discontinued': 'Discontinued'
  };
  return mapping[availability as keyof typeof mapping] || 'InStock';
}

function extractMinAge(ageRange?: string): number | undefined {
  if (!ageRange) return undefined;
  const match = ageRange.match(/(\\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

function extractMaxAge(ageRange?: string): number | undefined {
  if (!ageRange) return undefined;
  const match = ageRange.match(/(\\d+)-(\\d+)/);
  return match ? parseInt(match[2], 10) : undefined;
}