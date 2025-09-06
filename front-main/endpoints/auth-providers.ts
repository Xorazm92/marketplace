import axios from 'axios';
import { toast } from 'react-toastify';

// Backend API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Create separate auth instance for authentication endpoints
const authInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  timeout: 30000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Get available authentication providers
export const getAuthProviders = async () => {
  try {
    const res = await authInstance.get('/providers');
    return res.data;
  } catch (error: any) {
    console.error('Failed to get auth providers:', error);
    toast.error('Failed to load authentication providers');
    return null;
  }
};

// Telegram authentication
export const loginWithTelegram = async (telegramData: any) => {
  try {
    const res = await authInstance.post('/telegram/login', telegramData);
    
    if (res.data.success && res.data.token) {
      // Save tokens to localStorage
      localStorage.setItem('accessToken', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
      
      toast.success('Telegram login successful!');
      return res.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error: any) {
    console.error('Telegram login error:', error);
    toast.error(error?.response?.data?.error || 'Telegram login failed');
    throw error;
  }
};

// Google OAuth login (redirect method)
export const loginWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/api/auth/google/login`;
};

// SMS authentication
export const loginWithSMS = async (phoneNumber: string, code: string) => {
  try {
    const res = await authInstance.post('/sms/login', {
      phoneNumber,
      code
    });
    
    if (res.data.success && res.data.token) {
      // Save tokens to localStorage
      localStorage.setItem('accessToken', res.data.token);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user_data', JSON.stringify(res.data.user));
      
      toast.success('SMS login successful!');
      return res.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error: any) {
    console.error('SMS login error:', error);
    toast.error(error?.response?.data?.error || 'SMS login failed');
    throw error;
  }
};

// Get Telegram bot info
export const getTelegramBotInfo = async () => {
  try {
    const res = await authInstance.get('/telegram/bot-username');
    return res.data;
  } catch (error: any) {
    console.error('Failed to get Telegram bot info:', error);
    return null;
  }
};

// Test Google OAuth configuration
export const testGoogleConfig = async () => {
  try {
    const res = await authInstance.get('/google/test');
    return res.data;
  } catch (error: any) {
    console.error('Failed to test Google config:', error);
    return null;
  }
};

// Logout function
export const logoutUser = async () => {
  try {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user_data');
    
    toast.success('Successfully logged out');
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error: any) {
    console.error('Logout error:', error);
    toast.error('Logout failed');
  }
};

export default {
  getAuthProviders,
  loginWithTelegram,
  loginWithGoogle,
  loginWithSMS,
  getTelegramBotInfo,
  testGoogleConfig,
  logoutUser,
};
