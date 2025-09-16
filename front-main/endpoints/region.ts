import { toast } from "react-toastify";
import instance from "./instance";

export const getRegions = async () => {
  try {
    const res = await instance.get("/api/v1/region");
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};
