// api/index.ts

import instance, { API_BASE_URL, API_PREFIX } from "./instance";
import axios from "axios";
import { toast } from "react-toastify";
import { AddressData } from "../types/userData";
import { AddressType as Address, AddressRes, CreateProductProps, UpdateProductProps } from "../types";

interface FindAddressDto {
  region_id?: number;
  district_id?: number;
  lat?: string;
  long?: string;
}

export const createProduct = async ({
  data,
  images,
  addressData,
}: {
  data: CreateProductProps;
  images: File[];
  addressData: AddressData;
}) => {
  try {
    const token = JSON.parse(localStorage.getItem("accessToken") || "");
    const findAddressDto: FindAddressDto = {
      region_id: addressData.region_id || undefined,
      district_id: addressData.district_id || undefined,
      long: addressData.long || undefined,
      lat: addressData.lat || undefined,
    };
    for (const key in findAddressDto) {
      if (!findAddressDto[key as keyof FindAddressDto]) {
        delete findAddressDto[key as keyof FindAddressDto];
      }
    }
    const address = await instance.post<AddressRes>(
      `/address/getByUser/${data.user_id}`,
      findAddressDto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const formData = new FormData();
    //@ts-ignore
    formData.append("address_id", address.data?.id);
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    images.forEach((img) => {
      formData.append("images", img);
    });
    try {
      console.log(formData.get("address_id"));

      const res = await instance.post("/product/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data);
      return res.data;
    } catch (error: any) {
      console.log("Errorjon:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    // console.log( "Product created successfully: ",res.data);

    // return res.data;
  } catch (error: any) {
    console.log("Errorjon:", error);
    toast.error(error.response?.data?.message || "Something went wrong");
  }
};

export const getProducts = async (
  page = 1,
  filters: Record<string, string> = {},
) => {
  try {
    const res = await instance.get(`/product`, {
      params: {
        page,
        ...filters,
      },
    });
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Something went wrong");
    throw error;
  }
};

export const getProductById = async (id: number) => {
  try {
    const res = await instance.get(`/product/${id}`);
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.warning(error.response?.data?.message || "Something went wrong");
    throw error;
  }
};

// Admin uchun barcha product'larni olish (pending ham)
export const getAllProductsForAdmin = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  try {
    // Admin token'ni olish
    const adminToken = localStorage.getItem('admin_access_token');
    
    // Default values
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const search = params?.search || '';
    const status = params?.status || '';

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);

    const res = await instance.get(`/product/admin/all?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Admin products API response:', res.data);

    if (res.data && res.data.products) {
      return res.data.products.map((product: any) => ({
        ...product,
        images: product.product_image?.map((img: any) => img.url) || ['/images/placeholder.jpg'],
        rating: product.rating || 4.5,
        review_count: product.review_count || Math.floor(Math.random() * 100) + 1,
        seller_name: product.user?.first_name || 'INBOLA',
        original_price: product.original_price || product.price * 1.2,
        discount_percentage: product.original_price ?
          Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0,
        is_bestseller: Math.random() > 0.7,
        is_featured: Math.random() > 0.8,
        safety_certified: true,
        educational_value: product.educational_value || 'Bolalar rivojlanishi uchun',
        shipping_info: 'Bepul yetkazib berish',
        status: product.is_checked || 'PENDING'
      }));
    }

    return [];
  } catch (error: any) {
    console.error("Error fetching admin products:", error);
    toast.error(error.response?.data?.message || "Admin products yuklashda xatolik");
    return [];
  }
};

export const getAllProducts = async (params?: { category?: string; limit?: number } | string) => {
  try {
    // Handle both object and string parameters
    let category: string | undefined;
    
    if (typeof params === 'string') {
      category = params;
    } else if (params && typeof params === 'object') {
      category = params.category;
    }
<<<<<<< HEAD
    
    // Call the backend with the category as a query parameter
    const res = await instance.get('/product/all', {
      params: { category }
    });
=======

    const res = await instance.get(`/api/v1/product/all`, { params: queryParams });
>>>>>>> 7a50308 (auth)

    // Accept multiple backend response shapes
    const raw = Array.isArray(res.data)
      ? res.data
      : (res.data?.data || res.data?.products || []);

    const products = (raw as any[]).map((product: any) => ({
      ...product,
      images: product?.product_image?.map((img: any) => img?.url).filter(Boolean) || ['/images/placeholder.jpg'],
      rating: product?.rating || 4.5,
      review_count: product?.review_count || Math.floor(Math.random() * 100) + 1,
      seller_name: product?.user?.first_name || 'INBOLA',
      original_price: product?.original_price || (product?.price ? product.price * 1.2 : undefined),
      discount_percentage: product?.original_price && product?.price
        ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
        : 0,
      is_bestseller: Math.random() > 0.7,
      is_featured: Math.random() > 0.8,
      safety_certified: true,
      educational_value: product?.educational_value || 'Bolalar rivojlanishi uchun',
      shipping_info: 'Bepul yetkazib berish'
    }));

    return products;
  } catch (error: any) {
    console.error('getAllProducts error:', error);
    toast.warning(`${error.response?.data?.message || 'Something went wrong'}`);
    // Always return an array to callers
    return [] as any[];
  }
};

export const addProductImage = async (productId: number, image: File) => {
  try {
    console.log("productId: ", productId);
    console.log("product image", image);

    const formData = new FormData();
    formData.append('image', image); // The field name should match what your backend expects, typically 'image' or 'file'

    const res = await instance.post(`/product/image/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("accessToken") || "")}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error adding product image:", error);
    throw error;
  }
};

// Admin product creation function
export const createAdminProduct = async (productData: any, images: File[]) => {
  try {
    // Admin token'ni olish
    const token = localStorage.getItem('admin_access_token');

    if (!token) {
      // Admin login sahifasiga yo'naltirish
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
      throw new Error("Admin token topilmadi. Iltimos qayta login qiling.");
    }

    console.log("Admin token found for product creation");

    const formData = new FormData();

    // Add default user_id for development
    const productDataWithUser = {
      ...productData,
      user_id: productData.user_id || 1 // Default to user ID 1 as number
    };

    // Add product data to formData with proper type conversion
    Object.entries(productDataWithUser).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle arrays (like features)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // For arrays, append each item separately
            value.forEach((item) => {
              formData.append(key, String(item));
            });
          }
          // Don't append empty arrays
        }
        // Convert boolean values to string
        else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        }
        // Convert numbers to string
        else if (typeof value === 'number') {
          formData.append(key, value.toString());
        }
        // Everything else as string
        else {
          formData.append(key, String(value));
        }
      }
    });

    // Add images to formData
    images.forEach((img) => {
      formData.append("images", img);
    });

    // Debug FormData contents
    console.log("=== FORMDATA DEBUG ===");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Use unified base URL (defaults to http://localhost:4000)
    const res = await axios.post(`${API_BASE_URL}${API_PREFIX}/product/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("=== FRONTEND API SUCCESS ===");
    console.log("Response data:", res.data);
    console.log("Response status:", res.status);

    // Check for successful response
    if (res.data && res.status === 201) {
      return res.data; // Return the full response object
    } else {
      throw new Error('Invalid API response format');
    }
  } catch (error: any) {
    console.error("=== FRONTEND API ERROR ===");
    console.error("Full error object:", error);
    console.error("Error response:", error.response);
    console.error("Error response data:", error.response?.data);
    console.error("Error response status:", error.response?.status);
    console.error("Error message:", error.message);

    const errorMessage = error.response?.data?.message || error.message || "Failed to create product";
    toast.error(`API Error: ${errorMessage}`);
    throw error;
  }
};

export const deleteProductImage = async (productId: number, imageId: number) => {
  try {
    console.log(productId, imageId);

    const res = await instance.delete(`/product/${productId}/image/${imageId}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("accessToken") || "")}`,
      },
    });
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Something went wrong");
    throw error;
  }
};

export const updateProduct = async (id: number, data: UpdateProductProps, addressData: AddressData) => {
  try {
    const token = JSON.parse(localStorage.getItem("accessToken") || "");
    const findAddressDto: FindAddressDto = {
      region_id: addressData.region_id || undefined,
      district_id: addressData.district_id || undefined,
      long: addressData.long || undefined,
      lat: addressData.lat || undefined,
    };
    for (const key in findAddressDto) {
      if (!findAddressDto[key as keyof FindAddressDto]) {
        delete findAddressDto[key as keyof FindAddressDto];
      }
    }
    const address = await instance.post<AddressRes>(
      `/address/getByUser/${data.user_id}`,
      findAddressDto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    //@ts-ignore
    const res = await instance.put(`/product/${id}`, {...data, address_id: address.data?.id}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Something went wrong");
    throw error;
  }
};

// Search products with filters
export const searchProducts = async (params: {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const res = await instance.get(`/product/search?${queryParams.toString()}`);
    return res.data;
  } catch (error: any) {
    console.error("Error searching products:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Mahsulotlarni qidirishda xatolik yuz berdi");
      throw new Error("Mahsulotlarni qidirishda xatolik yuz berdi");
    }
  }
};

// Get all products with filters
export const getAllProductsWithFilters = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  color?: string;
  condition?: boolean;
  region?: string;
  sort?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const res = await instance.get(`/product?${queryParams.toString()}`);
    return res.data;
  } catch (error: any) {
    console.error("Error loading products:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Mahsulotlarni yuklashda xatolik yuz berdi");
      throw new Error("Mahsulotlarni yuklashda xatolik yuz berdi");
    }
  }
};

export const productApi = {
  create: (data: CreateProductProps): Promise<Product> =>
    instance.post('/product/create', data),
  getAll: (): Promise<Product[]> => instance.get('/product'),
  getById: (id: number): Promise<Product> => instance.get(`/product/${id}`),
  update: (id: number, data: UpdateProductProps): Promise<Product> =>
    instance.patch(`/product/${id}`, data),
  delete: (id: number): Promise<void> => instance.delete(`/product/${id}`),
  search: (query: string): Promise<Product[]> =>
    instance.get(`/product/search?q=${query}`),

  // Admin functions
  getAllForAdmin: (page: number = 1, limit: number = 20, search: string = '', status: string = '') =>
    instance.get(`/product/admin/all?page=${page}&limit=${limit}&search=${search}&status=${status}`),
  approveProduct: (id: number) => instance.put(`/admin/products/${id}/approve`),
  rejectProduct: (id: number) => instance.put(`/admin/products/${id}/reject`),
};