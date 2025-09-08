import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    try {
      const token = localStorage.getItem('accessToken');
      return token ? JSON.parse(token) : null;
    } catch (error) {
      console.error('Error parsing auth token:', error);
      return null;
    }
  }

  private handleError(error: AxiosError) {
    const response = error.response;
    
    if (!response) {
      toast.error('Tarmoq xatosi: Internet aloqasini tekshiring');
      return;
    }

    const status = response.status;
    const data = response.data as any;

    switch (status) {
      case 400:
        if (data?.errors) {
          // Validation errors
          Object.values(data.errors).flat().forEach((msg: any) => {
            toast.error(msg);
          });
        } else {
          toast.error(data?.message || 'Noto\'g\'ri so\'rov');
        }
        break;

      case 401:
        toast.error('Avtorizatsiya xatosi: Qayta kiring');
        this.handleUnauthorized();
        break;

      case 403:
        toast.error('Ruxsat yo\'q: Bu amalni bajarish uchun huquqingiz yetarli emas');
        break;

      case 404:
        toast.error(data?.message || 'Ma\'lumot topilmadi');
        break;

      case 409:
        toast.error(data?.message || 'Konflikt: Ma\'lumot allaqachon mavjud');
        break;

      case 422:
        toast.error(data?.message || 'Ma\'lumotlarni tekshirishda xatolik');
        break;

      case 429:
        toast.error('Juda ko\'p so\'rov: Biroz kuting va qayta urinib ko\'ring');
        break;

      case 500:
        toast.error('Server xatosi: Keyinroq qayta urinib ko\'ring');
        break;

      case 502:
      case 503:
      case 504:
        toast.error('Server vaqtincha ishlamayapti: Keyinroq qayta urinib ko\'ring');
        break;

      default:
        toast.error(data?.message || 'Noma\'lum xatolik yuz berdi');
    }
  }

  private handleUnauthorized() {
    // Clear auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // File upload method
  async uploadFile<T = any>(
    url: string, 
    file: File | FormData, 
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = file instanceof FormData ? file : new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    }

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.instance.post<T>(url, formData, config);
    return response.data;
  }

  // Retry mechanism for failed requests
  async retryRequest<T = any>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (i === maxRetries) {
          break;
        }

        // Don't retry on client errors (4xx)
        if (error instanceof AxiosError && error.response?.status && error.response.status < 500) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }

    throw lastError;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Get base URL
  getBaseURL(): string {
    return this.baseURL;
  }

  // Update base URL
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
    this.instance.defaults.baseURL = baseURL;
  }
}

// Create and export the default API client
const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1');

export default apiClient;
