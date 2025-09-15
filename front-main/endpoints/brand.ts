import { toast } from "react-toastify";
import instance from "./instance";

export const getBrands = async () => {
  try {
    const res = await instance.get("/brand");
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

export const createBrand = async (data: {
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
}) => {
  try {
    const res = await instance.post("/brand", data);
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(error.response?.data?.message || "Brend yaratishda xatolik");
    throw error;
  }
};

export const updateBrand = async (id: number, data: {
  name?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
}) => {
  try {
    const res = await instance.put(`/brand/${id}`, data);
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(error.response?.data?.message || "Brend yangilashda xatolik");
    throw error;
  }
};

export const deleteBrand = async (id: number) => {
  try {
    const res = await instance.delete(`/brand/${id}`);
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(error.response?.data?.message || "Brend o'chirishda xatolik");
    throw error;
  }
};
