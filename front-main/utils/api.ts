import axios, { AxiosError, AxiosResponse } from 'axios';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
  withCredentials: true, // Enable credentials for CORS
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  (error: AxiosError) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// Error handler utility
export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      // Server responded with error status
      const data = axiosError.response.data as any;
      return {
        message: data?.message || data?.error || 'Server xatoligi',
        status: axiosError.response.status,
        code: data?.code,
        details: data?.details,
      };
    } else if (axiosError.request) {
      // Request was made but no response received
      return {
        message: 'Serverga ulanishda xatolik',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Something else happened
      return {
        message: axiosError.message || 'Noma\'lum xatolik',
        code: 'UNKNOWN_ERROR',
      };
    }
  }
  
  // Non-axios error
  return {
    message: error?.message || 'Noma\'lum xatolik',
    code: 'UNKNOWN_ERROR',
  };
};

// API methods
export const api = {
  // GET request
  get: async <T = any>(url: string, params?: any): Promise<T> => {
    try {
      const response = await apiClient.get(url, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // POST request
  post: async <T = any>(url: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.post(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // PUT request
  put: async <T = any>(url: string, data?: any): Promise<T> => {
    try {
      const response = await apiClient.put(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // DELETE request
  delete: async <T = any>(url: string): Promise<T> => {
    try {
      const response = await apiClient.delete(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // File upload
  upload: async <T = any>(url: string, formData: FormData): Promise<T> => {
    try {
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Specific API endpoints
export const endpoints = {
  // Products
  products: {
    list: '/product',
    create: '/product/create',
    update: (id: number) => `/product/${id}`,
    delete: (id: number) => `/product/${id}`,
    byId: (id: number) => `/product/${id}`,
    byCategory: (categoryId: number) => `/product/category/${categoryId}`,
    search: '/product/search',
  },
  
  // Categories
  categories: {
    list: '/category',
    create: '/category',
    update: (id: number) => `/category/${id}`,
    delete: (id: number) => `/category/${id}`,
    subcategories: (parentId: number) => `/category/subcategories/${parentId}`,
  },
  
  // Brands
  brands: {
    list: '/brand',
    create: '/brand',
    update: (id: number) => `/brand/${id}`,
    delete: (id: number) => `/brand/${id}`,
  },
  
  // Users
  users: {
    profile: '/user/profile',
    update: '/user/update',
    register: '/auth/register',
    login: '/auth/login',
  },
  
  // Orders
  orders: {
    list: '/order',
    create: '/order',
    byId: (id: number) => `/order/${id}`,
    update: (id: number) => `/order/${id}`,
  },
};

export default api;
