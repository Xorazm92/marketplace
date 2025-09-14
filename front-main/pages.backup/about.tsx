import React from 'react';
import SEO from '../components/common/SEO';
import LocalBusinessSchema from '../components/common/LocalBusinessSchema';
import styles from '../styles/About.module.scss';

const AboutPage: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "INBOLA haqida",
    "description": "INBOLA - Bolalar uchun xavfsiz onlayn do'kon haqida ma'lumot",
    "url": "https://inbola.uz/about",
    "mainEntity": {
      "@type": "Organization",
      "name": "INBOLA Kids Marketplace",
      "description": "Bolalar uchun xavfsiz va sifatli mahsulotlar yetkazib beruvchi onlayn do'kon",
      "foundingDate": "2024",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Toshkent",
        "addressCountry": "UZ",
        "addressRegion": "Toshkent"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+998901234567",
        "contactType": "customer service",
        "email": "info@inbola.uz"
      }
    }
  };

  return (
    <>
      <SEO 
        title="INBOLA haqida - Bolalar uchun xavfsiz onlayn do'kon"
        description="INBOLA - 2024 yilda tashkil topgan bolalar uchun xavfsiz onlayn do'kon. Bizning maqsad - bolalar uchun sifatli va xavfsiz mahsulotlarni yetkazib berish."
        keywords="INBOLA haqida, bolalar do'koni, xavfsiz mahsulotlar, o'zbekiston, tashkent, online do'kon, bolalar uchun"
        structuredData={structuredData}
      />
      <LocalBusinessSchema />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>INBOLA haqida</h1>
          <p>Bolalar uchun xavfsiz va sifatli mahsulotlar</p>
        </div>

        <div className={styles.content}>
          <section className={styles.mission}>
            <h2>Bizning maqsad</h2>
            <p>
              INBOLA 2024 yilda tashkil topgan va bolalar uchun xavfsiz, sifatli va 
              arzon mahsulotlarni yetkazib berish maqsadida ishlaydi. Biz ota-onalar 
              uchun ishonchli platforma bo'lishni va bolalar uchun eng yaxshi 
              mahsulotlarni taqdim etishni maqsad qilganmiz.
            </p>
          </section>

          <section className={styles.values}>
            <h2>Bizning qadriyatlar</h2>
            <div className={styles.valuesGrid}>
              <div className={styles.value}>
                <h3>Xavfsizlik</h3>
                <p>Barcha mahsulotlarimiz bolalar uchun xavfsiz va sifatli</p>
              </div>
              <div className={styles.value}>
                <h3>Ishonchlilik</h3>
                <p>Mijozlarimizga ishonchli xizmat ko'rsatish</p>
              </div>
              <div className={styles.value}>
                <h3>Sifat</h3>
                <p>Yuqori sifatli mahsulotlarni taqdim etish</p>
              </div>
              <div className={styles.value}>
                <h3>Tezlik</h3>
                <p>Tez va qulay yetkazib berish xizmati</p>
              </div>
            </div>
          </section>

          <section className={styles.contact}>
            <h2>Biz bilan bog'laning</h2>
            <div className={styles.contactInfo}>
              <div>
                <h3>Telefon</h3>
                <p>+998 90 123 45 67</p>
              </div>
              <div>
                <h3>Email</h3>
                <p>info@inbola.uz</p>
              </div>
              <div>
                <h3>Manzil</h3>
                <p>Toshkent, O'zbekiston</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default AboutPage;






