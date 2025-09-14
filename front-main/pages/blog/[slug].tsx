import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../layout';
import SEOHead from '../../components/seo/SEOHead';
import { BlogPost } from '../../types/blog';
import { generateSlug } from '../../utils/seo';
import { generateArticleStructuredData } from '../../utils/structured-data';
import styles from './BlogPost.module.scss';

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

const BlogPostPage: React.FC<BlogPostPageProps> = ({ post, relatedPosts }) => {
  const structuredData = generateArticleStructuredData({
    headline: post.title.uz,
    description: post.excerpt.uz,
    image: post.featured_image || '/img/blog-placeholder.jpg',
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: 'INBOLA Team',
    publisher: 'INBOLA Kids Marketplace'
  });

  const shareUrl = `https://inbola.uz/blog/${post.slug}`;

  return (
    <Layout
      title={post.seo_title?.uz || post.title.uz}
      description={post.meta_description?.uz || post.excerpt.uz}
      keywords={post.keywords?.uz}
    >
      <SEOHead
        title={post.seo_title?.uz || post.title.uz}
        description={post.meta_description?.uz || post.excerpt.uz}
        keywords={post.keywords?.uz}
        structuredData={structuredData}
        canonicalUrl={`https://inbola.uz/blog/${post.slug}`}
        type="article"
        image={post.featured_image}
      />

      <article className={styles.blogPost}>
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <div className="container">
            <ol className={styles.breadcrumbList}>
              <li className={styles.breadcrumbItem}>
                <Link href="/" className={styles.breadcrumbLink}>
                  Bosh sahifa
                </Link>
              </li>
              <li className={styles.breadcrumbItem}>
                <Link href="/blog" className={styles.breadcrumbLink}>
                  Blog
                </Link>
              </li>
              {post.category && (
                <li className={styles.breadcrumbItem}>
                  <Link 
                    href={`/blog/category/${post.category.slug}`} 
                    className={styles.breadcrumbLink}
                  >
                    {post.category.name.uz}
                  </Link>
                </li>
              )}
              <li className={styles.breadcrumbItem} aria-current="page">
                {post.title.uz}
              </li>
            </ol>
          </div>
        </nav>

        {/* Post Header */}
        <header className={styles.postHeader}>
          <div className="container">
            <div className={styles.headerContent}>
              {post.category && (
                <div className={styles.categoryBadge}>
                  <Link href={`/blog/category/${post.category.slug}`}>
                    {post.category.name.uz}
                  </Link>
                </div>
              )}
              
              <h1 className={styles.postTitle}>{post.title.uz}</h1>
              
              <div className={styles.postMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Nashr etilgan:</span>
                  <time dateTime={post.published_at} className={styles.metaValue}>
                    {new Date(post.published_at).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>O'qish vaqti:</span>
                  <span className={styles.metaValue}>{post.read_time} daqiqa</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Ko'rishlar:</span>
                  <span className={styles.metaValue}>{post.views || 0}</span>
                </div>
              </div>

              <p className={styles.postExcerpt}>{post.excerpt.uz}</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className={styles.featuredImage}>
            <div className="container">
              <div className={styles.imageWrapper}>
                <Image
                  src={post.featured_image}
                  alt={post.title.uz}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className={styles.image}
                  priority
                />
              </div>
            </div>
          </div>
        )}

        {/* Post Content */}
        <div className={styles.postContent}>
          <div className="container">
            <div className={styles.contentWrapper}>
              <main className={styles.articleContent}>
                <div 
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: post.content.uz }}
                />

                {/* Social Share */}
                <div className={styles.socialShare}>
                  <h3 className={styles.shareTitle}>Ulashing:</h3>
                  <div className={styles.shareButtons}>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title.uz)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.shareButton} ${styles.telegram}`}
                      aria-label="Telegram'da ulashish"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                      </svg>
                      Telegram
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.shareButton} ${styles.facebook}`}
                      aria-label="Facebook'da ulashish"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(shareUrl)}
                      className={`${styles.shareButton} ${styles.copy}`}
                      aria-label="Havolani nusxalash"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                      Nusxalash
                    </button>
                  </div>
                </div>

                {/* Tags */}
                {post.keywords?.uz && (
                  <div className={styles.tags}>
                    <h3 className={styles.tagsTitle}>Teglar:</h3>
                    <div className={styles.tagsList}>
                      {post.keywords.uz.split(',').map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </main>

              {/* Sidebar */}
              <aside className={styles.sidebar}>
                {/* Table of Contents */}
                <div className={styles.widget}>
                  <h3 className={styles.widgetTitle}>Mavzular</h3>
                  <div className={styles.tableOfContents}>
                    <ul className={styles.tocList}>
                      <li><a href="#introduction">Kirish</a></li>
                      <li><a href="#main-points">Asosiy fikrlar</a></li>
                      <li><a href="#recommendations">Tavsiyalar</a></li>
                      <li><a href="#conclusion">Xulosa</a></li>
                    </ul>
                  </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className={styles.widget}>
                    <h3 className={styles.widgetTitle}>O'xshash maqolalar</h3>
                    <div className={styles.relatedPosts}>
                      {relatedPosts.slice(0, 3).map((relatedPost) => (
                        <article key={relatedPost.id} className={styles.relatedPost}>
                          <Link href={`/blog/${relatedPost.slug}`} className={styles.relatedLink}>
                            <div className={styles.relatedImage}>
                              <Image
                                src={relatedPost.featured_image || '/img/blog-placeholder.jpg'}
                                alt={relatedPost.title.uz}
                                fill
                                sizes="100px"
                                className={styles.image}
                              />
                            </div>
                            <div className={styles.relatedContent}>
                              <h4 className={styles.relatedTitle}>{relatedPost.title.uz}</h4>
                              <span className={styles.relatedDate}>
                                {new Date(relatedPost.published_at).toLocaleDateString('uz-UZ')}
                              </span>
                            </div>
                          </Link>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter */}
                <div className={styles.widget}>
                  <h3 className={styles.widgetTitle}>Yangiliklar</h3>
                  <p className={styles.newsletterText}>
                    Eng so'nggi maslahatlar va mahsulot yangiliklaridan xabardor bo'ling
                  </p>
                  <form className={styles.newsletterForm}>
                    <input
                      type="email"
                      placeholder="Email manzilingiz"
                      className={styles.newsletterInput}
                      required
                    />
                    <button type="submit" className={styles.newsletterButton}>
                      Obuna bo'lish
                    </button>
                  </form>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className={styles.relatedSection}>
            <div className="container">
              <h2 className={styles.sectionTitle}>O'xshash maqolalar</h2>
              <div className={styles.relatedGrid}>
                {relatedPosts.slice(0, 3).map((relatedPost) => (
                  <article key={relatedPost.id} className={styles.relatedCard}>
                    <Link href={`/blog/${relatedPost.slug}`} className={styles.cardLink}>
                      <div className={styles.cardImage}>
                        <Image
                          src={relatedPost.featured_image || '/img/blog-placeholder.jpg'}
                          alt={relatedPost.title.uz}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className={styles.image}
                        />
                      </div>
                      <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{relatedPost.title.uz}</h3>
                        <p className={styles.cardExcerpt}>{relatedPost.excerpt.uz}</p>
                        <div className={styles.cardMeta}>
                          <span className={styles.readTime}>{relatedPost.read_time} daq</span>
                          <span className={styles.publishDate}>
                            {new Date(relatedPost.published_at).toLocaleDateString('uz-UZ')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  // In production, fetch all blog post slugs from API
  // const posts = await fetchBlogPosts();
  // const paths = posts.map((post) => ({ params: { slug: post.slug } }));

  // Sample paths based on your content
  const paths = [
    { params: { slug: 'bolalar-uchun-xavfsiz-oyinchoqlar' } },
    { params: { slug: 'maktab-uchun-eng-zarur-10-buyum' } },
    { params: { slug: 'ota-onalar-tanlagan-top-mahsulotlar' } },
    { params: { slug: 'bolalar-uchun-kitob-tanlash' } },
    { params: { slug: 'onlayn-xarid-bolalar-xavfsizligi' } },
  ];

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  // In production, fetch post by slug from API
  // const post = await fetchBlogPostBySlug(slug);
  // const relatedPosts = await fetchRelatedPosts(post.category_id, post.id);

  // Sample data - you would replace this with actual API calls
  const samplePosts = [
    {
      id: 1,
      title: {
        uz: "Bolalar uchun xavfsiz o'yinchoqlarni qanday tanlash mumkin?",
        ru: "Как выбрать безопасные игрушки для детей?",
        en: "How to choose safe toys for children?"
      },
      slug: "bolalar-uchun-xavfsiz-oyinchoqlar",
      excerpt: {
        uz: "O'zbekiston ota-onalari uchun xavfsiz va sertifikatlangan bolalar o'yinchoqlari ro'yxati va tanlash qoidalari.",
        ru: "Список безопасных и сертифицированных детских игрушек и правила выбора для родителей Узбекистана.",
        en: "List of safe and certified children's toys and selection rules for parents in Uzbekistan."
      },
      content: {
        uz: `
          <div id="introduction">
            <h2>Kirish</h2>
            <p>Har bir ota-ona o'z farzandi uchun eng xavfsiz va foydali o'yinchoqlarni tanlashni xohlaydi. Biroq, bozorda juda ko'p turli xil o'yinchoqlar mavjud bo'lgani uchun, to'g'ri tanlov qilish qiyin bo'lishi mumkin.</p>
          </div>

          <div id="main-points">
            <h2>Asosiy fikrlar</h2>
            <h3>1. Yosh guruhiga moslik</h3>
            <p>O'yinchoq tanlashda birinchi navbatda bolaning yoshi hisobga olinishi kerak. Har bir o'yinchoqda yosh chegarasi ko'rsatilgan bo'ladi.</p>
            
            <h3>2. Xavfsizlik sertifikatlari</h3>
            <p>Faqat sertifikatlangan va standartlarga javob beradigan o'yinchoqlarni sotib oling. CE belgisi Yevropa standartlariga muvofiqligini bildiradi.</p>
            
            <h3>3. Material sifati</h3>
            <p>O'yinchoq tayyorlangan materiallar zaharli bo'lmasligi va allergiya keltirib chiqarmasligi kerak.</p>
          </div>

          <div id="recommendations">
            <h2>Tavsiyalar</h2>
            <ul>
              <li>Yosh chegarasiga diqqat qiling</li>
              <li>Kichik qismlar mavjudligini tekshiring</li>
              <li>Sertifikat va kafolat mavjudligini so'rang</li>
              <li>Bola bilan birga tanlang</li>
              <li>Ta'limiy qiymatiga e'tibor bering</li>
            </ul>
          </div>

          <div id="conclusion">
            <h2>Xulosa</h2>
            <p>Xavfsiz o'yinchoq tanlash - bu bolaning sog'lig'i va rivojlanishi uchun muhim qadam. INBOLA da faqat sertifikatlangan va xavfsiz mahsulotlar sotiladi.</p>
          </div>
        `,
        ru: "Содержание статьи на русском языке...",
        en: "Article content in English..."
      },
      featured_image: "/img/blog/safe-toys-guide.jpg",
      seo_title: {
        uz: "Bolalar uchun xavfsiz o'yinchoqlar - INBOLA Blog",
        ru: "Безопасные игрушки для детей - INBOLA Blog",
        en: "Safe toys for children - INBOLA Blog"
      },
      meta_description: {
        uz: "O'zbekiston ota-onalari uchun xavfsiz va sertifikatlangan bolalar o'yinchoqlari ro'yxati.",
        ru: "Список безопасных и сертифицированных детских игрушек для родителей Узбекистана.",
        en: "List of safe and certified children's toys for parents in Uzbekistan."
      },
      keywords: {
        uz: "xavfsiz o'yinchoqlar, bolalar o'yinchoqlari, sertifikatlangan o'yinchoqlar, yosh guruhi, CE belgisi",
        ru: "безопасные игрушки, детские игрушки, сертифицированные игрушки, возрастная группа, CE маркировка",
        en: "safe toys, children's toys, certified toys, age group, CE marking"
      },
      category_id: 1,
      category: {
        id: 1,
        name: { uz: "Xavfsizlik maslahatlari", ru: "Советы по безопасности", en: "Safety Tips" },
        slug: "xavfsizlik-maslahatlari",
        description: { uz: "Bolalar xavfsizligi haqida", ru: "О безопасности детей", en: "About child safety" },
        post_count: 8,
        is_active: true
      },
      status: 'published' as const,
      is_featured: true,
      read_time: 8,
      views: 1245,
      published_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
    // Add other sample posts here...
  ];

  const post = samplePosts.find(p => p.slug === slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  // Sample related posts
  const relatedPosts = samplePosts.filter(p => p.slug !== slug && p.category_id === post.category_id);

  return {
    props: {
      post,
      relatedPosts,
    },
    revalidate: 3600, // Revalidate every hour
  };
};

export default BlogPostPage;