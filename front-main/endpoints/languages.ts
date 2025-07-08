import instance from "./instance";
import { toast } from "react-toastify";

export const getLanguages = async () => {
  try {
    const res = await instance.get("/languages");
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Тилларни олишда хатолик");
  }
};

export const setLanguage = async (language: string) => {
  try {
    const res = await instance.post("/languages/select", { language });
    toast.success("Тил танланди");
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Тилни сақлашда хатолик");
  }
};
