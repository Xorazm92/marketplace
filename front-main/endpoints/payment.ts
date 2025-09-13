import instance from "./instance";
import { toast } from "react-toastify";

// Payment API endpoints

// Click Payment
export const createClickPayment = async (paymentData: {
  order_id: number;
  amount: number;
  return_url?: string;
  description?: string;
}) => {
  try {
    const res = await instance.post("/payment/click/create", paymentData);
    toast.success("Click to'lov yaratildi!");
    return res.data;
  } catch (error: any) {
    console.error("Error creating Click payment:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Click to'lov yaratishda xatolik yuz berdi");
      throw new Error("Click to'lov yaratishda xatolik yuz berdi");
    }
  }
};

export const verifyClickPayment = async (paymentId: string, status: string) => {
  try {
    const res = await instance.get(`/payment/click/verify?payment_id=${paymentId}&status=${status}`);
    return res.data;
  } catch (error: any) {
    console.error("Error verifying Click payment:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Click to'lovni tekshirishda xatolik yuz berdi");
      throw new Error("Click to'lovni tekshirishda xatolik yuz berdi");
    }
  }
};

// Payme Payment
export const createPaymePayment = async (paymentData: {
  order_id: number;
  amount: number;
  return_url?: string;
  description?: string;
}) => {
  try {
    const res = await instance.post("/payment/payme/create", paymentData);
    toast.success("Payme to'lov yaratildi!");
    return res.data;
  } catch (error: any) {
    console.error("Error creating Payme payment:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Payme to'lov yaratishda xatolik yuz berdi");
      throw new Error("Payme to'lov yaratishda xatolik yuz berdi");
    }
  }
};

export const verifyPaymePayment = async (paymentId: string, status: string) => {
  try {
    const res = await instance.get(`/payment/payme/verify?payment_id=${paymentId}&status=${status}`);
    return res.data;
  } catch (error: any) {
    console.error("Error verifying Payme payment:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Payme to'lovni tekshirishda xatolik yuz berdi");
      throw new Error("Payme to'lovni tekshirishda xatolik yuz berdi");
    }
  }
};

// Generic payment methods
export const getPaymentMethods = async () => {
  try {
    const res = await instance.get("/payment-methods");
    return res.data;
  } catch (error: any) {
    console.error("Error loading payment methods:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("To'lov usullarini yuklashda xatolik yuz berdi");
      throw new Error("To'lov usullarini yuklashda xatolik yuz berdi");
    }
  }
};

export const getPaymentHistory = async (page: number = 1, limit: number = 10) => {
  try {
    const res = await instance.get(`/payment?page=${page}&limit=${limit}`);
    return res.data;
  } catch (error: any) {
    console.error("Error loading payment history:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("To'lov tarixini yuklashda xatolik yuz berdi");
      throw new Error("To'lov tarixini yuklashda xatolik yuz berdi");
    }
  }
};

// Payment processing helper
export const processPayment = async (
  method: 'click' | 'payme',
  orderData: {
    order_id: number;
    amount: number;
    return_url?: string;
    description?: string;
  }
) => {
  try {
    let paymentResponse;
    
    if (method === 'click') {
      paymentResponse = await createClickPayment(orderData);
    } else if (method === 'payme') {
      paymentResponse = await createPaymePayment(orderData);
    } else {
      throw new Error('Noto\'g\'ri to\'lov usuli');
    }

    // Redirect to payment gateway
    if (paymentResponse.payment_url) {
      window.location.href = paymentResponse.payment_url;
    }

    return paymentResponse;
  } catch (error: any) {
    console.error("Error processing payment:", error);
    throw error;
  }
};

export default {
  createClickPayment,
  verifyClickPayment,
  createPaymePayment,
  verifyPaymePayment,
  getPaymentMethods,
  getPaymentHistory,
  processPayment,
};
