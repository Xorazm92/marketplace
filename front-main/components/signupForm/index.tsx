"use client";

import type React from "react";
import { useState } from "react";
import style from "./user-sign-up.module.scss";
import { isValidUzbekPhoneNumber } from "../../utils/validator";
import { setLocalStorage } from "../../utils/local-storege";
import { useSendOtp } from "../../hooks/auth";
import { toast } from "react-toastify";

const UserSignUpForm = ({ onNext }: { onNext: () => void }) => {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    password: "",
    phoneNumber: "+998881070125",
  });

  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const isPhoneValid = isValidUzbekPhoneNumber(user.phoneNumber);
  const isFormValid =
    user.firstName && user.lastName && user.password && isPhoneValid;

  const { mutateAsync: sendOtp, isPending } = useSendOtp();

  const handleSubmit = async () => {
    const res = await sendOtp(user.phoneNumber, {});
    if (res?.status == 200) {
      setLocalStorage("signup-user", { ...user, key: res?.key });
      onNext();
      toast.info("Telefon raqamingizga yuborilgan kodni kiriting");
    }
  };

  return (
    <div className={style.sign_up}>
      <div className={style.form_wrapper}>
        <h2 className={style.form_title}>Ro'yxatdan o'tish</h2>

        <div className={style.input_group}>
          <label htmlFor="firstName" className={style.input_label}>
            Ism
          </label>
          <input
            id="firstName"
            name="firstName"
            placeholder="Ismingizni kiriting"
            onChange={handleChange}
            value={user.firstName}
            className={style.input}
            onFocus={() => setFocused("firstName")}
            onBlur={() => setFocused(null)}
          />
        </div>

        <div className={style.input_group}>
          <label htmlFor="lastName" className={style.input_label}>
            Familiya
          </label>
          <input
            id="lastName"
            name="lastName"
            placeholder="Familiyangizni kiriting"
            onChange={handleChange}
            value={user.lastName}
            className={style.input}
            onFocus={() => setFocused("lastName")}
            onBlur={() => setFocused(null)}
          />
        </div>

        <div className={style.input_group}>
          <label htmlFor="password" className={style.input_label}>
            Parol
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Parol yarating"
            required
            onChange={handleChange}
            value={user.password}
            min={4}
            className={style.input}
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
          />
        </div>

        <div className={style.input_group}>
          <label htmlFor="phoneNumber" className={style.input_label}>
            Telefon raqam
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            placeholder="+998991234567"
            onChange={handleChange}
            value={user.phoneNumber}
            className={`${style.input} ${
              !isPhoneValid && user.phoneNumber ? style.invalid : ""
            }`}
            onFocus={() => setFocused("phoneNumber")}
            onBlur={() => setFocused(null)}
          />
          {!isPhoneValid && user.phoneNumber && (
            <p className={style.error_message}>
              To'g'ri telefon raqam kiriting
            </p>
          )}
        </div>

        <button
          disabled={!isFormValid || isPending}
          onClick={handleSubmit}
          className={style.button}
        >
          {isPending ? (
            <span className={style.loading_spinner}></span>
          ) : (
            "Ro'yxatdan o'tish"
          )}
        </button>
        <p className={style.link_text}>
          Hisobingiz bormi?{" "}
          <a href="/login" className={style.link}>
            Kirish
          </a>
        </p>
      </div>
    </div>
  );
};

export default UserSignUpForm;
