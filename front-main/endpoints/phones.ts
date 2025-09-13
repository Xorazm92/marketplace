import instance from "./instance";
import { toast } from "react-toastify";

export const getPhones = async (id: number | undefined) => {
  try {
    console.log("phone-number: ", id);
    const res = await instance.get(`/phone-number/byUser/${id}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("accessToken") || "",
        )}`,
      },
    });
    console.log("phones: ", res.data);
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(
      error.response?.data?.message || "Телефон номерларини олишда хатолик",
    );
  }
};

export const addPhone = async (
  phone_number: string,
  user_id: number | undefined,
) => {
  try {
    const res = await instance.post(
      `/phone-number/byUser/${user_id}`,
      {
        user_id,
        phone_number,
        is_main: true,
      },
      {
        headers: {
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("accessToken") || "",
          )}`,
        },
      },
    );

    toast.success("Телефон рақам қўшилди");
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Телефон қўшишда хатолик");
  }
};

export const deletePhone = async (
  id: number | undefined,
  phone_id: number,
): Promise<boolean> => {
  try {
    console.log("user_id: ", id);
    console.log("phone_id: ", phone_id);
    const result = await instance.delete(
      `/phone-number/${id}?phoneId=${phone_id}`,
      {
        headers: {
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("accessToken") || "",
          )}`,
        },
      },
    );
    console.log("result: ", result);
    toast.success("Телефон рақам ўчирилди");
    return true;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Телефон ўчиришда хатолик");
    return false;
  }
};
