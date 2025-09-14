import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: object;
  hreflang?: Array<{
    lang: string;
    url: string;
  }>;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  category?: string;
  tags?: string[];
  price?: {
    amount: number;
    currency: string;
  };
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
  rating?: {
    value: number;
    count: number;
  };
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'INBOLA Kids Marketplace',
  description = 'O\'zbekiston va Rossiyada bolalar uchun xavfsiz va sifatli mahsulotlar. UzCard, Humo, Payme bilan to\'lov. Tez va ishonchli yetkazib berish.',
  keywords = 'bolalar o\'yinchoq, kids toys, детские игрушки, xavfsiz o\'yinchoq, ta\'limiy o\'yinlar, bolalar kitoblari, uzbekistan marketplace, inbola',
  image = '/img/og-inbola-marketplace.jpg',
  type = 'website',
  canonicalUrl,
  noIndex = false,
  structuredData,
  hreflang = [],
  author,
  publishedTime,
  modifiedTime,
  category,
  tags = [],
  price,
  availability,
  rating
}) => {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  // Generate canonical URL
  const canonical = canonicalUrl || `${baseUrl}${router.asPath.split('?')[0]}`;
  
  // Generate page title
  const pageTitle = title !== 'INBOLA Kids Marketplace' 
    ? `${title} | INBOLA Kids Marketplace`
    : title;

  // Generate multilingual URLs
  const generateHreflangUrls = () => {
    const currentPath = router.asPath.split('?')[0];
    const defaultHreflang = [
      { lang: 'uz', url: `${baseUrl}/uz${currentPath}` },
      { lang: 'ru', url: `${baseUrl}/ru${currentPath}` },
      { lang: 'en', url: `${baseUrl}/en${currentPath}` },
      { lang: 'x-default', url: `${baseUrl}${currentPath}` }
    ];
    
    return hreflang.length > 0 ? hreflang : defaultHreflang;
  };

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <meta name='viewport' content='width=device-width, initial-scale=1, shrink-to-fit=no' />
      
      <link rel='canonical' href={canonical} />
      
      {generateHreflangUrls().map(({ lang, url }) => (
        <link key={lang} rel='alternate' hrefLang={lang} href={url} />
      ))}
      
      <meta property='og:title' content={pageTitle} />
      <meta property='og:description' content={description} />
      <meta property='og:type' content={type} />
      <meta property='og:url' content={canonical} />
      <meta property='og:image' content={`${baseUrl}${image}`} />
      <meta property='og:site_name' content='INBOLA Kids Marketplace' />
      
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={pageTitle} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:image' content={`${baseUrl}${image}`} />
      
      {noIndex ? (
        <meta name='robots' content='noindex,nofollow' />
      ) : (
        <meta name='robots' content='index,follow,max-image-preview:large' />
      )}
      
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
      
      <meta name='theme-color' content='#f16521' />
      <link rel='icon' href='/favicon.ico' />
    </Head>
  );
};

export default SEOHead;