import { toast } from "react-toastify";
import instance from "./instance";

export const getAllCategories = async () => {
  try {
    const res = await instance.get("/category");
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

export const getCategoryById = async (id: number) => {
  try {
    const res = await instance.get(`/category/${id}`);
    return res.data;
  } catch (error: any) {
    console.log(error);
    // toast.error(` ${error.response.data.message}`);
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const res = await instance.get(`/category/slug/${slug}`);
    return res.data;
  } catch (error: any) {
    console.log(error);
    // toast.error(` ${error.response.data.message}`);
  }
};

export const getColors = async () => {
  try {
    const res = await instance.get("/colors");
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

export const getCurrency = async () => {
  try {
    const res = await instance.get("/currency");
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};
