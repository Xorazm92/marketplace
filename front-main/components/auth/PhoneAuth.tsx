'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, API_PREFIX } from '@/endpoints/instance';

interface PhoneAuthProps {
  mode: 'login' | 'register';
  onSuccess?: (user: any, tokens: any) => void;
  onModeChange?: (mode: 'login' | 'register') => void;
}

interface FormData {
  phone_number: string;
  otp_code: string;
  first_name: string;
  last_name: string;
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({ mode, onSuccess, onModeChange }) => {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    phone_number: '',
    otp_code: '',
    first_name: '',
    last_name: '',
  });

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as +998 XX XXX XX XX
    if (digits.length <= 3) {
      return `+998 ${digits}`;
    } else if (digits.length <= 5) {
      return `+998 ${digits.slice(3, 5)} ${digits.slice(5)}`;
    } else if (digits.length <= 8) {
      return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    } else {
      return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
    }
  };

  // Validate phone number
  const isValidPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 12 && digits.startsWith('998');
  };

  // Send OTP
  const sendOtp = async () => {
    if (!isValidPhone(formData.phone_number)) {
      toast.error('Telefon raqamini to\'g\'ri kiriting');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = '+' + formData.phone_number.replace(/\D/g, '');
      
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/phone-auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: cleanPhone,
          purpose: mode === 'register' ? 'registration' : 'login',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('OTP kod yuborildi');
        setStep('otp');
        setCountdown(60); // 60 seconds countdown
      } else {
        toast.error(data.message || 'OTP yuborishda xatolik');
      }
    } catch (error) {
      toast.error('Tarmoq xatosi');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and login/register
  const verifyOtp = async () => {
    if (!formData.otp_code || formData.otp_code.length !== 6) {
      toast.error('6 raqamli OTP kodni kiriting');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = '+' + formData.phone_number.replace(/\D/g, '');
      
      if (mode === 'login') {
        // Login with phone
        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/phone-auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number: cleanPhone,
            otp_code: formData.otp_code,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Muvaffaqiyatli kirildi!');
          onSuccess?.(data.user, data.tokens);
          router.push('/dashboard');
        } else {
          toast.error(data.message || 'Kirishda xatolik');
        }
      } else {
        // Check if we need user details
        if (!formData.first_name || !formData.last_name) {
          setStep('details');
          return;
        }

        // Register with phone
        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/phone-auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number: cleanPhone,
            otp_code: formData.otp_code,
            first_name: formData.first_name,
            last_name: formData.last_name,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Muvaffaqiyatli ro\'yxatdan o\'tildi!');
          onSuccess?.(data.user, data.tokens);
          router.push('/dashboard');
        } else {
          toast.error(data.message || 'Ro\'yxatdan o\'tishda xatolik');
        }
      }
    } catch (error) {
      toast.error('Tarmoq xatosi');
    } finally {
      setLoading(false);
    }
  };

  // Complete registration with user details
  const completeRegistration = async () => {
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('Ism va familiyani kiriting');
      return;
    }

    await verifyOtp();
  };

  // Resend OTP
  const resendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    try {
      const cleanPhone = '+' + formData.phone_number.replace(/\D/g, '');
      
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/phone-auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: cleanPhone,
          purpose: mode === 'register' ? 'registration' : 'login',
        }),
      });

      if (response.ok) {
        toast.success('OTP qayta yuborildi');
        setCountdown(60);
      } else {
        const data = await response.json();
        toast.error(data.message || 'OTP qayta yuborishda xatolik');
      }
    } catch (error) {
      toast.error('Tarmoq xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
        </h2>
        <p className="text-gray-600 mt-2">
          Telefon raqamingizga SMS kod yuboriladi
        </p>
      </div>

      {step === 'phone' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon raqami
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => {
                const formatted = formatPhoneNumber(e.target.value);
                setFormData({ ...formData, phone_number: formatted });
              }}
              placeholder="+998 XX XXX XX XX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={17}
            />
          </div>
          
          <button
            onClick={sendOtp}
            disabled={loading || !isValidPhone(formData.phone_number)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Yuborilmoqda...' : 'OTP kod yuborish'}
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SMS kod
            </label>
            <input
              type="text"
              value={formData.otp_code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setFormData({ ...formData, otp_code: value });
              }}
              placeholder="123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
              maxLength={6}
            />
            <p className="text-sm text-gray-600 mt-1">
              {formData.phone_number} raqamiga yuborilgan 6 raqamli kodni kiriting
            </p>
          </div>

          <button
            onClick={verifyOtp}
            disabled={loading || formData.otp_code.length !== 6}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
          </button>

          <div className="text-center">
            <button
              onClick={resendOtp}
              disabled={countdown > 0 || loading}
              className="text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {countdown > 0 ? `Qayta yuborish (${countdown}s)` : 'Qayta yuborish'}
            </button>
          </div>

          <button
            onClick={() => setStep('phone')}
            className="w-full text-gray-600 hover:text-gray-800"
          >
            ← Telefon raqamini o'zgartirish
          </button>
        </div>
      )}

      {step === 'details' && mode === 'register' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ism
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Ismingizni kiriting"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Familiya
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Familiyangizni kiriting"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={completeRegistration}
            disabled={loading || !formData.first_name.trim() || !formData.last_name.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Yakunlanmoqda...' : 'Ro\'yxatdan o\'tishni yakunlash'}
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {mode === 'login' ? 'Hisobingiz yo\'qmi?' : 'Hisobingiz bormi?'}
          <button
            onClick={() => onModeChange?.(mode === 'login' ? 'register' : 'login')}
            className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
          >
            {mode === 'login' ? 'Ro\'yxatdan o\'tish' : 'Kirish'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default PhoneAuth;
