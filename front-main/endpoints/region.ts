import { toast } from "react-toastify";
import instance from "./instance";

export const getRegions = async () => {
  try {
    const res = await instance.get("/region");
    return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};
