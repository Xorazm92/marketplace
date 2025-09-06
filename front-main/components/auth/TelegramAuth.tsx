import React, { useEffect, useState } from 'react';
import { loginWithTelegram, getTelegramBotInfo } from '../../endpoints/auth-providers';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramAuthProps {
  onSuccess?: (userData: any) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

const TelegramAuth: React.FC<TelegramAuthProps> = ({ onSuccess, onError }) => {
  const [botUsername, setBotUsername] = useState<string>('inbola_marketplace_bot');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get bot info from backend
    const fetchBotInfo = async () => {
      try {
        const botInfo = await getTelegramBotInfo();
        if (botInfo?.botUsername) {
          setBotUsername(botInfo.botUsername);
        }
      } catch (error) {
        console.error('Failed to get bot info:', error);
      }
    };

    fetchBotInfo();

    // Global function for Telegram widget callback
    window.onTelegramAuth = async (user: TelegramUser) => {
      setIsLoading(true);
      
      try {
        const result = await loginWithTelegram(user);
        
        if (result && result.success) {
          onSuccess?.(result);
        } else {
          onError?.('Telegram authentication failed');
        }
      } catch (error: any) {
        console.error('Telegram auth error:', error);
        onError?.(error.message || 'Telegram authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    // Load Telegram widget script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?19';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      // Cleanup
      if (container && script.parentNode) {
        container.removeChild(script);
      }
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [botUsername, onSuccess, onError]);

  return (
    <div className="telegram-auth-container">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Telegram orqali kirish</h3>
        <p className="text-sm text-gray-600 mb-4">
          Telegram akkauntingiz orqali tez va xavfsiz kirish
        </p>
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">Telegram orqali kirilmoqda...</span>
        </div>
      )}
      
      <div id="telegram-login-container" className="flex justify-center">
        {/* Telegram widget will be inserted here */}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
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

export default TelegramAuth;
