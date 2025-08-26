import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="uz">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#f56500" />
        <meta name="description" content="INBOLA - Bolalar uchun eng yaxshi mahsulotlar. Kiyim, o'yinchoqlar, kitoblar va boshqa zarur narsalar. Xavfsiz va sifatli mahsulotlar faqat bolalar uchun." />
        <meta name="keywords" content="bolalar, o'yinchoqlar, kiyim, kitoblar, maktab, chaqaloq, sport, elektronika, o'zbekiston, tashkent, online do'kon, xavfsiz mahsulotlar, bolalar uchun, ota-ona, ta'lim" />
        <meta name="author" content="INBOLA Team" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://inbola.uz" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="INBOLA - Bolalar uchun xavfsiz onlayn do'kon" />
        <meta property="og:description" content="Bolalar uchun eng yaxshi mahsulotlar - kiyim, o'yinchoqlar, ta'lim materiallari va boshqa zarur narsalar. Xavfsiz va sifatli mahsulotlar." />
        <meta property="og:image" content="https://inbola.uz/img/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="INBOLA Kids Marketplace - Bolalar uchun xavfsiz do'kon" />
        <meta property="og:url" content="https://inbola.uz" />
        <meta property="og:site_name" content="INBOLA Kids Marketplace" />
        <meta property="og:locale" content="uz_UZ" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="INBOLA - Bolalar uchun xavfsiz onlayn do'kon" />
        <meta property="twitter:description" content="Bolalar uchun eng yaxshi mahsulotlar - kiyim, o'yinchoqlar, ta'lim materiallari va boshqa zarur narsalar." />
        <meta property="twitter:image" content="https://inbola.uz/img/og-image.jpg" />
        <meta property="twitter:image:alt" content="INBOLA Kids Marketplace" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#f56500" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            })
          }}
        />

        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "INBOLA Kids Marketplace",
              "url": "https://inbola.uz",
              "logo": "https://inbola.uz/icons/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+998901234567",
                "contactType": "customer service",
                "email": "info@inbola.uz"
              },
              "sameAs": [
                "https://facebook.com/inbola.uz",
                "https://instagram.com/inbola.uz",
                "https://telegram.me/inbola_uz"
              ]
            })
          }}
        />

        {/* Structured Data - LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
              "currenciesAccepted": "UZS"
            })
          }}
        />
        
        {/* Additional SEO meta tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="INBOLA" />
        
        {/* Performance optimizations */}
        <link rel="preload" href="/fonts/SF-Pro-Display-Regular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/SF-Pro-Display-Medium.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/SF-Pro-Display-Bold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
