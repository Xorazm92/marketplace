import { toast } from "react-toastify";
import instance from "./instance";

export const getAllCategories = async () => {
  try {
    const res = await instance.get("/category");
    return res.data;
  } catch (error: any) {
    console.error("Error loading categories:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Kategoriyalarni yuklashda xatolik yuz berdi");
      throw new Error("Kategoriyalarni yuklashda xatolik yuz berdi");
    }
  }
};

export const getCategoryById = async (id: number) => {
  try {
    const res = await instance.get(`/category/${id}`);
    return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") console.log(error);
    // toast.error(` ${error.response.data.message}`);
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const res = await instance.get(`/category/slug/${slug}`);
    return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") console.log(error);
    // toast.error(` ${error.response.data.message}`);
  }
};

export const getColors = async () => {
  try {
    const res = await instance.get("/colors");
    return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

export const getCurrency = async () => {
  try {
    const res = await instance.get("/currency");
    return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

// Subcategory olish funksiyasi
export const getSubcategoriesByParent = async (parentId: number) => {
  try {
    const res = await instance.get(`/category/${parentId}/children`);
    return res.data;
  } catch (error: any) {
    console.error("Error loading subcategories:", error);
    if (process.env.NODE_ENV === "development") {
      console.log("Subcategory error for parent ID:", parentId, error);
    }
    return []; // Bo'sh array qaytarish xato bo'lsa
  }
};

// Kategoriya hierarchy bilan olish
export const getCategoriesWithHierarchy = async () => {
  try {
    const res = await instance.get("/category/hierarchy");
    return res.data;
  } catch (error: any) {
    console.error("Error loading category hierarchy:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Kategoriya daraxtini yuklashda xatolik");
    }
    throw error;
  }
};
