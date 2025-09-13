"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import { FiSend } from 'react-icons/fi';
import { API_BASE_URL, API_PREFIX } from '@/endpoints/instance';

declare global {
  interface Window {
    TelegramLoginWidget: any;
  }
}

interface TelegramUserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  botName: string;
  buttonSize?: 'large' | 'medium' | 'small';
  lang?: string;
  requestAccess?: string;
  usePic?: boolean;
  className?: string;
  onAuthCallback?: (user: TelegramUserData) => void;
  onError?: (error: Error) => void;
  onLoad?: () => void;
}

const TelegramLoginButton: React.FC<TelegramLoginButtonProps> = ({
  botName,
  buttonSize = 'large',
  lang = 'en',
  requestAccess = 'write',
  usePic = true,
  className = '',
  onAuthCallback,
  onError,
  onLoad,
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [botUsername, setBotUsername] = useState<string>('');
  const router = useRouter();

  // Load Telegram script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
      onLoad?.();
    };
    script.onerror = (error) => {
      console.error('Error loading Telegram script:', error);
      onError?.(new Error('Failed to load Telegram script'));
    };

    document.body.appendChild(script);

    // Fetch bot username from backend
    const fetchBotUsername = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/telegram/bot-username`);
        if (response.ok) {
          const data = await response.json();
          setBotUsername(data.username);
        } else {
          console.error('Failed to fetch bot username');
          // Fallback to the provided botName if API fails
          setBotUsername(botName);
        }
      } catch (error) {
        console.error('Error fetching bot username:', error);
        setBotUsername(botName);
      }
    };

    fetchBotUsername();

    return () => {
      document.body.removeChild(script);
    };
  }, [botName, onError, onLoad]);

  const handleTelegramAuth = (userData: unknown) => {
    try {
      // Type guard to ensure we have valid user data
      const isValidUser = (data: any): data is TelegramUserData => {
        return (
          data &&
          typeof data === 'object' &&
          'id' in data &&
          'first_name' in data &&
          'auth_date' in data &&
          'hash' in data
        );
      };

      if (!isValidUser(userData)) {
        throw new Error('Invalid user data received from Telegram');
      }

      // Send the user data to your backend for verification
      fetch(`${API_BASE_URL}${API_PREFIX}/auth/telegram/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Telegram authentication failed');
          }
          return response.json();
        })
        .then((data) => {
          // Handle successful login
          onAuthCallback?.(userData);
          toast.success('Successfully logged in with Telegram');
          
          // Redirect to dashboard or previous page
          router.push('/dashboard');
        })
        .catch((error) => {
          console.error('Telegram auth error:', error);
          onError?.(error instanceof Error ? error : new Error(String(error)));
          toast.error('Failed to authenticate with Telegram');
        });
    } catch (error) {
      console.error('Error processing Telegram auth:', error);
      onError?.(error instanceof Error ? error : new Error(String(error)));
      toast.error('Error processing Telegram authentication');
    }
  };

  // Render the button that will be used to initialize the Telegram widget
  return (
    <div className={`telegram-login-button ${className}`}>
      {scriptLoaded && botUsername ? (
<div
          className="telegram-login-button"
          data-telegram-login={botUsername}
          data-size={buttonSize}
          data-request-access={requestAccess}
          data-userpic={usePic}
          data-lang={lang}
          ref={(node) => {
            if (node && !node.hasAttribute('data-callback-set')) {
              node.setAttribute('data-callback-set', 'true');
              // Use window.TelegramLoginWidget to handle the auth callback
              window.TelegramLoginWidget = {
                dataOnauth: (user: string) => {
                  try {
                    const userData = JSON.parse(user);
                    handleTelegramAuth(userData);
                  } catch (error) {
                    console.error('Error parsing Telegram user data:', error);
                    onError?.(new Error('Invalid user data from Telegram'));
                  }
                }
              };
              node.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)');
            }
          }}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          disabled={!scriptLoaded || !botUsername}
        >
          <FiSend className="text-blue-500" />
          <span>Login with Telegram</span>
        </Button>
      )}
    </div>
  );
};

export default TelegramLoginButton;
