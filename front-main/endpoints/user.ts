import { toast } from "react-toastify";
import instance from "./instance";
import { AddressData } from "../types/userData";
import { User, UpdateUserData, UserSearchParams, UserSearchResponse } from "../types/user.types";

const getToken = (): string => {
  try {
    const token = localStorage.getItem("accessToken");
    return token ? JSON.parse(token) : "";
  } catch (e) {
    console.error("Failed to parse token", e);
    return "";
  }
};

export const getUserPhoneNumbers = async (id: number | string) => {
  try {
    const res = await instance.get(`/phone-number/byUser/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(
      error.response?.data?.message || "Ошибка получения номеров телефона",
    );
    throw error;
  }
};

export const getRegions = async () => {
  try {
    const res = await instance.get(`/region`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Ошибка получения регионов");
    throw error;
  }
};

export const getRegionById = async (id: number) => {
  try {
    const res = await instance.get(`/region/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Ошибка получения региона");
    throw error;
  }
};

export const getDistricts = async () => {
  try {
    const res = await instance.get(`/district`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Ошибка получения районов");
    throw error;
  }
};

export const createAddress = async (data: AddressData) => {
  try {
    const res = await instance.post(`/address`, data, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Ошибка создания адреса");
    throw error;
  }
};

export const getAddresses = async () => {
  try {
    const res = await instance.get(`/address`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Ошибка получения адресов");
    throw error;
  }
};
export const updateUser = async (id: number, data: FormData): Promise<User> => {
  try {
    console.log("FormData ichidagi qiymatlar:");
    for (const pair of data.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    const response = await instance.put(`/user/${id}`, data, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Foydalanuvchi ma'lumotlari yangilandi!");
    return response.data;
  } catch (error: any) {
    console.error("Ошибка при обновлении пользователя", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Foydalanuvchi ma'lumotlarini yangilashda xatolik");
    }
    throw error;
  }
};

// New user management functions
export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<UserSearchResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const res = await instance.get(`/user?${params}`);
    return res.data;
  } catch (error: any) {
    console.error("Error loading users:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Foydalanuvchilarni yuklashda xatolik");
    }
    throw error;
  }
};

export const searchUsers = async (params: UserSearchParams): Promise<UserSearchResponse> => {
  try {
    const searchParams = new URLSearchParams({
      query: params.query,
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString(),
    });
    const res = await instance.get(`/user/search?${searchParams}`);
    return res.data;
  } catch (error: any) {
    console.error("Error searching users:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Foydalanuvchilarni qidirishda xatolik");
    }
    throw error;
  }
};

export const getUserById = async (id: number): Promise<User> => {
  try {
    const res = await instance.get(`/user/${id}`);
    return res.data;
  } catch (error: any) {
    console.error("Error loading user:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Foydalanuvchini yuklashda xatolik");
    }
    throw error;
  }
};

export const blockUser = async (id: number): Promise<User> => {
  try {
    const res = await instance.patch(`/user/${id}/block`);
    toast.success("Foydalanuvchi bloklandi!");
    return res.data;
  } catch (error: any) {
    console.error("Error blocking user:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Foydalanuvchini bloklashda xatolik");
    }
    throw error;
  }
};

export const unblockUser = async (id: number): Promise<User> => {
  try {
    const res = await instance.patch(`/user/${id}/unblock`);
    toast.success("Foydalanuvchi blokdan chiqarildi!");
    return res.data;
  } catch (error: any) {
    console.error("Error unblocking user:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Foydalanuvchini blokdan chiqarishda xatolik");
    }
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    await instance.delete(`/user/${id}`);
    toast.success("Foydalanuvchi o'chirildi!");
  } catch (error: any) {
    console.error("Error deleting user:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Foydalanuvchini o'chirishda xatolik");
    }
    throw error;
  }
};
