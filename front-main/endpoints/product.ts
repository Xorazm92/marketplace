// api/index.ts

import instance from "./instance";
import axios from "axios";
import { toast } from "react-toastify";
import { AddressData } from "../types/userData";
import { Address, AddressRes, CreateProductProps, UpdateProductProps } from "../types";

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

export const getAllProducts = async (params?: { category?: string; limit?: number }) => {
  try {
    const queryParams = params || {};
    const res = await instance.get(`/v1/product/all`, { params: queryParams });
    // API returns array directly
    return { data: res.data || [] };
  } catch (error: any) {
    console.error(error);
    toast.warning(`${error.response?.data?.message || "Something went wrong"}`);
    return { data: [] };
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
    const tokenString = localStorage.getItem("accessToken");
    let token = tokenString ? JSON.parse(tokenString) : null;

    // Development mode: create demo token if none exists
    if (!token && process.env.NODE_ENV === 'development') {
      const demoToken = "demo-admin-token-for-development";
      localStorage.setItem("accessToken", JSON.stringify(demoToken));
      token = demoToken;
      console.log("Demo token created for development");
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
    console.log("=== FORMDATA DEBUG ===");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    // Use direct URL to ensure correct endpoint
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await axios.post(`${API_URL}/api/v1/product/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
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
