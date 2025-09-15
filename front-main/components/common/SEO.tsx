import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  noindex?: boolean;
  nofollow?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title = 'INBOLA - Bolalar uchun xavfsiz onlayn do\'kon',
  description = 'Bolalar uchun eng yaxshi mahsulotlar - kiyim, o\'yinchoqlar, ta\'lim materiallari va boshqa zarur narsalar. Xavfsiz va sifatli mahsulotlar.',
  keywords = 'bolalar, o\'yinchoqlar, kiyim, kitoblar, maktab, chaqaloq, sport, elektronika, o\'zbekiston, tashkent, online do\'kon, xavfsiz mahsulotlar',
  image = 'https://inbola.uz/img/og-image.jpg',
  url,
  type = 'website',
  structuredData,
  noindex = false,
  nofollow = false,
}) => {
  const pathname = usePathname();
  const canonicalUrl = url || `https://inbola.uz${pathname}`;
  
  const robots = noindex || nofollow 
    ? `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="INBOLA Kids Marketplace" />
      <meta property="og:locale" content="uz_UZ" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
};

export default SEO;

