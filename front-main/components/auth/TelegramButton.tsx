"use client";

import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { FiSend } from 'react-icons/fi';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramButtonProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

const TelegramButton: React.FC<TelegramButtonProps> = ({ 
  onSuccess, 
  onError, 
  className = "" 
}) => {
  const [botUsername, setBotUsername] = useState<string>('inbola_marketplace_bot');
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch bot username from backend
    const fetchBotUsername = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/telegram/bot-username`);
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setBotUsername(data.username || data.botUsername || 'inbola_marketplace_bot');
          }
        } else {
          console.error('Failed to fetch bot username');
          if (isMounted) {
            setBotUsername('inbola_marketplace_bot');
          }
        }
      } catch (error) {
        console.error('Error fetching bot username:', error);
        if (isMounted) {
          setBotUsername('inbola_marketplace_bot');
        }
      }
    };

    fetchBotUsername();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!botUsername) return;

    // Global function for Telegram widget callback
    window.onTelegramAuth = async (user: TelegramUser) => {
      setIsLoading(true);
      
      try {
        console.log('Telegram user data received:', user);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/telegram/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });

        const result = await response.json();
        
        if (result.success && result.token) {
          // Save tokens to localStorage
          localStorage.setItem('accessToken', result.token);
          localStorage.setItem('refreshToken', result.refreshToken);
          localStorage.setItem('user_data', JSON.stringify(result.user));
          
          toast.success(`Xush kelibsiz, ${user.first_name}!`);
          onSuccess?.(result);
          
          // Redirect to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else {
          throw new Error(result.error || 'Telegram authentication failed');
        }
      } catch (error: any) {
        console.error('Telegram auth error:', error);
        const errorMessage = error.message || 'Telegram orqali kirish xatoligi';
        toast.error(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    // Load Telegram widget script
    if (!scriptRef.current && containerRef.current) {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');
      script.async = true;
      
      script.onload = () => {
        setScriptLoaded(true);
      };
      
      script.onerror = (error) => {
        console.error('Error loading Telegram script:', error);
        toast.error('Telegram widget yuklanmadi');
      };

      containerRef.current.appendChild(script);
      scriptRef.current = script;
    }

    return () => {
      // Cleanup
      if (scriptRef.current && containerRef.current && containerRef.current.contains(scriptRef.current)) {
        containerRef.current.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      if (window.onTelegramAuth) {
        window.onTelegramAuth = undefined as any;
      }
    };
  }, [botUsername, onSuccess, onError]);

  return (
    <div className={`telegram-auth-container ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Telegram orqali kirish</h3>
        <p className="text-sm text-gray-600 mb-4">
          Telegram akkauntingiz orqali tez va xavfsiz ro'yxatdan o'ting
        </p>
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-blue-700">Telegram orqali kirilmoqda...</span>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="flex justify-center min-h-[50px] items-center"
      >
        {!scriptLoaded && botUsername && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-pulse bg-blue-100 rounded-lg px-6 py-3">
              <span className="text-blue-600">Telegram widget yuklanmoqda...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          Telegram orqali kirishda siz bizning{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">
            Maxfiylik siyosati
          </a>{' '}
          va{' '}
          <a href="/terms" className="text-blue-600 hover:underline">
            Foydalanish shartlari
          </a>
          ga rozilik bildirasiz.
        </p>
      </div>
    </div>
  );
};

export default TelegramButton;
