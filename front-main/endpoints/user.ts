import { toast } from "react-toastify";
import instance from "./instance";
import { AddressData } from "../types/userData";

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
export const updateUser = async (id: number, data: FormData) => {
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

    return response.data;
  } catch (error) {
    console.error("Ошибка при обновлении пользователя", error);
    throw error;
  }
};
