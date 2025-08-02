
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001';

// Axios instance yaratish
const instance: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 30000,
  withCredentials: false, // CORS muammosini hal qilish uchun
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Token qo'shish
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Debug log
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('🔗 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Debug log
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // Error handling
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    // 401 - Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        
        // Login sahifasiga yo'naltirish
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    // 403 - Forbidden
    if (error.response?.status === 403) {
      console.warn('🚫 Access denied');
    }

    // 500 - Server Error
    if (error.response?.status >= 500) {
      console.error('🔥 Server error occurred');
    }

    // Network Error
    if (!error.response) {
      console.error('🌐 Network error - Server mavjud emas');
    }

    return Promise.reject(error);
  }
);

// Health check funksiyasi
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 5000,
    });
    console.log('💚 API Health Check:', response.data);
    return response.status === 200;
  } catch (error) {
    console.error('❌ API Health Check failed:', error);
    return false;
  }
};

// API connection test
export const testApiConnection = async (): Promise<void> => {
  try {
    console.log('🔍 Testing API connection...');
    const isHealthy = await checkApiHealth();
    
    if (isHealthy) {
      console.log('✅ API connection successful');
    } else {
      console.error('❌ API connection failed');
    }
  } catch (error) {
    console.error('❌ API connection test error:', error);
  }
};

// Initial connection test
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
  testApiConnection();
}

export default instance;

// Export utility functions
export { API_BASE_URL };

// Types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  status: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
  timestamp: string;
}
