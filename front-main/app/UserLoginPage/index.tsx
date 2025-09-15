"use client";

import React, { useState } from "react";
import style from "./user-login.module.scss";
import { useLogin } from "@/hooks/auth";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/features/authSlice";
import { isValidUzbekPhoneNumber } from "../../utils/validator";
import { setLocalStorage } from "../../utils/local-storege";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import TelegramLoginButton from "../../components/auth/TelegramLoginButton";

const UserLoginPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();

  const { mutateAsync: login, isPending: loading } = useLogin();
  const router = useRouter();
  const isPhoneValid = isValidUzbekPhoneNumber(phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || !password || !isPhoneValid) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }

    try {
      const res = await login({ phone_number: phone, password });
      console.log(res);
      if (res?.status_code === 200) {
        toast.success("Muvaffaqiyatli kirish");
        const { data } = res;
        dispatch(
          loginSuccess({
            id: data.id,
            phone_number: data.phone_number,
            full_name: data.full_name,
          }),
        );
        setLocalStorage("accessToken", data.accessToken);
        router.push("/");
      } else {
        toast.error(res?.message || "Kirish xatosi");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error?.response?.data?.message || "Server xatosi");
    }
  };

  return (
    <div className={style.sign_up}>
      <div className={style.form_wrapper}>
        <h3 className={style.title}>Hisobga kirish</h3>
        <form onSubmit={handleSubmit} className={style.form}>
          <input
            type="tel"
            placeholder="+998991871615"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${style.input} ${
              !isPhoneValid && phone ? style.invalid : ""
            }`}
            required
          />
          <input
            type="password"
            placeholder="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={style.input}
            required
          />
          <button type="submit" className={style.button} disabled={loading}>
            {loading ? <span className={style.loading_spinner} /> : "Kirish"}
          </button>
        </form>

        {/* Social Login Options */}
        <div className={style.social_login_section}>
          <div className={style.divider}>
            <span className={style.divider_text}>yoki</span>
          </div>
          
          <div className={style.social_buttons}>
            <GoogleSignInButton />
            <TelegramLoginButton 
              botName="your_bot_name" 
              onAuthCallback={(user) => {
                toast.success(`Xush kelibsiz, ${user.first_name}!`);
                // Handle successful login here
                dispatch(loginSuccess({
                  id: user.id,
                  phone_number: user.username || '',
                  full_name: `${user.first_name} ${user.last_name || ''}`.trim(),
                }));
                router.push("/");
              }}
              onError={(error) => {
                toast.error(`Xatolik: ${error.message}`);
              }}
            />
          </div>
        </div>

        <p className={style.link_text}>
          Hisobingiz yo'qmi?{" "}
          <a href="/sign-up" className={style.link}>
            Ro'yxatdan o'ting
          </a>
        </p>
      </div>
    </div>
  );
};

export default UserLoginPage;
