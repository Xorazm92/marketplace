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

          {/* Call to Action - View All Products */}
          <div className="py-16 bg-white">
            <div className="max-w-4xl mx-auto text-center px-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Barcha Mahsulotlarni Ko'ring
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Bolalar uchun minglab xavfsiz va sifatli mahsulotlar
              </p>
              <a
                href="/products"
                className="inline-flex items-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
              >
                Barcha Mahsulotlar
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
