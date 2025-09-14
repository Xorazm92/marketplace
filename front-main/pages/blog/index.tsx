import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '../../layout';
import SEOHead from '../../components/seo/SEOHead';
import { BlogPost, BlogCategory } from '../../types/blog';
import { generateSlug } from '../../utils/seo';
import { generateWebsiteStructuredData } from '../../utils/structured-data';
import styles from './Blog.module.scss';

interface BlogPageProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  featuredPosts: BlogPost[];
}

const BlogPage: React.FC<BlogPageProps> = ({ posts, categories, featuredPosts }) => {
  const structuredData = generateWebsiteStructuredData({
    name: 'INBOLA Blog',
    description: 'Bolalar va ota-onalar uchun foydali maslahatlar, mahsulot tanlov qo\'llanmalari va xavfsizlik bo\'yicha maqolalar',
    url: 'https://inbola.uz/blog'
  });

  return (
    <Layout
      title="Blog - INBOLA Kids Marketplace"
      description="Bolalar va ota-onalar uchun foydali maslahatlar, mahsulot tanlov qo'llanmalari va xavfsizlik bo'yicha maqolalar"
      keywords="bolalar blog, ota-onalar uchun maslahatlar, o'yinchoq tanlash, maktab buyumlari, bolalar xavfsizligi"
    >
      <SEOHead
        title="Blog"
        description="Bolalar va ota-onalar uchun foydali maslahatlar, mahsulot tanlov qo'llanmalari va xavfsizlik bo'yicha maqolalar"
        keywords="bolalar blog, ota-onalar uchun maslahatlar, o'yinchoq tanlash, maktab buyumlari, bolalar xavfsizligi"
        structuredData={structuredData}
        canonicalUrl="https://inbola.uz/blog"
      />

      <div className={styles.blogPage}>
        {/* Blog Header */}
        <div className={styles.blogHeader}>
          <div className="container">
            <div className={styles.headerContent}>
              <h1 className={styles.title}>INBOLA Blog</h1>
              <p className={styles.subtitle}>
                Bolalar va ota-onalar uchun foydali maslahatlar, mahsulot tanlov qo'llanmalari va xavfsizlik bo'yicha maqolalar
              </p>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.blogContent}>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section className={styles.featuredSection}>
                <h2 className={styles.sectionTitle}>Tavsiya etiladigan maqolalar</h2>
                <div className={styles.featuredGrid}>
                  {featuredPosts.slice(0, 3).map((post) => (
                    <article key={post.id} className={styles.featuredCard}>
                      <Link href={`/blog/${post.slug}`} className={styles.featuredLink}>
                        <div className={styles.featuredImage}>
                          <Image
                            src={post.featured_image || '/img/blog-placeholder.jpg'}
                            alt={post.title.uz}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className={styles.image}
                          />
                          <div className={styles.categoryBadge}>
                            {post.category?.name.uz}
                          </div>
                        </div>
                        <div className={styles.featuredContent}>
                          <h3 className={styles.featuredTitle}>{post.title.uz}</h3>
                          <p className={styles.featuredExcerpt}>{post.excerpt.uz}</p>
                          <div className={styles.featuredMeta}>
                            <span className={styles.readTime}>{post.read_time} daqiqa o'qish</span>
                            <span className={styles.publishDate}>
                              {new Date(post.published_at).toLocaleDateString('uz-UZ')}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <div className={styles.blogMain}>
              {/* Categories Sidebar */}
              <aside className={styles.sidebar}>
                <div className={styles.categoriesWidget}>
                  <h3 className={styles.widgetTitle}>Kategoriyalar</h3>
                  <ul className={styles.categoriesList}>
                    {categories.map((category) => (
                      <li key={category.id} className={styles.categoryItem}>
                        <Link href={`/blog/category/${category.slug}`} className={styles.categoryLink}>
                          <span className={styles.categoryName}>{category.name.uz}</span>
                          <span className={styles.categoryCount}>({category.post_count || 0})</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Newsletter Signup */}
                <div className={styles.newsletterWidget}>
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

              {/* Blog Posts Grid */}
              <main className={styles.postsGrid}>
                <div className={styles.postsHeader}>
                  <h2 className={styles.postsTitle}>Barcha maqolalar</h2>
                  <div className={styles.postsFilter}>
                    <select className={styles.sortSelect}>
                      <option value="latest">Eng yangi</option>
                      <option value="popular">Mashhur</option>
                      <option value="oldest">Eng eski</option>
                    </select>
                  </div>
                </div>

                <div className={styles.posts}>
                  {posts.map((post) => (
                    <article key={post.id} className={styles.postCard}>
                      <Link href={`/blog/${post.slug}`} className={styles.postLink}>
                        <div className={styles.postImage}>
                          <Image
                            src={post.featured_image || '/img/blog-placeholder.jpg'}
                            alt={post.title.uz}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className={styles.image}
                          />
                          {post.category && (
                            <div className={styles.postCategory}>
                              {post.category.name.uz}
                            </div>
                          )}
                        </div>
                        <div className={styles.postContent}>
                          <h3 className={styles.postTitle}>{post.title.uz}</h3>
                          <p className={styles.postExcerpt}>{post.excerpt.uz}</p>
                          <div className={styles.postMeta}>
                            <div className={styles.postAuthor}>
                              <span>INBOLA Team</span>
                            </div>
                            <div className={styles.postInfo}>
                              <span className={styles.readTime}>{post.read_time} daq</span>
                              <span className={styles.publishDate}>
                                {new Date(post.published_at).toLocaleDateString('uz-UZ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>

                {/* Load More Button */}
                <div className={styles.loadMore}>
                  <button className={styles.loadMoreButton}>
                    Ko'proq yuklanmoqda...
                  </button>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  // In production, fetch from API
  // const posts = await fetchBlogPosts();
  // const categories = await fetchBlogCategories();

  // Sample data based on your requirements
  const categories: BlogCategory[] = [
    {
      id: 1,
      name: { uz: "Xavfsizlik maslahatlari", ru: "Советы по безопасности", en: "Safety Tips" },
      slug: "xavfsizlik-maslahatlari",
      description: { uz: "Bolalar xavfsizligi haqida", ru: "О безопасности детей", en: "About child safety" },
      post_count: 8,
      is_active: true
    },
    {
      id: 2,
      name: { uz: "Ta'lim", ru: "Образование", en: "Education" },
      slug: "talim",
      description: { uz: "Ta'lim va rivojlanish", ru: "Образование и развитие", en: "Education and development" },
      post_count: 12,
      is_active: true
    },
    {
      id: 3,
      name: { uz: "Ota-onalar uchun", ru: "Для родителей", en: "For Parents" },
      slug: "ota-onalar-uchun",
      description: { uz: "Ota-onalar uchun maslahatlar", ru: "Советы для родителей", en: "Tips for parents" },
      post_count: 15,
      is_active: true
    },
    {
      id: 4,
      name: { uz: "Mahsulot qo'llanmalari", ru: "Руководства по продуктам", en: "Product Guides" },
      slug: "mahsulot-qollanmalari",
      description: { uz: "Mahsulot tanlash qo'llanmalari", ru: "Руководства по выбору продуктов", en: "Product selection guides" },
      post_count: 10,
      is_active: true
    },
    {
      id: 5,
      name: { uz: "Xarid qilish maslahatlari", ru: "Советы по покупкам", en: "Shopping Tips" },
      slug: "xarid-qilish-maslahatlari",
      description: { uz: "Onlayn xarid qilish maslahatlari", ru: "Советы по онлайн покупкам", en: "Online shopping tips" },
      post_count: 6,
      is_active: true
    }
  ];

  const posts: BlogPost[] = [
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
        uz: "Ushbu maqolada biz bolalar uchun eng xavfsiz o'yinchoqlarni qanday tanlash kerakligini ko'rib chiqamiz...",
        ru: "В этой статье мы рассмотрим, как выбрать самые безопасные игрушки для детей...",
        en: "In this article, we will look at how to choose the safest toys for children..."
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
        uz: "xavfsiz o'yinchoqlar, bolalar o'yinchoqlari, sertifikatlangan o'yinchoqlar",
        ru: "безопасные игрушки, детские игрушки, сертифицированные игрушки",
        en: "safe toys, children's toys, certified toys"
      },
      category_id: 1,
      category: categories[0],
      status: 'published',
      is_featured: true,
      read_time: 8,
      views: 1245,
      published_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      title: {
        uz: "O'zbekistonda maktab uchun eng zarur 10 buyum",
        ru: "10 самых необходимых предметов для школы в Узбекистане",
        en: "10 most essential items for school in Uzbekistan"
      },
      slug: "maktab-uchun-eng-zarur-10-buyum",
      excerpt: {
        uz: "Maktab yili boshida bolalaringiz uchun eng muhim va zarur buyumlar ro'yxati.",
        ru: "Список самых важных и необходимых предметов для ваших детей к началу учебного года.",
        en: "List of the most important and necessary items for your children for the beginning of the school year."
      },
      content: {
        uz: "Maktab yili yaqinlashganda, ota-onalar o'z farzandlari uchun eng zarur buyumlarni tayyorlash bilan band bo'lishadi...",
        ru: "По мере приближения учебного года родители заняты подготовкой самых необходимых предметов для своих детей...",
        en: "As the school year approaches, parents are busy preparing the most necessary items for their children..."
      },
      featured_image: "/img/blog/school-essentials.jpg",
      seo_title: {
        uz: "Maktab uchun eng zarur 10 buyum - INBOLA",
        ru: "10 самых необходимых предметов для школы - INBOLA",
        en: "10 most essential items for school - INBOLA"
      },
      meta_description: {
        uz: "Maktab yili boshida bolalaringiz uchun eng muhim va zarur buyumlar ro'yxati.",
        ru: "Список самых важных и необходимых предметов для начала учебного года.",
        en: "List of most important and necessary items for the beginning of school year."
      },
      keywords: {
        uz: "maktab buyumlari, o'quv qurollari, daftar, ruchka, sumka",
        ru: "школьные принадлежности, учебные материалы, тетради, ручки, рюкзак",
        en: "school supplies, educational materials, notebooks, pens, backpack"
      },
      category_id: 4,
      category: categories[3],
      status: 'published',
      is_featured: true,
      read_time: 6,
      views: 987,
      published_at: '2024-01-20T14:30:00Z',
      created_at: '2024-01-18T12:00:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: 3,
      title: {
        uz: "Parent-approved: ota-onalar tanlagan top mahsulotlar",
        ru: "Parent-approved: топ продукты, выбранные родителями",
        en: "Parent-approved: top products chosen by parents"
      },
      slug: "ota-onalar-tanlagan-top-mahsulotlar",
      excerpt: {
        uz: "Minglab ota-onalar tomonidan sinovdan o'tgan va tavsiya etilgan eng yaxshi mahsulotlar.",
        ru: "Лучшие продукты, протестированные и рекомендованные тысячами родителей.",
        en: "Best products tested and recommended by thousands of parents."
      },
      content: {
        uz: "Har bir ota-ona o'z farzandi uchun eng yaxshi mahsulotlarni izlaydi...",
        ru: "Каждый родитель ищет лучшие продукты для своего ребенка...",
        en: "Every parent is looking for the best products for their child..."
      },
      featured_image: "/img/blog/parent-approved-products.jpg",
      seo_title: {
        uz: "Ota-onalar tanlagan top mahsulotlar - INBOLA",
        ru: "Топ продукты выбранные родителями - INBOLA",
        en: "Top products chosen by parents - INBOLA"
      },
      meta_description: {
        uz: "Minglab ota-onalar tomonidan sinovdan o'tgan va tavsiya etilgan eng yaxshi mahsulotlar.",
        ru: "Лучшие продукты, протестированные и рекомендованные тысячами родителей.",
        en: "Best products tested and recommended by thousands of parents."
      },
      keywords: {
        uz: "ota-onalar tanlagan, eng yaxshi mahsulotlar, tavsiya etilgan",
        ru: "выбранные родителями, лучшие продукты, рекомендуемые",
        en: "parent-approved, best products, recommended"
      },
      category_id: 3,
      category: categories[2],
      status: 'published',
      is_featured: true,
      read_time: 7,
      views: 1876,
      published_at: '2024-01-25T16:45:00Z',
      created_at: '2024-01-22T11:30:00Z',
      updated_at: '2024-01-25T16:45:00Z'
    }
  ];

  const featuredPosts = posts.filter(post => post.is_featured);

  return {
    props: {
      posts,
      categories,
      featuredPosts,
    },
    revalidate: 3600, // Revalidate every hour
  };
};

export default BlogPage;