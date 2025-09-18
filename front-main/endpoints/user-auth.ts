import axios from "axios";
import { toast } from "react-toastify";
import instance from "./instance";

// Format phone number to +998XXXXXXXXX format
const formatPhoneNumber = (phone?: string): string => {
  if (!phone) {
    console.error("❌ phone is undefined in formatPhoneNumber");
    return "";
  }
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it's a local number (starts with 9), add +998
  if (digits.startsWith('9') && digits.length === 9) {
    return `+998${digits}`;
  }
  
  // If it's already in international format (starts with 998), add +
  if (digits.startsWith('998') && digits.length === 12) {
    return `+${digits}`;
  }
  
  // If it's already in international format with +, return as is
  if (phone.startsWith('+998') && digits.length === 12) {
    return phone;
  }
  
  // If we can't determine the format, return the original
  return phone;
};

export const sendOtp = async (phone_number: string) => {
  try {
    const formattedPhone = formatPhoneNumber(phone_number);
    const requestPayload = { phone_number: formattedPhone };
    
    // Debug logging
    if (process.env.NODE_ENV === "development") console.log("📱 OTP Request Payload:", requestPayload);
    if (process.env.NODE_ENV === "development") console.log("📱 Original phone number:", phone_number);
    if (process.env.NODE_ENV === "development") console.log("📱 Formatted phone number:", formattedPhone);
    
    const res = await instance.post("/otp/send", requestPayload);
    
    if (process.env.NODE_ENV === "development") console.log("📱 OTP Response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error('❌ OTP Send Error:', error);
    console.error('❌ Error response data:', error?.response?.data);
    console.error('❌ Error status:', error?.response?.status);
    
    const errorMessage = error?.response?.data?.message || 'Failed to send OTP. Please try again.';
    toast.error(errorMessage);
    throw error; // Re-throw to allow error handling in the component
  }
};

interface VerifyOtpData {
  verification_key: string;
  code: string;
}

export const verifyOtp = async (data: VerifyOtpData) => {
  try {
    if (!data.verification_key) {
      throw new Error("❌ Verification key is required for OTP verification");
    }
    
    if (!data.code) {
      throw new Error("❌ OTP code is required for verification");
    }
    
    const res = await instance.post("/otp/verify", data);
    return res.data;
  } catch (error: any) {
    console.error('OTP Verification Error:', error);
    const errorMessage = error?.response?.data?.message || 'Failed to verify OTP. Please try again.';
    toast.error(errorMessage);
    throw error; // Re-throw to allow error handling in the component
  }
};

export const signUpUser = async (data: any) => {
  try {
    const res = await instance.post("/user-auth/sign-up", data);
    return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") console.log(error);
    toast.error(` ${error.response.data.message}`);
  }
};

export const loginUser = async (data: any) => {
  try {
    const res = await instance.post("/user-auth/login", data);
    return res.data;
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") console.log(error);
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
    if (process.env.NODE_ENV === "development") console.log("sign-out");
    const res = await instance.post(`/user-auth/sign-out`, { userId });
    if (process.env.NODE_ENV === "development") console.log("res::: ", res);
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
    if (process.env.NODE_ENV === "development") console.log(error);
    toast.error(` ${error?.response.data.message}`);
  }
};
