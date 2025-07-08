import Cookies from "js-cookie";

export const setClientToken = (token: string) => {
  Cookies.set("accessToken", token, {
    expires: 5,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};

export const getClientToken = () => {
  return Cookies.get("accessToken");
};

export const removeClientToken = () => {
  Cookies.remove("accessToken", { path: "/" });
};
