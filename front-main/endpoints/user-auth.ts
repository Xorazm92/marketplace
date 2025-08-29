import axios from "axios";
import { toast } from "react-toastify";
import instance from "./instance";

export const sendOtp = async (phone_number: string) => {
  try {
    const res = await instance.post("/phone-auth/send-otp", { phone_number });
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(`Faild to register user ${error?.response?.data?.message}`);
  }
};

export const verifyOtp = async (data: any) => {
  try {
    const res = await instance.post("/phone-auth/verify-otp", {
      phone_number: data.phone_number,
      otp_code: data.code
    });
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

export const signUpUser = async (data: any) => {
  try {
    const res = await instance.post("/user-auth/sign-up", data);
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

export const loginUser = async (data: any) => {
  try {
    const res = await instance.post("/user-auth/login", data);
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

export const sign_OutUser = async (userId: number | undefined) => {
  try {
    if (!userId) {
      console.warn("No user ID provided for sign-out");
      toast.error("User ID not found");
      return;
    }
    console.log("sign-out");
    const res = await instance.post(`/user-auth/sign-out`, { userId });
    console.log("res::: ", res);
    if (res.status === 201) {
      localStorage.removeItem("accessToken");
      toast.success("Successfully signed out");
      return res.data;
    } else {
      toast.error("Failed to sign out");
    }
  } catch (error: any) {
    console.error("Sign-out error:", error);
    toast.error(error?.response?.data?.message || "Sign out failed");
  }
};
export const getMe = async (id: number) => {
  try {
    const token = JSON.parse(localStorage.getItem("accessToken") || "");
    const res = await instance.get(`/user/${id}`);
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error?.response.data.message}`);
  }
};
