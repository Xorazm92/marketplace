import { Address } from "../types";
import instance from "./instance";
import { toast } from "react-toastify";
import { AddAddress } from "../app/Settings/components/AddressSection/AddressSection";

export const getAddresses = async (id: number | undefined) => {
  try {
    const res = await instance.get(`/address/byUser/${id}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("accessToken") || "",
        )}`,
      },
    });
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Манзилларни олишда хатолик");
  }
};

export const addAddress = async (address: AddAddress) => {
  try {
    console.log("address: ", address);
    const res = await instance.post(
      `/address/byUser/${address.user_id}`,
      address, // ✅ to'g'ridan-to'g'ri yuboriladi
      {
        headers: {
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("accessToken") || "",
          )}`,
        },
      },
    );

    toast.success("Манзил қўшилди");
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Манзил қўшишда хатолик");
  }
};


export const deleteAddress = async (id: number, user_id: number | undefined) => {
  try {
    await instance.delete(`/address/${user_id}?addressId=${id}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem('accessToken') || '',
        )}`,
      },
    });
    toast.success('Манзил ўчирилди');

    return true;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Манзил ўчиришда хатолик");
    return false;
  }
};
