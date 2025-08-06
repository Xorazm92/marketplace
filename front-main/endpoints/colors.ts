import { toast } from "react-toastify";
import instance from "./instance";

export const getColors = async () => {
  try {
    const res = await instance.get("/colors");
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};
