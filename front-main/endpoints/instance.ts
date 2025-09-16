import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// API base URL using environment variables, with fallback
const RAW_API_BASE = 
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:4000';

// Remove trailing slashes from the base URL
const trimmedApiBaseUrl = RAW_API_BASE.replace(/\/$/, '');

// API prefix
const API_PREFIX = '/api';

// Final API base URL
export const API_BASE_URL = `${trimmedApiBaseUrl}${API_PREFIX}`;

// Axios instance creation
const instance: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}`,
  timeout: 30000,
  withCredentials: false, // Set to true if using cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add token to the request headers
    if (typeof window !== 'undefined') {
      const adminToken = localStorage.getItem('admin_access_token');
      const userToken = localStorage.getItem('accessToken');
      const token = adminToken || userToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Debug log for requests
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
    // Debug log for successful responses
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    // Log API errors
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    // Handle 401 - Unauthorized errors
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        const currentAccessToken = localStorage.getItem('accessToken');

        // If there's a refresh token and the error is not a retry attempt
        if (refreshToken && !error.config!._retry) {
          error.config!._retry = true; // Mark as retry attempt

          try {
            // Attempt to refresh the token
            const refreshResponse = await axios.post(`${API_BASE_URL}/v1/user-auth/refresh`, {
              refreshToken
            });

            const { accessToken: newAccessToken } = refreshResponse.data;
            localStorage.setItem('accessToken', newAccessToken);
            
            // Update the Authorization header for the original request
            if (error.config && error.config.headers) {
              error.config.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            // Re-send the original request with the new token
            return instance(error.config!);
          } catch (refreshError) {
            // If token refresh fails, redirect to login
            console.error('❌ Token refresh failed:', refreshError);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user_data');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        } else {
          // If no refresh token or already retried, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user_data');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }

    // Handle 403 - Forbidden errors
    if (error.response?.status === 403) {
      console.warn('🚫 Access denied');
    }

    // Handle 5xx - Server errors
    if (error.response?.status && error.response.status >= 500) {
      console.error('🔥 Server error occurred');
    }

    // Handle Network errors (server not reachable)
    if (!error.response) {
      console.error('🌐 Network error - Server not reachable');
    }

    return Promise.reject(error);
  }
);

// Health check function
export const checkApiHealth = async (): Promise<boolean> => {
  const healthEndpoints = ['/health', '/api/health', '/api/v1/health'];

  for (const endpoint of healthEndpoints) {
    try {
      const response = await axios.get(`${trimmedApiBaseUrl}${endpoint}`, {
        timeout: 7000,
        validateStatus: (status) => status < 500 // Accept any status less than 500
      });

      if (response.status === 200) {
        console.log('✅ API health check successful:', endpoint);
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Health check attempt failed:', {
        url: endpoint,
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

// Initial connection test on debug mode
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
  testApiConnection();
}

export default instance;

// Export utility functions and constants
export { API_PREFIX, API_BASE_URL };

// Types for API responses and errors
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