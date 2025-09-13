import { toast } from "react-toastify";
import instance from "./instance";

export const getAllCategories = async () => {
  try {
    const res = await instance.get("/category");
    
    // Handle different response formats
    if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data.data) {
      return res.data.data;
    } else if (res.data.categories) {
      return res.data.categories;
    }
    
    return [];
  } catch (error: any) {
    console.error("Error loading categories:", error);
    
    // More specific error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const errorMessage = error.response.data?.message || 
                         error.response.data?.error || 
                         'Server xatosi yuz berdi';
      toast.error(errorMessage);
      throw new Error(`Server xatosi: ${error.response.status} - ${errorMessage}`);
    } else if (error.request) {
      // The request was made but no response was received
      toast.error("Serverga ulanishda xatolik. Iltimos, internet aloqasini tekshiring.");
      throw new Error("Serverga ulanishda xatolik");
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error("So'rov yuborishda xatolik yuz berdi");
      throw new Error(`So'rov yuborishda xatolik: ${error.message}`);
    }
  }
};

export const getCategoryById = async (id: number) => {
  try {
    const res = await instance.get(`/category/${id}`);
    
    // Handle different response formats
    if (res.data) {
      return res.data.data || res.data.category || res.data;
    }
    
    throw new Error('Kategoriya ma\'lumotlari topilmadi');
  } catch (error: any) {
    console.error(`Error fetching category by ID ${id}:`, error);
    
    if (error.response) {
      const errorMessage = error.response.data?.message || 
                         error.response.data?.error || 
                         'Kategoriyani yuklashda xatolik';
      toast.error(errorMessage);
      throw new Error(`Server xatosi: ${error.response.status} - ${errorMessage}`);
    } else if (error.request) {
      toast.error("Serverga ulanishda xatolik. Iltimos, internet aloqasini tekshiring.");
      throw new Error("Serverga ulanishda xatolik");
    } else {
      toast.error("So'rov yuborishda xatolik yuz berdi");
      throw new Error(`So'rov yuborishda xatolik: ${error.message}`);
    }
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const res = await instance.get(`/category/slug/${slug}`);
    
    // Handle different response formats
    if (res.data) {
      return res.data.data || res.data.category || res.data;
    }
    
    throw new Error(`'${slug}' slug'li kategoriya topilmadi`);
  } catch (error: any) {
    console.error(`Error fetching category by slug '${slug}':`, error);
    
    if (error.response) {
      // 404 Not Found is expected for non-existent slugs
      if (error.response.status === 404) {
        return null;
      }
      
      const errorMessage = error.response.data?.message || 
                         error.response.data?.error || 
                         'Kategoriyani yuklashda xatolik';
      toast.error(errorMessage);
      throw new Error(`Server xatosi: ${error.response.status} - ${errorMessage}`);
    } else if (error.request) {
      toast.error("Serverga ulanishda xatolik. Iltimos, internet aloqasini tekshiring.");
      throw new Error("Serverga ulanishda xatolik");
    } else {
      toast.error("So'rov yuborishda xatolik yuz berdi");
      throw new Error(`So'rov yuborishda xatolik: ${error.message}`);
    }
  }
};

export const getColors = async () => {
  try {
    const res = await instance.get("/colors");
    
    // Handle different response formats
    if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data.data) {
      return res.data.data;
    } else if (res.data.colors) {
      return res.data.colors;
    }
    
    return [];
  } catch (error: any) {
    console.error("Error loading colors:", error);
    
    if (error.response) {
      const errorMessage = error.response.data?.message || 
                         error.response.data?.error || 
                         'Ranglarni yuklashda xatolik';
      toast.error(errorMessage);
      throw new Error(`Server xatosi: ${error.response.status} - ${errorMessage}`);
    } else if (error.request) {
      toast.error("Serverga ulanishda xatolik. Iltimos, internet aloqasini tekshiring.");
      throw new Error("Serverga ulanishda xatolik");
    } else {
      toast.error("So'rov yuborishda xatolik yuz berdi");
      throw new Error(`So'rov yuborishda xatolik: ${error.message}`);
    }
  }
};

export const getCurrency = async () => {
  try {
    const res = await instance.get("/currency");
    
    // Handle different response formats
    if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data.data) {
      return res.data.data;
    } else if (res.data.currencies) {
      return res.data.currencies;
    }
    
    return [];
  } catch (error: any) {
    console.error("Error loading currencies:", error);
    
    if (error.response) {
      const errorMessage = error.response.data?.message || 
                         error.response.data?.error || 
                         'Valyutalarni yuklashda xatolik';
      toast.error(errorMessage);
      throw new Error(`Server xatosi: ${error.response.status} - ${errorMessage}`);
    } else if (error.request) {
      toast.error("Serverga ulanishda xatolik. Iltimos, internet aloqasini tekshiring.");
      throw new Error("Serverga ulanishda xatolik");
    } else {
      toast.error("So'rov yuborishda xatolik yuz berdi");
      throw new Error(`So'rov yuborishda xatolik: ${error.message}`);
    }
  }
};

// Create Category DTO aligned with backend
export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  is_active?: boolean;
  sort_order?: number;
}

export const createCategory = async (dto: CreateCategoryDto) => {
  try {
    const res = await instance.post("/category", dto);
    return res.data;
  } catch (error: any) {
    console.error("Error creating category:", error);
    const msg = error?.response?.data?.message || error.message || 'Kategoriya yaratishda xatolik';
    toast.error(msg);
    throw error;
  }
};

export const updateCategory = async (id: number, dto: Partial<CreateCategoryDto>) => {
  try {
    const res = await instance.patch(`/category/${id}`, dto);
    return res.data;
  } catch (error: any) {
    console.error("Error updating category:", error);
    const msg = error?.response?.data?.message || error.message || 'Kategoriya yangilashda xatolik';
    toast.error(msg);
    throw error;
  }
};

export const deleteCategory = async (id: number) => {
  try {
    const res = await instance.delete(`/category/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Error deleting category:", error);
    const msg = error?.response?.data?.message || error.message || 'Kategoriya o\'chirishda xatolik';
    toast.error(msg);
    throw error;
  }
};
