// api/index.ts

import instance from "./instance";
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
      if (process.env.NODE_ENV === "development") console.log(formData.get("address_id"));

      const res = await instance.post("/product/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (process.env.NODE_ENV === "development") console.log(res.data);
      return res.data;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") console.log("Errorjon:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    // if (process.env.NODE_ENV === "development") console.log( "Product created successfully: ",res.data);

    // return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") console.log("Errorjon:", error);
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

export const getAllProducts = async (params?: { category?: string; limit?: number } | string) => {
  try {
    // Handle both object and string parameters
    let queryParams = {};
    if (typeof params === 'string') {
      queryParams = { category: params };
    } else if (params && typeof params === 'object') {
      queryParams = params;
    }

    const res = await instance.get(`/product/all`, { params: queryParams });

    // Transform API response to match frontend expectations
    const products = (res.data || []).map((product: any) => ({
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
      shipping_info: 'Bepul yetkazib berish'
    }));

    return products;
  } catch (error: any) {
    console.error(error);
    toast.warning(`${error.response?.data?.message || "Something went wrong"}`);
    return { data: [] };
  }
};

export const addProductImage = async (productId: number, image: File) => {
  try {
    if (process.env.NODE_ENV === "development") console.log("productId: ", productId);
    if (process.env.NODE_ENV === "development") console.log("product image", image);

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
    const tokenString = localStorage.getItem("accessToken");
    let token = tokenString ? JSON.parse(tokenString) : null;

    // Development mode: create demo token if none exists
    if (!token && process.env.NODE_ENV === 'development') {
      const demoToken = "demo-admin-token-for-development";
      localStorage.setItem("accessToken", JSON.stringify(demoToken));
      token = demoToken;
      if (process.env.NODE_ENV === "development") console.log("Demo token created for development");
    }

    if (!token) {
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error("Please login first to create products");
    }

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
    if (process.env.NODE_ENV === "development") console.log("=== FORMDATA DEBUG ===");
    for (let [key, value] of formData.entries()) {
      if (process.env.NODE_ENV === "development") console.log(`${key}:`, value);
    }

    // Use direct URL to ensure correct endpoint
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await axios.post(`${API_URL}/api/v1/product/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    if (process.env.NODE_ENV === "development") console.log("=== PRODUCT CREATE RESPONSE ===");
    if (process.env.NODE_ENV === "development") console.log(res.data);
    return res.data;
  } catch (error: any) {
    // Enhanced error logging for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("=== PRODUCT CREATE ERROR ===");
      console.error("Full error object:", error);
      if (error.response) {
        console.error("Error response:", error.response);
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        // Show validation errors if available
        if (error.response.data?.message) {
          console.error("Backend validation errors:", error.response.data.message);
        }
        if (error.response.data?.errors) {
          console.error("Detailed errors:", error.response.data.errors);
        }
      }
      console.error("Error message:", error.message);
      console.error("Request config:", error.config);
    }
    
    // Return more detailed error for UI
    const errorMessage = error.response?.data?.message || error.message || 'Mahsulot yaratishda xato yuz berdi';
    throw new Error(errorMessage);
  }
};

export const deleteProductImage = async (productId: number, imageId: number) => {
  try {
    if (process.env.NODE_ENV === "development") console.log(productId, imageId);
    
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
