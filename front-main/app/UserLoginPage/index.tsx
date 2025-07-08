"use client";

import React, { useState } from "react";
import style from "./user-login.module.scss";
import { useLogin } from "@/hooks/auth";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/features/authSlice";
import { isValidUzbekPhoneNumber } from "../../utils/validator";
import { setLocalStorage } from "../../utils/local-storege";
import { useRouter } from "next/router";

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
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    try {
      const res = await login({ phone_number: phone, password });
      console.log(res);
      if (res?.status_code === 200) {
        toast.success("Успешный вход");
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
        toast.error("Ошибка входа");
      }
    } catch (error) {
      toast.error("Ошибка сервера");
    }
  };

  return (
    <div className={style.sign_up}>
      <div className={style.form_wrapper}>
        <h3 className={style.title}>Вход в аккаунт</h3>
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
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={style.input}
            required
          />
          <button type="submit" className={style.button} disabled={loading}>
            {loading ? <span className={style.loading_spinner} /> : "Войти"}
          </button>
        </form>
        <p className={style.link_text}>
          Нет аккаунта?{" "}
          <a href="/sign-up" className={style.link}>
            Зарегистрируйтесь
          </a>
        </p>
      </div>
    </div>
  );
};

export default UserLoginPage;
