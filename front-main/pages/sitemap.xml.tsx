import { GetServerSideProps } from 'next';

const Sitemap = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = 'https://inbola.uz';
  
  const pages = [
    '',
    '/products',
    '/categories',
    '/about',
    '/contact',
    '/cart',
    '/favorites',
    '/orders',
    '/profile',
    '/sign-up',
    '/login',
    '/faq',
    '/privacy-policy',
    '/terms-of-service',
    '/shipping-info',
    '/return-policy',
    '/size-guide',
    '/brands',
    '/new-arrivals',
    '/sale',
    '/gift-cards',
    '/blog',
    '/reviews',
    '/support',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  ${pages
    .map((page) => {
      const priority = page === '' ? '1.0' : 
                     page === '/products' ? '0.9' :
                     page === '/categories' ? '0.8' :
                     page === '/about' ? '0.7' :
                     page === '/contact' ? '0.7' : '0.6';
      
      const changefreq = page === '' ? 'daily' : 
                        page === '/products' ? 'daily' :
                        page === '/new-arrivals' ? 'daily' :
                        page === '/sale' ? 'weekly' : 'weekly';
      
      return `
    <url>
      <loc>${baseUrl}${page}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
      ${page === '' ? `
      <image:image>
        <image:loc>${baseUrl}/img/og-image.jpg</image:loc>
        <image:title>INBOLA Kids Marketplace</image:title>
        <image:caption>Bolalar uchun xavfsiz onlayn do'kon</image:caption>
      </image:image>` : ''}
    </url>
  `;
    })
    .join('')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
