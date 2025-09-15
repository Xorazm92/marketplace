'use client';

import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

const CartPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="text-blue-600" size={32} />
        <h1 className="text-3xl font-bold text-gray-800">Savatcha</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Savatcha bo'sh
          </h2>
          <p className="text-gray-500 mb-6">
            Hozircha savatchangizda hech qanday mahsulot yo'q
          </p>
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xarid qilishni boshlash
          </a>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
