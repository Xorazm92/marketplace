'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

// Extend the window interface to close the auth popup if it exists
declare global {
  interface Window {
    googleAuthWindow?: Window | null;
  }
}

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const searchParams = useSearchParams();
  const router = useRouter();

  const error = searchParams?.get('error');
  const token = searchParams?.get('token');
  const refreshToken = searchParams?.get('refreshToken');
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Close the popup if this is opened in a popup
      if (window.opener) {
        window.close();
        return;
      }

      // Handle errors
      if (error) {
        const errorMessage = decodeURIComponent(error);
        console.error('Authentication error:', errorMessage);
        setStatus('error');
        setErrorMessage(
          error === 'access_denied'
            ? 'Siz Google hisobi orqali kirishni bekor qildingiz.'
            : errorMessage || 'Google hisobi orqali kirishda xatolik yuz berdi.'
        );
        return;
      }

      // Handle successful authentication
      if (token && refreshToken) {
        try {
          setStatus('loading');

          // Sign in with the received tokens
          const result = await signIn('credentials', {
            token,
            refreshToken,
            redirect: false,
            callbackUrl,
          });

          if (result?.error) {
            throw new Error(result.error);
          }

          // Update status and redirect after a short delay
          setStatus('success');

          // Close the popup if it's still open
          if (window.opener) {
            window.close();
          } else {
            // If not in a popup, redirect after a short delay
            setTimeout(() => {
              router.push(callbackUrl);
            }, 1500);
          }
        } catch (err) {
          console.error('Error during sign in:', err);
          setStatus('error');
          setErrorMessage(
            err instanceof Error
              ? err.message
              : 'Kirish jarayonida xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.'
          );
        }
      } else {
        // No token or refresh token provided
        setStatus('error');
        setErrorMessage('Noto\'g\'ri autentifikatsiya javobi. Iltimos, qaytadan urinib ko\'ring.');
      }
    };

    handleAuthCallback();
  }, [error, token, refreshToken, router, callbackUrl]);

  // Close any open popup when component unmounts
  useEffect(() => {
    return () => {
      if (window.googleAuthWindow && !window.googleAuthWindow.closed) {
        window.googleAuthWindow.close();
        window.googleAuthWindow = null;
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <div className="text-center space-y-2">
          {status === 'loading' && (
            <>
              <div className="flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Kirish amalga oshirilmoqda</h1>
              <p className="text-gray-600">Iltimos, kuting...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Muvaffaqiyatli kirdingiz!</h1>
              <p className="text-gray-600">Sizni asosiy sahifaga yo'naltiramiz...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Xatolik yuz berdi</h1>
              <p className="text-red-600">{errorMessage}</p>
              <button
                onClick={() => router.push('/UserLoginPage')}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Kirish sahifasiga qaytish
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
