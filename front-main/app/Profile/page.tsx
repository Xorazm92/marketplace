'use client';

import React from 'react';
import { User, Settings, ShoppingBag, Heart, LogOut } from 'lucide-react';

const ProfilePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <User className="text-blue-500" size={32} />
        <h1 className="text-3xl font-bold text-gray-800">Profil</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Shaxsiy Ma'lumotlar</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="text-gray-400" size={20} />
              <span className="text-gray-600">Ism: Foydalanuvchi</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">@</span>
              <span className="text-gray-600">Email: user@example.com</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Tezkor Amallar</h2>
          <div className="space-y-3">
            <a href="/Settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="text-gray-500" size={20} />
              <span>Sozlamalar</span>
            </a>
            <a href="/cart" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <ShoppingBag className="text-gray-500" size={20} />
              <span>Savat</span>
            </a>
            <a href="/Favorites" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Heart className="text-gray-500" size={20} />
              <span>Sevimlilar</span>
            </a>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-8 text-center">
        <button className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
          <LogOut className="mr-2" size={20} />
          Chiqish
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
