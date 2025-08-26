const LocalBusinessSchema = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "INBOLA Kids Marketplace",
    "description": "Bolalar uchun xavfsiz onlayn do'kon",
    "url": "https://inbola.uz",
    "telephone": "+998901234567",
    "email": "info@inbola.uz",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Toshkent",
      "addressCountry": "UZ",
      "addressRegion": "Toshkent"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 41.2995,
      "longitude": 69.2401
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday", 
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "priceRange": "$$",
    "paymentAccepted": ["Cash", "Credit Card", "Online Payment"],
    "currenciesAccepted": "UZS",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Bolalar mahsulotlari",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "O'yinchoqlar"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "Kiyim"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product", 
            "name": "Kitoblar"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

export default LocalBusinessSchema;






