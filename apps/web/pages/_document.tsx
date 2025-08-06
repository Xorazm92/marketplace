import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="uz">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#f56500" />
        <meta name="description" content="INBOLA - Bolalar uchun eng yaxshi mahsulotlar. Kiyim, o'yinchoqlar, kitoblar va boshqa zarur narsalar." />
        <meta name="keywords" content="bolalar, o'yinchoqlar, kiyim, kitoblar, maktab, chaqaloq, sport, elektronika" />
        <meta name="author" content="INBOLA Team" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="INBOLA - Bolalar Bozori" />
        <meta property="og:description" content="Bolalar uchun eng yaxshi mahsulotlar - kiyim, o'yinchoqlar, ta'lim materiallari va boshqa zarur narsalar." />
        <meta property="og:image" content="/img/og-image.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="INBOLA - Bolalar Bozori" />
        <meta property="twitter:description" content="Bolalar uchun eng yaxshi mahsulotlar - kiyim, o'yinchoqlar, ta'lim materiallari va boshqa zarur narsalar." />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
