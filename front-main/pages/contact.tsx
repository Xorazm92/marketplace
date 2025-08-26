import React from 'react';
import SEO from '../components/common/SEO';
import LocalBusinessSchema from '../components/common/LocalBusinessSchema';
import styles from '../styles/Contact.module.scss';

const ContactPage: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "INBOLA bilan bog'lanish",
    "description": "INBOLA Kids Marketplace bilan bog'lanish uchun ma'lumotlar",
    "url": "https://inbola.uz/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "INBOLA Kids Marketplace",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+998901234567",
          "contactType": "customer service",
          "email": "info@inbola.uz",
          "availableLanguage": "Uzbek"
        },
        {
          "@type": "ContactPoint",
          "telephone": "+998901234568",
          "contactType": "technical support",
          "email": "support@inbola.uz",
          "availableLanguage": "Uzbek"
        }
      ]
    }
  };

  return (
    <>
      <SEO 
        title="INBOLA bilan bog'lanish - Telefon, email, manzil"
        description="INBOLA Kids Marketplace bilan bog'lanish uchun barcha ma'lumotlar: telefon, email, manzil. Mijozlar xizmati 24/7 mavjud."
        keywords="INBOLA bilan bog'lanish, mijozlar xizmati, telefon, email, manzil, o'zbekiston, tashkent"
        structuredData={structuredData}
      />
      <LocalBusinessSchema />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Biz bilan bog'laning</h1>
          <p>Savollaringiz bormi? Biz sizga yordam beramiz</p>
        </div>

        <div className={styles.content}>
          <div className={styles.contactInfo}>
            <div className={styles.contactCard}>
              <h3>📞 Telefon</h3>
              <p>+998 90 123 45 67</p>
              <p>Dushanba - Yakshanba: 09:00 - 18:00</p>
            </div>

            <div className={styles.contactCard}>
              <h3>📧 Email</h3>
              <p>info@inbola.uz</p>
              <p>support@inbola.uz</p>
            </div>

            <div className={styles.contactCard}>
              <h3>📍 Manzil</h3>
              <p>Toshkent, O'zbekiston</p>
              <p>Ofis: Dushanba - Juma 09:00 - 18:00</p>
            </div>

            <div className={styles.contactCard}>
              <h3>💬 Telegram</h3>
              <p>@inbola_uz</p>
              <p>24/7 qo'llab-quvvatlash</p>
            </div>
          </div>

          <div className={styles.contactForm}>
            <h2>Xabar yozing</h2>
            <form>
              <div className={styles.formGroup}>
                <label htmlFor="name">Ismingiz</label>
                <input type="text" id="name" name="name" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject">Mavzu</label>
                <input type="text" id="subject" name="subject" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Xabar</label>
                <textarea id="message" name="message" rows={5} required></textarea>
              </div>

              <button type="submit" className={styles.submitBtn}>
                Xabar yuborish
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;






