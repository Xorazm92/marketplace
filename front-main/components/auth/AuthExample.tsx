import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import TelegramAuth from './TelegramAuth';
import GoogleAuth from './GoogleAuth';

const AuthExample: React.FC = () => {
  const { user, isAuthenticated, isLoading, loginSMS, logout } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);

  // SMS login handler
  const handleSMSLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !smsCode) return;

    setSmsLoading(true);
    try {
      await loginSMS(phoneNumber, smsCode);
      console.log('SMS login successful!');
    } catch (error) {
      console.error('SMS login failed:', error);
    } finally {
      setSmsLoading(false);
    }
  };

  // Telegram success handler
  const handleTelegramSuccess = (userData: any) => {
    console.log('Telegram login successful:', userData);
    // User automatically logged in via useAuth hook
  };

  // Google success handler  
  const handleGoogleSuccess = (userData: any) => {
    console.log('Google login successful:', userData);
    // User automatically logged in via useAuth hook
  };

  // Error handler
  const handleAuthError = (error: string) => {
    console.error('Authentication error:', error);
    alert(`Login xatolik: ${error}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Muvaffaqiyatli kirildi!</h2>
        
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Foydalanuvchi ma'lumotlari:</h3>
          <p><strong>Ism:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Provider:</strong> {user.provider}</p>
          {user.email && <p><strong>Email:</strong> {user.email}</p>}
          {user.username && <p><strong>Username:</strong> @{user.username}</p>}
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold mb-2">Token ma'lumotlari:</h3>
          <p><strong>Access Token:</strong> {localStorage.getItem('accessToken')?.substring(0, 20)}...</p>
          <p><strong>Refresh Token:</strong> {localStorage.getItem('refreshToken')?.substring(0, 20)}...</p>
        </div>

        <button
          onClick={logout}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Chiqish
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">INBOLA Marketplace</h1>
      
      {/* Google Authentication */}
      <div className="mb-6">
        <GoogleAuth 
          onSuccess={handleGoogleSuccess}
          onError={handleAuthError}
        />
      </div>

      {/* Telegram Authentication */}
      <div className="mb-6">
        <TelegramAuth 
          onSuccess={handleTelegramSuccess}
          onError={handleAuthError}
        />
      </div>

      {/* SMS Authentication */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">SMS orqali kirish</h3>
        <form onSubmit={handleSMSLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon raqam
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+998901234567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMS kod
            </label>
            <input
              type="text"
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value)}
              placeholder="123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={smsLoading || !phoneNumber || !smsCode}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {smsLoading ? 'Tekshirilmoqda...' : 'SMS orqali kirish'}
          </button>
        </form>
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded text-sm">
        <h4 className="font-semibold mb-2">Debug ma'lumotlari:</h4>
        <p>Backend: http://localhost:4000</p>
        <p>Auth Endpoints: /api/auth/*</p>
        <p>CORS: Configured for port 4000</p>
      </div>
    </div>
  );
};

export default AuthExample;
