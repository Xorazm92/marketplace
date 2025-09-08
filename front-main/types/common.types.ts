// Common API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Common form types
export interface FormState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'blocked';

// Common entity fields
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Address types
export interface Address extends BaseEntity {
  user_id: number;
  region_id: number;
  district_id: number;
  street: string;
  house_number?: string;
  apartment?: string;
  postal_code?: string;
  is_default: boolean;
  region?: {
    id: number;
    name: string;
  };
  district?: {
    id: number;
    name: string;
  };
}

// Currency types
export interface Currency extends BaseEntity {
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  is_default: boolean;
}
