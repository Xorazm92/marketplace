import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// API base URL (prefer BACKEND, fallback to API) and sanitize to root (no /api or /api/v1)
const RAW_API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';
<<<<<<< HEAD

// Remove trailing slashes
const trimmed = RAW_API_BASE.replace(/\/$/, '');
// Remove trailing /api or /api/v{n}
const API_BASE_URL = trimmed.replace(/\/(api)(\/v\d+)?$/, '');
const API_PREFIX = '/api/v1';
const apiUrl = (path: string) => `${API_BASE_URL}${API_PREFIX}${path.startsWith('/') ? '' : '/'}${path}`;

// Axios instance yaratish
const instance: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
=======

// Axios instance yaratish
const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL, // API prefix is handled by NestJS global prefix now
>>>>>>> 7a50308 (auth)
  timeout: 30000,
  withCredentials: false, // cookie-based authga o'tsangiz true qilamiz
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
      // Admin panel uchun alohida token ishlatiladi
      const adminToken = localStorage.getItem('admin_access_token');
      const userToken = localStorage.getItem('accessToken');
      const token = adminToken || userToken;
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
    if (error.response?.status && error.response.status >= 500) {
      console.error('🔥 Server error occurred');
    }

    // Network Error
    if (!error.response) {
      console.error('🌐 Network error - Server mavjud emas');
    }

    return Promise.reject(error);
  }
);

// Health check function
export const checkApiHealth = async (): Promise<boolean> => {
  const healthEndpoints = ['/health', '/api/health', '/api/v1/health'];

  for (const endpoint of healthEndpoints) {
    try {
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { 
        timeout: 7000,
        validateStatus: (status) => status < 500
      });

      if (response.status === 200) {
        console.log('✅ API health check successful:', endpoint);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Health check attempt failed:', { 
        url: `${API_BASE_URL}${endpoint}`, 
        error: (error as any)?.message 
      });
    }
  }
  console.error('❌ API Health Check failed: All candidates exhausted', { healthEndpoints });
  return false;
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
export { API_BASE_URL, apiUrl, API_PREFIX };

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