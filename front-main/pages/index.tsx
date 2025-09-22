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
          <div className="py-4 bg-gray-50">
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

          {/* Call to Action - Optimized */}
          <div className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-6xl mx-auto text-center px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Ko'proq Mahsulotlar
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Bolalar uchun xavfsiz va sifatli mahsulotlar
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/products"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Barcha Mahsulotlar
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <a
                  href="/categories"
                  className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition-colors duration-200"
                >
                  Kategoriyalar
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
