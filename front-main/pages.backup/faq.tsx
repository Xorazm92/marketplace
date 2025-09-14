import React, { useState } from 'react';
import SEO from '../components/common/SEO';
import FAQSchema from '../components/common/FAQSchema';
import styles from '../styles/FAQ.module.scss';

const FAQPage: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      question: "INBOLA da qanday mahsulotlar mavjud?",
      answer: "INBOLA da bolalar uchun barcha zarur mahsulotlar mavjud: kiyim-kechak, o'yinchoqlar, kitoblar, sport anjomlar, maktab buyumlari, chaqaloq buyumlari va boshqalar."
    },
    {
      question: "Yetkazib berish qancha vaqt oladi?",
      answer: "Toshkent shahri ichida 1-2 kun, viloyatlarga 3-5 kun ichida yetkazib beramiz. Tezkor yetkazib berish xizmati ham mavjud."
    },
    {
      question: "To'lov qanday amalga oshiriladi?",
      answer: "Naqd pul, bank kartasi, Click, Payme va boshqa to'lov tizimlari orqali to'lov qilishingiz mumkin. Xavfsiz va qulay."
    },
    {
      question: "Mahsulot sifatini qanday kafolatlaysiz?",
      answer: "Barcha mahsulotlarimiz sertifikatlangan va bolalar uchun xavfsiz. Agar mahsulot sizga yoqmagan bo'lsa, 14 kun ichida qaytarishingiz mumkin."
    },
    {
      question: "Chegirmalar qanday ishlaydi?",
      answer: "Doimiy mijozlar uchun chegirmalar, yangi mahsulotlar uchun aksiyalar va maxsus kunlar uchun katta chegirmalar mavjud."
    },
    {
      question: "Mahsulot qaytarish qanday amalga oshiriladi?",
      answer: "Mahsulotni 14 kun ichida qaytarishingiz mumkin. Mahsulot buzilmagan holatda bo'lishi kerak. Qaytarish bepul."
    },
    {
      question: "Kuryer xizmati qancha narxda?",
      answer: "Toshkent shahri ichida 15,000 so'm, viloyatlarga 25,000 so'm. 500,000 so'mdan ortiq buyurtmalarda bepul yetkazib berish."
    },
    {
      question: "Mahsulotlar haqida ma'lumot qayerdan olish mumkin?",
      answer: "Har bir mahsulot sahifasida batafsil ma'lumot, rasmlar va mijozlar fikrlari mavjud. Savollaringiz bo'lsa, biz bilan bog'laning."
    }
  ];

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <>
      <SEO 
        title="Ko'p so'raladigan savollar (FAQ) - INBOLA Kids Marketplace"
        description="INBOLA Kids Marketplace haqida ko'p so'raladigan savollar va javoblar. Yetkazib berish, to'lov, qaytarish va boshqa savollar."
        keywords="FAQ, ko'p so'raladigan savollar, yetkazib berish, to'lov, qaytarish, mahsulot sifat, kuryer xizmati, INBOLA"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }}
      />
      <FAQSchema faqs={faqs} />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Ko'p so'raladigan savollar</h1>
          <p>INBOLA haqida eng ko'p so'raladigan savollar va javoblar</p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <button
                className={`${styles.question} ${openItems.includes(index) ? styles.active : ''}`}
                onClick={() => toggleItem(index)}
              >
                <span>{faq.question}</span>
                <span className={styles.arrow}>
                  {openItems.includes(index) ? '−' : '+'}
                </span>
              </button>
              {openItems.includes(index) && (
                <div className={styles.answer}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.contactSection}>
          <h2>Savolingizga javob topa olmadingizmi?</h2>
          <p>Biz bilan bog'laning va sizga yordam beramiz</p>
          <a href="/contact" className={styles.contactBtn}>
            Biz bilan bog'laning
          </a>
        </div>
      </div>
    </>
  );
};

export default FAQPage;






