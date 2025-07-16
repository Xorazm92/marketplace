
import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig 
} from 'axios';

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:4000';
const DEFAULT_TIMEOUT = 10000;

// Types
interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Utility functions
const getStoredTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!accessToken || !refreshToken) return null;
    
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error reading tokens from localStorage:', error);
    return null;
  }
};

const setStoredTokens = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  } catch (error) {
    console.error('Error storing tokens to localStorage:', error);
  }
};

const clearStoredTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Error clearing tokens from localStorage:', error);
  }
};

// Axios instance yaratish
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const tokens = getStoredTokens();
      
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      
      // Request logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      return config;
    },
    (error: AxiosError) => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Response logging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      }
      
      return response;
    },
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config;
      
      // 401 xatosi - token eskirgan
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        
        const tokens = getStoredTokens();
        
        if (tokens?.refreshToken) {
          try {
            const refreshResponse = await axios.post(
              `${API_BASE_URL}/api/auth/refresh`,
              { refreshToken: tokens.refreshToken }
            );
            
            const newTokens: AuthTokens = refreshResponse.data;
            setStoredTokens(newTokens);
            
            // Original requestni qayta yuborish
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return instance(originalRequest);
            
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            clearStoredTokens();
            
            // Login sahifasiga yo'naltirish
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
      }
      
      // Error logging
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
      });
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// API instance
export const apiInstance = createApiInstance();

// Export utility functions
export { getStoredTokens, setStoredTokens, clearStoredTokens };

// Default export
export default apiInstance;
