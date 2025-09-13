import instance from "./instance";
import { toast } from "react-toastify";

// Order API endpoints
export const createOrder = async (orderData: any) => {
  try {
    const res = await instance.post("/orders", orderData);
    toast.success("Buyurtma muvaffaqiyatli yaratildi!");
    return res.data;
  } catch (error: any) {
    console.error("Error creating order:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Buyurtma yaratishda xatolik yuz berdi");
      throw new Error("Buyurtma yaratishda xatolik yuz berdi");
    }
  }
};

export const getOrders = async (page: number = 1, limit: number = 10, status?: string) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }
    
    const res = await instance.get(`/orders?${params.toString()}`);
    return res.data;
  } catch (error: any) {
    console.error("Error loading orders:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Buyurtmalarni yuklashda xatolik yuz berdi");
      throw new Error("Buyurtmalarni yuklashda xatolik yuz berdi");
    }
  }
};

export const getOrderById = async (orderId: number) => {
  try {
    const res = await instance.get(`/orders/${orderId}`);
    return res.data;
  } catch (error: any) {
    console.error("Error loading order:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Buyurtmani yuklashda xatolik yuz berdi");
      throw new Error("Buyurtmani yuklashda xatolik yuz berdi");
    }
  }
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const res = await instance.patch(`/orders/${orderId}/status`, { status });
    toast.success("Buyurtma holati yangilandi!");
    return res.data;
  } catch (error: any) {
    console.error("Error updating order status:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Buyurtma holatini yangilashda xatolik yuz berdi");
      throw new Error("Buyurtma holatini yangilashda xatolik yuz berdi");
    }
  }
};

export const getOrderStatistics = async () => {
  try {
    const res = await instance.get("/orders/admin/statistics");
    return res.data;
  } catch (error: any) {
    console.error("Error loading order statistics:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Statistikani yuklashda xatolik yuz berdi");
      throw new Error("Statistikani yuklashda xatolik yuz berdi");
    }
  }
};
