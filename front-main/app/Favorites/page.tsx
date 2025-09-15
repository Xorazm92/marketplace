'use client';

import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';

const FavoritesPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="text-red-500" size={32} />
        <h1 className="text-3xl font-bold text-gray-800">Sevimlilar</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <Heart className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Sevimlilar ro'yxati bo'sh
          </h2>
          <p className="text-gray-500 mb-6">
            Hozircha sevimlilar ro'yxatingizda hech qanday mahsulot yo'q
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <ShoppingCart className="mr-2" size={20} />
            Xarid qilishni boshlash
          </a>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
