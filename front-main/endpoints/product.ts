import instance, { API_PREFIX } from './instance';
import { Product, ProductCreateRequest, ProductFilters, PaginatedResponse } from '@/types/product';

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductResponse {
  data: Product;
  success: boolean;
  message?: string;
}

export interface CreateProductResponse {
  data: Product;
  success: boolean;
  message: string;
}

// Barcha mahsulotlarni olish
export const getAllProducts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}): Promise<ProductsResponse> => {
  try {
    let category = '';

    // Parameters ni parse qilish
    if (typeof params === 'string') {
      category = params;
    } else if (params && typeof params === 'object') {
      category = params.category || '';
    }

    // Query parameters yaratish
    const queryParams: Record<string, any> = {};

    if (params && typeof params === 'object') {
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      if (params.category) queryParams.category = params.category;
      if (params.brand) queryParams.brand = params.brand;
      if (params.minPrice) queryParams.minPrice = params.minPrice;
      if (params.maxPrice) queryParams.maxPrice = params.maxPrice;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      if (params.search) queryParams.search = params.search;
    } else if (category) {
      queryParams.category = category;
    }

    const res = await instance.get(`/v1/product/all`, { params: queryParams });

    return {
      products: res.data.data || res.data.products || [],
      pagination: res.data.pagination || {
        page: 1,
        limit: 10,
        total: res.data.data?.length || 0,
        totalPages: 1
      }
    };
  } catch (error: any) {
    console.error('getAllProducts error:', error);
    throw new Error(error.response?.data?.message || 'Mahsulotlarni yuklab olishda xatolik');
  }
};

// Bitta mahsulotni olish
export const getProductById = async (id: string | number): Promise<Product> => {
  try {
    const res = await instance.get(`/v1/product/${id}`);
    return res.data.data || res.data;
  } catch (error: any) {
    console.error('getProductById error:', error);
    throw new Error(error.response?.data?.message || 'Mahsulotni yuklab olishda xatolik');
  }
};

// Yangi mahsulot yaratish
export const createProduct = async (productData: ProductCreateRequest): Promise<CreateProductResponse> => {
  try {
    const res = await instance.post('/v1/product/create', productData);
    return res.data;
  } catch (error: any) {
    console.error('createProduct error:', error);
    throw new Error(error.response?.data?.message || 'Mahsulot yaratishda xatolik');
  }
};

// Mahsulot tahrirlash
export const updateProduct = async (id: string | number, productData: Partial<ProductCreateRequest>): Promise<Product> => {
  try {
    const res = await instance.put(`/v1/product/${id}`, productData);
    return res.data.data || res.data;
  } catch (error: any) {
    console.error('updateProduct error:', error);
    throw new Error(error.response?.data?.message || 'Mahsulotni tahrirlashda xatolik');
  }
};

// Mahsulotni o'chirish
export const deleteProduct = async (id: string | number): Promise<void> => {
  try {
    await instance.delete(`/v1/product/${id}`);
  } catch (error: any) {
    console.error('deleteProduct error:', error);
    throw new Error(error.response?.data?.message || 'Mahsulotni o\'chirishda xatolik');
  }
};

// Mahsulot qidirish
export const searchProducts = async (query: string, filters?: ProductFilters): Promise<ProductsResponse> => {
  try {
    const params = {
      search: query,
      ...filters
    };

    const res = await instance.get('/v1/product/search', { params });

    return {
      products: res.data.data || res.data.products || [],
      pagination: res.data.pagination || {
        page: 1,
        limit: 10,
        total: res.data.data?.length || 0,
        totalPages: 1
      }
    };
  } catch (error: any) {
    console.error('searchProducts error:', error);
    throw new Error(error.response?.data?.message || 'Mahsulot qidirishda xatolik');
  }
};

// Foydalanuvchining mahsulotlari
export const getUserProducts = async (userId: string | number): Promise<Product[]> => {
  try {
    const res = await instance.get(`/v1/product/user/${userId}`);
    return res.data.data || res.data || [];
  } catch (error: any) {
    console.error('getUserProducts error:', error);
    throw new Error(error.response?.data?.message || 'Foydalanuvchi mahsulotlarini yuklab olishda xatolik');
  }
};

// Mahsulot rasmini yuklash
export const uploadProductImage = async (productId: string | number, imageFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await instance.post(`/v1/product/image/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data.imageUrl || res.data.data?.imageUrl;
  } catch (error: any) {
    console.error('uploadProductImage error:', error);
    throw new Error(error.response?.data?.message || 'Rasm yuklashda xatolik');
  }
};

// Kategoriya bo'yicha mahsulotlar
export const getProductsByCategory = async (categorySlug: string, params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ProductsResponse> => {
  try {
    const queryParams = {
      category: categorySlug,
      ...params
    };

    return await getAllProducts(queryParams);
  } catch (error: any) {
    console.error('getProductsByCategory error:', error);
    throw new Error(error.response?.data?.message || 'Kategoriya mahsulotlarini yuklab olishda xatolik');
  }
};

// Brend bo'yicha mahsulotlar
export const getProductsByBrand = async (brandId: string | number, params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ProductsResponse> => {
  try {
    const queryParams = {
      brand: brandId.toString(),
      ...params
    };

    return await getAllProducts(queryParams);
  } catch (error: any) {
    console.error('getProductsByBrand error:', error);
    throw new Error(error.response?.data?.message || 'Brend mahsulotlarini yuklab olishda xatolik');
  }
};

// Mashhur mahsulotlar
export const getPopularProducts = async (limit: number = 10): Promise<Product[]> => {
  try {
    const res = await getAllProducts({
      limit,
      sortBy: 'view_count',
      sortOrder: 'desc'
    });

    return res.products;
  } catch (error: any) {
    console.error('getPopularProducts error:', error);
    throw new Error(error.response?.data?.message || 'Mashhur mahsulotlarni yuklab olishda xatolik');
  }
};

// Yangi mahsulotlar
export const getNewProducts = async (limit: number = 10): Promise<Product[]> => {
  try {
    const res = await getAllProducts({
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    return res.products;
  } catch (error: any) {
    console.error('getNewProducts error:', error);
    throw new Error(error.response?.data?.message || 'Yangi mahsulotlarni yuklab olishda xatolik');
  }
};