import { GetServerSideProps } from 'next';

const Sitemap = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  // Static pages with priority and changefreq
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString() },
    { url: '/products', priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString() },
    { url: '/categories', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { url: '/about', priority: '0.7', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/contact', priority: '0.7', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/faq', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { url: '/blog', priority: '0.8', changefreq: 'daily', lastmod: new Date().toISOString() },
    { url: '/reviews', priority: '0.6', changefreq: 'daily', lastmod: new Date().toISOString() },
    { url: '/help', priority: '0.6', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/shipping-info', priority: '0.5', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/return-policy', priority: '0.5', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/privacy-policy', priority: '0.5', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/terms-of-service', priority: '0.5', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/size-guide', priority: '0.5', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/brands', priority: '0.6', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { url: '/new-arrivals', priority: '0.8', changefreq: 'daily', lastmod: new Date().toISOString() },
    { url: '/sale', priority: '0.7', changefreq: 'daily', lastmod: new Date().toISOString() },
    { url: '/gift-cards', priority: '0.6', changefreq: 'weekly', lastmod: new Date().toISOString() },
  ];

  // TODO: In production, fetch dynamic pages from API
  // const products = await fetchProducts();
  // const categories = await fetchCategories();
  // const blogPosts = await fetchBlogPosts();
  // const sellers = await fetchSellers();

  // For now, we'll use mock data structure
  const dynamicPages = [
    // Example product pages
    { url: '/products/lego-classic-set', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { url: '/products/wooden-educational-toys', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { url: '/products/kids-books-uzbek', priority: '0.8', changefreq: 'weekly', lastmod: new Date().toISOString() },
    
    // Example category pages
    { url: '/categories/toys', priority: '0.7', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { url: '/categories/books', priority: '0.7', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { url: '/categories/education', priority: '0.7', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { url: '/categories/clothes', priority: '0.7', changefreq: 'weekly', lastmod: new Date().toISOString() },
    
    // Example seller pages
    { url: '/sellers/inbola-toys', priority: '0.6', changefreq: 'weekly', lastmod: new Date().toISOString() },
    { url: '/sellers/edu-uzbekistan', priority: '0.6', changefreq: 'weekly', lastmod: new Date().toISOString() },
    
    // Example blog posts
    { url: '/blog/bolalar-uchun-xavfsiz-oyinchoqlar', priority: '0.7', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/blog/maktab-uchun-eng-zarur-10-buyum', priority: '0.7', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/blog/ota-onalar-tanlagan-top-mahsulotlar', priority: '0.7', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/blog/bolalar-uchun-kitob-tanlash', priority: '0.7', changefreq: 'monthly', lastmod: new Date().toISOString() },
    { url: '/blog/onlayn-xarid-bolalar-xavfsizligi', priority: '0.7', changefreq: 'monthly', lastmod: new Date().toISOString() },
  ];

  const allPages = [...staticPages, ...dynamicPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${allPages
    .map((page) => {
      return `
    <url>
      <loc>${baseUrl}${page.url}</loc>
      <lastmod>${page.lastmod}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
      ${page.url === '' ? `
      <image:image>
        <image:loc>${baseUrl}/img/og-inbola-marketplace.jpg</image:loc>
        <image:title>INBOLA Kids Marketplace</image:title>
        <image:caption>Bolalar uchun xavfsiz onlayn do'kon</image:caption>
      </image:image>
      <!-- Multilingual versions -->
      <xhtml:link rel="alternate" hreflang="uz" href="${baseUrl}/uz${page.url}" />
      <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/ru${page.url}" />
      <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${page.url}" />
      <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${page.url}" />` : ''}
      ${page.url.startsWith('/products/') ? `
      <image:image>
        <image:loc>${baseUrl}/img/products/${page.url.replace('/products/', '')}.jpg</image:loc>
        <image:title>Product Image</image:title>
      </image:image>
      <!-- Product multilingual versions -->
      <xhtml:link rel="alternate" hreflang="uz" href="${baseUrl}/uz${page.url}" />
      <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}/ru${page.url}" />
      <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${page.url}" />` : ''}
      ${page.url.startsWith('/blog/') ? `
      <news:news>
        <news:publication>
          <news:name>INBOLA Kids Blog</news:name>
          <news:language>uz</news:language>
        </news:publication>
        <news:publication_date>${page.lastmod}</news:publication_date>
        <news:title>Blog Post Title</news:title>
        <news:keywords>bolalar, o'yinchoq, ta'lim, xavfsizlik</news:keywords>
      </news:news>` : ''}
    </url>
  `;
    })
    .join('')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default Sitemap;
