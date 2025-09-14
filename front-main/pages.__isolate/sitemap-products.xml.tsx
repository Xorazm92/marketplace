import { GetServerSideProps } from 'next';

const ProductsSitemap = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://inbola.uz';
  
  // TODO: In production, fetch from your API
  // const products = await fetchAllProducts();
  
  // Mock product data for demonstration
  const products = [
    {
      slug: 'lego-classic-creative-bricks',
      lastmod: '2024-01-15T10:00:00Z',
      priority: '0.8',
      changefreq: 'weekly',
      images: ['/img/products/lego-classic-1.jpg', '/img/products/lego-classic-2.jpg'],
      price: 89000,
      currency: 'UZS',
      availability: 'in_stock',
      category: 'Construction Toys'
    },
    {
      slug: 'wooden-educational-puzzle',
      lastmod: '2024-01-14T15:30:00Z',
      priority: '0.8',
      changefreq: 'weekly',
      images: ['/img/products/wooden-puzzle-1.jpg'],
      price: 45000,
      currency: 'UZS',
      availability: 'in_stock',
      category: 'Educational Toys'
    },
    {
      slug: 'uzbek-childrens-book-collection',
      lastmod: '2024-01-13T09:15:00Z',
      priority: '0.8',
      changefreq: 'weekly',
      images: ['/img/products/uzbek-books-1.jpg'],
      price: 25000,
      currency: 'UZS',
      availability: 'in_stock',
      category: 'Books'
    },
    {
      slug: 'kids-art-supplies-set',
      lastmod: '2024-01-12T14:20:00Z',
      priority: '0.8',
      changefreq: 'weekly',
      images: ['/img/products/art-supplies-1.jpg'],
      price: 35000,
      currency: 'UZS',
      availability: 'in_stock',
      category: 'Creative Arts'
    },
    {
      slug: 'soft-plush-teddy-bear',
      lastmod: '2024-01-11T11:45:00Z',
      priority: '0.8',
      changefreq: 'weekly',
      images: ['/img/products/teddy-bear-1.jpg'],
      price: 55000,
      currency: 'UZS',
      availability: 'in_stock',
      category: 'Stuffed Animals'
    }
  ];

  const sitemap = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"
        xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\"
        xmlns:xhtml=\"http://www.w3.org/1999/xhtml\">
  ${products
    .map((product) => {
      const productUrl = `/products/${product.slug}`;
      return `
    <url>
      <loc>${baseUrl}${productUrl}</loc>
      <lastmod>${product.lastmod}</lastmod>
      <changefreq>${product.changefreq}</changefreq>
      <priority>${product.priority}</priority>
      ${product.images.map(image => `
      <image:image>
        <image:loc>${baseUrl}${image}</image:loc>
        <image:title>Product Image</image:title>
        <image:caption>${product.category} - INBOLA Kids Marketplace</image:caption>
      </image:image>`).join('')}
      <!-- Multilingual product pages -->
      <xhtml:link rel=\"alternate\" hreflang=\"uz\" href=\"${baseUrl}/uz${productUrl}\" />
      <xhtml:link rel=\"alternate\" hreflang=\"ru\" href=\"${baseUrl}/ru${productUrl}\" />
      <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"${baseUrl}/en${productUrl}\" />
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

export default ProductsSitemap;