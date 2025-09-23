import { useRouter } from 'next/router';
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi';
import Head from 'next/head';
import styles from '../styles/404.module.scss';

export default function Custom404() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const handleSearch = () => {
    router.push('/search');
  };

  return (
    <>
      <Head>
        <title>404 - Sahifa Topilmadi | InBola Marketplace</title>
        <meta name="description" content="Afsuski, siz qidirgan sahifa topilmadi. Asosiy sahifaga qaytishni taklif qilamiz." />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.container}>
        <div className={styles.content}>
          {/* Header */}
          <header className={styles.header}>
            <img src="/inbola-logo.png" alt="InBola" className={styles.logo} />
          </header>

          {/* Main Content */}
          <main className={styles.mainContent}>
            <div className={styles.textSection}>
              <h1 className={styles.title}>404</h1>
              <h2 className={styles.subtitle}>Sahifa Topilmadi</h2>
              <p className={styles.description}>
                Afsuski, siz qidirgan sahifa mavjud emas yoki o'chirilgan.
                <br />
                Lekin bizda ko'plab boshqa ajoyib mahsulotlar bor!
              </p>

              <div className={styles.suggestions}>
                <h3 className={styles.suggestionsTitle}>Sizga yordam bera oladigan ishlar:</h3>
                <ul className={styles.suggestionList}>
                  <li>Asosiy sahifaga qaytish va yangi mahsulotlarni ko'rish</li>
                  <li>Izlanayotgan mahsulotingizni qidirish</li>
                  <li>Bizning eng mashhur kategoriyalarimizga nazar tashlash</li>
                </ul>
              </div>
            </div>

            <div className={styles.imageSection}>
              <img
                src="/not-found.png"
                alt="404 - Sahifa Topilmadi"
                className={styles.notFoundImage}
              />
            </div>
          </main>

          {/* Actions */}
          <div className={styles.actions}>
            <button
              onClick={handleGoHome}
              className={`${styles.actionBtn} ${styles.primaryBtn}`}
            >
              <FiHome size={18} />
              Asosiy Sahifaga
            </button>

            <button
              onClick={handleSearch}
              className={`${styles.actionBtn} ${styles.secondaryBtn}`}
            >
              <FiSearch size={18} />
              Qidirish
            </button>

            <button
              onClick={handleGoBack}
              className={`${styles.actionBtn} ${styles.tertiaryBtn}`}
            >
              <FiArrowLeft size={18} />
              Orqaga
            </button>
          </div>

          {/* Footer */}
          <footer className={styles.footer}>
            <div className={styles.footerContent}>
              <div className={styles.footerSection}>
                <h4>Muammo davom etsa:</h4>
                <div className={styles.contactInfo}>
                  <a href="tel:+998901234567" className={styles.contactLink}>
                    📞 +998 90 123 45 67
                  </a>
                  <a href="mailto:support@inbola.uz" className={styles.contactLink}>
                    ✉️ support@inbola.uz
                  </a>
                </div>
              </div>

              <div className={styles.footerSection}>
                <h4>Bizning ijtimoiy tarmoqlar:</h4>
                <div className={styles.socialLinks}>
                  <a href="#" className={styles.socialLink}>Telegram</a>
                  <a href="#" className={styles.socialLink}>Instagram</a>
                  <a href="#" className={styles.socialLink}>Facebook</a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
