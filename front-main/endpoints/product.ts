// api/index.ts

import instance from "./instance";
import axios from "axios";
import { toast } from "react-toastify";
import { validateApiRequest } from '../utils/productValidation';
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
  addressData?: any; // AddressData type not defined, using any for now
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
): Promise<any[]> => {
  try {
    console.log('🔍 Fetching all products...');
    
    const res = await instance.get('/product/all');
    console.log('✅ API Response received:', res.status);
    
    if (res.data) {
      console.log('📊 Response structure:', {
        hasData: !!res.data,
        dataType: typeof res.data,
        isArray: Array.isArray(res.data),
        dataKeys: Object.keys(res.data || {}),
        dataLength: res.data?.length || 'N/A'
      });

      // Transform API response to match frontend expectations
      // Backend returns: { success: true, data: [...], count: number }
      const productsData = res.data?.data || res.data || [];
      const products = (productsData || []).map((product: any) => ({
        ...product,
        // Ensure consistent image format
        images: product.images || product.product_image?.map((img: any) => img.url) || []
      }));

      console.log(`✅ Processed ${products.length} products`);
      return products;
    }
    
    console.warn('⚠️ No data in response');
    return [];
  } catch (error: any) {
    console.error('❌ Error fetching products:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // Return empty array instead of throwing
    return [];
  }
};

// ✅ Get product by ID
export const getProductById = async (id: number): Promise<{ success: boolean; data: any | null }> => {
  try {
    console.log(`🔍 Fetching product by ID: ${id}`);
    
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new Error('Invalid product ID');
    }
    
    const res = await instance.get(`/product/${id}`);
    console.log('✅ Product API Response received:', res.status);
    
    if (res.data?.success && res.data?.data) {
      const product = {
        ...res.data.data,
        // Ensure consistent image format
        images: res.data.data.images || res.data.data.product_image?.map((img: any) => img.url) || []
      };
      
      console.log(`✅ Product fetched: ${product.title || product.name}`);
      return {
        success: true,
        data: product
      };
    }
    
    console.warn('⚠️ Product not found in response');
    return {
      success: false,
      data: null
    };
  } catch (error: any) {
    console.error(`❌ Error fetching product ${id}:`, error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    return {
      success: false,
      data: null
    };
  }
};

// ✅ Get product by slug
export const getProductBySlug = async (slug: string): Promise<{ success: boolean; data: any | null }> => {
  try {
    console.log(`🔍 Fetching product by slug: ${slug}`);
    
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      throw new Error('Invalid product slug');
    }
    
    const res = await instance.get(`/product/slug/${encodeURIComponent(slug)}`);
    console.log('✅ Product API Response received:', res.status);
    
    if (res.data?.success && res.data?.data) {
      const product = {
        ...res.data.data,
        // Ensure consistent image format
        images: res.data.data.images || res.data.data.product_image?.map((img: any) => img.url) || []
      };
      
      console.log(`✅ Product fetched: ${product.title || product.name}`);
      return {
        success: true,
        data: product
      };
    }
    
    console.warn('⚠️ Product not found in response');
    return {
      success: false,
      data: null
    };
  } catch (error: any) {
    console.error(`❌ Error fetching product by slug ${slug}:`, error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    return {
      success: false,
      data: null
    };
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

// ✅ Validation utilities imported above

// Admin product creation function
export const createAdminProduct = async (productData: any, images: File[], mainImageIndex: number = 0) => {
  try {
    console.log('🚀 Mahsulot yaratish boshlandi...');
    
    // ✅ API request uchun ma'lumotlarni validatsiya qilish
    const validation = validateApiRequest(productData);
    if (!validation.isValid) {
      console.error('❌ Frontend validatsiya xatolari:', validation.errors);
      throw new Error(`Validatsiya xatolari: ${validation.errors.join(', ')}`);
    }
    
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Frontend validatsiya ogohlantirishlari:', validation.warnings);
    }
    
    // ✅ Rasmlar tekshiruvi
    if (!images || images.length === 0) {
      throw new Error('Kamida bitta rasm yuklash majburiy');
    }
    
    // ✅ Rasm formatini tekshirish
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidImages = images.filter(img => !allowedTypes.includes(img.type));
    if (invalidImages.length > 0) {
      throw new Error(`Noto'g'ri rasm formati: ${invalidImages.map(img => img.name).join(', ')}`);
    }
    
    // ✅ Rasm hajmini tekshirish (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedImages = images.filter(img => img.size > maxSize);
    if (oversizedImages.length > 0) {
      throw new Error(`Rasm hajmi juda katta (5MB dan oshmasin): ${oversizedImages.map(img => img.name).join(', ')}`);
    }

    // Add user_id if authenticated (set to null for now to avoid FK constraint)
    let token = localStorage.getItem('accessToken');
    if (token) {
      // productDataWithUser.user_id = 1; // Commented out to avoid FK constraint
      // Real implementation should decode user ID from JWT token
    } else if (!token && process.env.NODE_ENV === 'development') {
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
      throw new Error("Avval tizimga kiring");
    }

    const formData = new FormData();

    // Set user_id to valid user ID (test user from seed)
    const productDataWithUser = {
      ...productData,
      user_id: 1 // Use test user ID from seed data
    };

    // ✅ Category/Subcategory validation and mapping
    const mainCategories = [1, 4, 7, 10, 11, 12]; // Main categories only
    const subcategories = [2, 3, 5, 6, 8, 9]; // Subcategories
    
    if (subcategories.includes(productData.category_id)) {
      // If selected category is actually a subcategory, move it to subcategory_id
      const subcategoryMappings: { [key: number]: number } = {
        2: 1, 3: 1, // Ichki/Tashqi kiyim -> Kiyim-kechak
        5: 4, 6: 4, // Konstruktor/Yumshoq -> O'yinchoqlar  
        8: 7, 9: 7  // Ta'lim/Ertaklar -> Kitoblar
      };
      
      productDataWithUser.subcategory_id = productData.category_id;
      productDataWithUser.category_id = subcategoryMappings[productData.category_id];
      
      console.log(`🔄 Moved category ${productData.category_id} to subcategory, parent: ${productDataWithUser.category_id}`);
    } else if (!mainCategories.includes(productData.category_id)) {
      console.warn(`⚠️ Invalid category_id: ${productData.category_id}, using fallback category 4`);
      productDataWithUser.category_id = 4; // Default to O'yinchoqlar
    }

    // Add product data to formData with proper type conversion
    // Only include fields that exist in CreateProductDto
    const allowedFields = [
      'title', 'user_id', 'brand_id', 'price', 'currency_id', 'description',
      'negotiable', 'condition', 'phone_number', 'address_id', 'category_id',
      'subcategory_id', 'age_range', 'material', 'color', 'size', 'manufacturer',
      'safety_info', 'features', 'weight', 'dimensions'
    ];

    Object.entries(productDataWithUser).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined && value !== null && value !== '') {
        // Handle arrays (like features)
        if (Array.isArray(value)) {
          if (value.length > 0) {
            // For arrays, append as JSON string
            formData.append(key, JSON.stringify(value));
          }
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (typeof value === 'number') {
          formData.append(key, value.toString());
        } else {
          // Everything else as string
          formData.append(key, String(value));
        }
      }
    });

    // Add images to formData with main image first
    if (images.length > 0) {
      // Add main image first
      if (mainImageIndex >= 0 && mainImageIndex < images.length) {
        formData.append("images", images[mainImageIndex]);
        if (process.env.NODE_ENV === "development") {
          console.log("Main image (first):", images[mainImageIndex].name);
        }
      }
      
      // Add other images
      images.forEach((img, index) => {
        if (index !== mainImageIndex) {
          formData.append("images", img);
        }
      });
    }

    // Debug FormData contents
    if (process.env.NODE_ENV === "development") {
      console.log("=== FORMDATA DEBUG ===");
      console.log("Original productData:", productData);
      console.log("ProductData with user:", productDataWithUser);
      console.log("Images count:", images.length);
      
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      // Validate required fields
      const requiredFields = ['title', 'description', 'price', 'category_id', 'brand_id'];
      const missingFields = requiredFields.filter(field => !formData.has(field));
      if (missingFields.length > 0) {
        console.warn("Missing required fields:", missingFields);
      }
    }

    // Use direct URL to ensure correct endpoint
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await axios.post(`${API_URL}/api/v1/product/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    if (process.env.NODE_ENV === "development") {
      console.log('=== PRODUCT CREATE RESPONSE ===');
      console.log('Response:', res);
      console.log('Response data:', res?.data);
      console.log('Response success:', res?.data?.success);
      console.log('Response message:', res?.data?.message);
    }
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

export const deleteProduct = async (productId: number) => {
  try {
    console.log(`🗑️ Deleting product ID: ${productId}`);
    
    const res = await instance.delete(`/product/${productId}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(localStorage.getItem("accessToken") || "demo-token")}`,
      },
    });
    
    console.log('✅ Product deleted successfully:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ Error deleting product:', error);
    const errorMessage = error.response?.data?.message || "Mahsulotni o'chirishda xato";
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

export const updateProduct = async (id: number, data: UpdateProductProps, addressData?: any) => {
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

// Admin product update function
export const updateAdminProduct = async (productId: number, productData: any, images: File[] = [], mainImageIndex: number = 0) => {
  try {
    const tokenString = localStorage.getItem("accessToken");
    let token = tokenString ? JSON.parse(tokenString) : null;

    if (!token && process.env.NODE_ENV === 'development') {
      const demoToken = "demo-admin-token-for-development";
      localStorage.setItem("accessToken", JSON.stringify(demoToken));
      token = demoToken;
    }

    if (!token) {
      throw new Error("Please login first to update products");
    }

    const formData = new FormData();

    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            formData.append(key, JSON.stringify(value));
          }
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (typeof value === 'number') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, String(value));
        }
      }
    });

    if (images && images.length > 0) {
      // Add main image first
      if (mainImageIndex >= 0 && mainImageIndex < images.length) {
        formData.append("images", images[mainImageIndex]);
        if (process.env.NODE_ENV === "development") {
          console.log("Main image for update (first):", images[mainImageIndex].name);
        }
      }
      
      // Add other images
      images.forEach((img, index) => {
        if (index !== mainImageIndex) {
          formData.append("images", img);
        }
      });
    }

    const response = await instance.put(`/product/${productId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;

  } catch (error: any) {
    console.error("Product update error:", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};
