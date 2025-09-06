import { useState, useEffect } from 'react';
import { loginWithTelegram, loginWithGoogle, loginWithSMS, logoutUser } from '../endpoints/auth-providers';

interface User {
  id: string;
  provider: 'google' | 'telegram' | 'sms';
  email?: string;
  firstName: string;
  lastName?: string;
  username?: string;
  profilePicture?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
        logout();
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Telegram login
  const loginTelegram = async (telegramData: any) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const result = await loginWithTelegram(telegramData);
      
      if (result && result.success) {
        setAuthState({
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return result;
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // Google login (redirect)
  const loginGoogle = () => {
    loginWithGoogle();
  };

  // SMS login
  const loginSMS = async (phoneNumber: string, code: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const result = await loginWithSMS(phoneNumber, code);
      
      if (result && result.success) {
        setAuthState({
          user: result.user,
          token: result.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return result;
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user_data');
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  return {
    ...authState,
    loginTelegram,
    loginGoogle,
    loginSMS,
    logout,
  };
};

export default useAuth;
