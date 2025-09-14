import { HomePage } from "../app";
import SEO from "@/components/common/SEO";

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "INBOLA Kids Marketplace",
    "description": "Bolalar uchun xavfsiz onlayn do'kon",
    "url": "https://inbola.uz",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://inbola.uz/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "INBOLA",
      "logo": {
        "@type": "ImageObject",
        "url": "https://inbola.uz/icons/logo.png"
      }
    }
  };

  return (
    <>
      <SEO 
        title="INBOLA - Bolalar uchun xavfsiz onlayn do'kon | Kiyim, o'yinchoqlar, kitoblar"
        description="Bolalar uchun eng yaxshi mahsulotlar - kiyim, o'yinchoqlar, ta'lim materiallari va boshqa zarur narsalar. Xavfsiz va sifatli mahsulotlar faqat bolalar uchun. Tez yetkazib berish, xavfsiz to'lov."
        keywords="bolalar uchun do'kon, o'yinchoqlar, kiyim, kitoblar, maktab buyumlari, chaqaloq mahsulotlari, sport jihozlari, elektronika, o'zbekiston, tashkent, online do'kon, xavfsiz mahsulotlar, tez yetkazib berish"
        structuredData={structuredData}
      />
      <main>
        <HomePage />
      </main>
    </>
  );
}
