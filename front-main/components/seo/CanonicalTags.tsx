import Head from 'next/head';
import { useRouter } from 'next/router';
import { getCanonicalUrl, generateMultilingualUrl } from '../../utils/seo';

interface CanonicalTagsProps {
  canonicalUrl?: string;
  alternateUrls?: Array<{
    lang: string;
    url: string;
  }>;
  noIndex?: boolean;
}

const CanonicalTags: React.FC<CanonicalTagsProps> = ({
  canonicalUrl,
  alternateUrls,
  noIndex = false
}) => {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  // Generate canonical URL
  const canonical = canonicalUrl || getCanonicalUrl(router.asPath, baseUrl);
  
  // Generate default alternate URLs if not provided
  const alternates = alternateUrls || [
    { lang: 'uz', url: generateMultilingualUrl(router.asPath, 'uz') },
    { lang: 'ru', url: generateMultilingualUrl(router.asPath, 'ru') },
    { lang: 'en', url: generateMultilingualUrl(router.asPath, 'en') },
    { lang: 'x-default', url: router.asPath }
  ].map(alt => ({
    lang: alt.lang,
    url: alt.url.startsWith('http') ? alt.url : `${baseUrl}${alt.url}`
  }));
  
  // Remove query parameters and fragments from canonical URL
  const cleanCanonical = canonical.split('?')[0].split('#')[0];
  
  return (
    <Head>
      {/* Canonical URL */}
      <link rel=\"canonical\" href={cleanCanonical} />
      
      {/* Alternate language URLs */}
      {alternates.map(({ lang, url }) => (
        <link 
          key={lang} 
          rel=\"alternate\" 
          hrefLang={lang} 
          href={url.split('?')[0].split('#')[0]} 
        />
      ))}
      
      {/* Robot directives */}
      <meta 
        name=\"robots\" 
        content={noIndex 
          ? 'noindex,nofollow' 
          : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
        } 
      />
      
      {/* Prevent parameter pollution */}
      <meta name=\"googlebot\" content=\"index,follow,noimageindex\" />
      <meta name=\"bingbot\" content=\"index,follow\" />
      <meta name=\"yandex\" content=\"index,follow\" />
      
      {/* Prevent duplicate content from trailing slashes */}
      {router.asPath.endsWith('/') && router.asPath !== '/' && (
        <link rel=\"canonical\" href={cleanCanonical.replace(/\\/$/, '')} />
      )}
    </Head>
  );
};

export default CanonicalTags;