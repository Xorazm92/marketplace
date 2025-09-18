import instance from "./instance";
import { toast } from "react-toastify";

export const getEmails = async (id: number | undefined) => {
  try {
    if (process.env.NODE_ENV === "development") console.log(
      "keldi: ",
      JSON.parse(localStorage.getItem("accessToken") || ""),
    );
    const res = await instance.get(`/email/byUser/${id}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("accessToken") || "",
        )}`,
      },
    });
    if (process.env.NODE_ENV === "development") console.log("keldi4", res.data);
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Почталарни олишда хатолик");
  }
};

export const addEmail = async (id: number | undefined, email: string) => {
  try {
    if (process.env.NODE_ENV === "development") console.log("my email: ", email);
    const res = await instance.post(
      `/email/byUser/${id}`,
      { user_id: id, email, is_main: true },
      {
        headers: {
          Authorization: `Bearer ${JSON.parse(
            localStorage.getItem("accessToken") || "",
          )}`,
        },
      },
    );
    toast.success("Почта қўшилди");
    return res.data;
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Почта қўшишда хатолик");
  }
};

export const deleteEmail = async (
  email_id: number,
  user_id: number | undefined,
) => {
  try {
    if (process.env.NODE_ENV === "development") console.log("email_id: ", email_id);
    if (process.env.NODE_ENV === "development") console.log("user_id: ", user_id);
    await instance.delete(`/email/${user_id}?emailId=${email_id}`, {
      headers: {
        Authorization: `Bearer ${JSON.parse(
          localStorage.getItem("accessToken") || "",
        )}`,
      },
    });
    toast.success("Почта ўчирилди");
  } catch (error: any) {
    console.error(error);
    toast.error(error.response?.data?.message || "Почта ўчиришда хатолик");
  }
};
