import axios from "axios";
import { toast } from "react-toastify";
import instance from "./instance";

export const sendOtp = async (phone_number: string) => {
  try {
    const res = await instance.post("/api/v1/phone-auth/send-otp", { phone_number });
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(`Faild to register user ${error?.response?.data?.message}`);
  }
};

export const verifyOtp = async (data: { phone_number: string; otp_code: string; purpose?: 'registration' | 'login' | 'password_reset' }) => {
  try {
    const verifyPayload = {
      phone_number: data.phone_number,
      otp_code: data.otp_code,
      purpose: data.purpose || 'login'
    };
    const res = await instance.post("/api/v1/phone-auth/verify-otp", verifyPayload);
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

export const signUpUser = async (data: any) => {
  try {
    // Corrected endpoint based on user-auth.controller.ts
    const res = await instance.post("/api/v1/auth/user/signup/email", data);
    return res.data;
  } catch (error: any) {
    console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

export const loginUser = async (data: { phone_number: string; password: string }) => {
  try {
    // Format data for phone auth login
    const loginPayload = {
      phone_number: data.phone_number,
      otp_code: data.password // Assuming password field contains the OTP code
    };
    
    const res = await instance.post("/api/v1/phone-auth/login", loginPayload);
    return res.data;
  } catch (error: any) {
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
    toast.error(errorMessage);
    throw error;
  }
};

export const sign_OutUser = async () => {
  try {
    // Corrected endpoint based on unified-auth.controller.ts
    // The backend identifies the user via JWT, so no need to send userId
    const res = await instance.post(`/api/v1/auth/logout`);

    if (res.status === 200 || res.status === 201) {
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
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return null;
    }
    
    const res = await instance.get(`/api/v1/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Check if response is successful and has data
    if (res.status === 200 && res.data) {
      return res.data;
    }

    return null;
  } catch (error: any) {
    // If there's an error (e.g., 401 Unauthorized), return null
    console.error("Error fetching user data:", error);
    return null;
  }
};
