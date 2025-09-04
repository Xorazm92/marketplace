'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// next-auth is temporarily disabled; we'll call backend OAuth directly
import { Icons } from '@/components/icons';
import Button from '../Button/Button';
import { toast } from 'react-toastify';

// Extend the window interface to include our popup state
declare global {
  interface Window {
    googleAuthWindow?: Window | null;
  }
}

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  // const { data: session } = useSession(); // disabled

  // Handle OAuth flow with popup
  const handleGoogleSignIn = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    let popup: Window | null = null;
    let popupCheckInterval: NodeJS.Timeout;
    
    try {
      // Open Google OAuth URL in a new window
      const width = 500;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const authUrl = `${base}/auth/google?callbackUrl=${encodeURIComponent(window.location.origin + '/auth/callback')}`;
      
      // Close any existing popup
      if (window.googleAuthWindow && !window.googleAuthWindow.closed) {
        window.googleAuthWindow.close();
      }
      
      // Open new popup
      popup = window.open(
        authUrl,
        'google-oauth',
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
      );
      
      // Store reference to the popup window
      window.googleAuthWindow = popup;
      
      if (!popup) {
        throw new Error('Pop-up oynasi ochilmadi. Iltimos, brauzeringizda pop-up blokirovkasini o\'chiring.');
      }
      
      // Focus the popup
      popup.focus();
      
      // Poll to check if the popup is closed or redirected
      popupCheckInterval = setInterval(() => {
        try {
          if (popup?.closed) {
            clearInterval(popupCheckInterval);
            setIsLoading(false);
            
            // Check if we have a session after popup is closed
            // If you later re-enable next-auth, you can check session here
            
            // If we get here, there might have been an issue
            toast.info('Kirish jarayoni tugallanmadi. Iltimos, qaytadan urinib ko\'ring.');
          }
        } catch (error) {
          // This might happen due to cross-origin restrictions
          clearInterval(popupCheckInterval);
          setIsLoading(false);
        }
      }, 500);
      
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error(`Xatolik yuz berdi: ${error instanceof Error ? error.message : 'Noma\'lum xatolik'}`);
      setIsLoading(false);
    }
    
    // Cleanup function
    return () => {
      if (popupCheckInterval) clearInterval(popupCheckInterval);
    };
  }, [isLoading]);
  
  // Clean up popup reference on unmount
  useEffect(() => {
    return () => {
      if (window.googleAuthWindow && !window.googleAuthWindow.closed) {
        window.googleAuthWindow.close();
      }
      window.googleAuthWindow = null;
    };
  }, []);

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <div className="h-4 w-4 border-2 border-t-transparent border-solid border-gray-500 rounded-full animate-spin" />
      ) : (
        <Icons.google className="h-4 w-4" />
      )}
      <span>{isLoading ? 'Kirilmoqda...' : 'Google orqali kirish'}</span>
    </Button>
  );
}

export default GoogleSignInButton;
