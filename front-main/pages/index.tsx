import React from 'react';
import Head from 'next/head';
import EtsyStyleHero from '../components/marketplace/EtsyStyleHero';
import FeaturedProducts from '../components/marketplace/FeaturedProducts';
import SpecialOffers from '../components/marketplace/SpecialOffers';
import TrendingProducts from '../components/marketplace/TrendingProducts';

export default function Home() {
  return (
    <>
      <Head>
        <title>INBOLA - Bolalar uchun xavfsiz onlayn do'kon | Kiyim, o'yinchoqlar, kitoblar</title>
        <meta 
          name="description" 
          content="Bolalar uchun eng yaxshi mahsulotlar - kiyim, o'yinchoqlar, ta'lim materiallari va boshqa zarur narsalar. Xavfsiz va sifatli mahsulotlar faqat bolalar uchun. Tez yetkazib berish, xavfsiz to'lov."
        />
        <meta 
          name="keywords" 
          content="bolalar uchun do'kon, o'yinchoqlar, kiyim, kitoblar, maktab buyumlari, chaqaloq mahsulotlari, sport jihozlari, elektronika, o'zbekiston, tashkent, online do'kon, xavfsiz mahsulotlar, tez yetkazib berish"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Main Content */}
        <main className="space-y-0">
          {/* Hero Section */}
          <EtsyStyleHero />

          {/* Featured Products */}
          <div className="py-8 bg-gray-50">
            <FeaturedProducts />
          </div>


          {/* Special Offers */}
          <div className="py-8 bg-gradient-to-br from-orange-50 to-pink-50">
            <SpecialOffers />
          </div>

          {/* Trending Products */}
          <div className="py-8 bg-gray-50">
            <TrendingProducts />
          </div>
        </main>
      </div>
    </>
  );
}
