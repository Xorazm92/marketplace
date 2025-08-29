"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import style from "./user-sign-up.module.scss";
import { useSendOtp } from "@/hooks/auth";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "../../utils/local-storege";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/features/authSlice";
import { useRouter } from "next/router";

const VerifyOtpForm = ({ onNext }: { onNext: () => void }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dispatch = useDispatch();
  const router = useRouter();

  const { mutateAsync: sendOtp, isPending } = useSendOtp();
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    const storedUser = getLocalStorage("signup-user");
    setUser(storedUser);
    inputRefs.current[0]?.focus();
  }, []);

  const phone = user?.phoneNumber;

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("").slice(0, 6);
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    const user = getLocalStorage("signup-user");
    if (user) {
      setTimer(60);
      setResendEnabled(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      try {
        const response = await fetch('http://localhost:3001/api/v1/phone-auth/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number: user?.phoneNumber
          }),
        });

        const res = await response.json();

        if (res?.success) {
          toast.info("Telefon raqamingizga yuborilgan kodni kiriting");
        } else {
          toast.error(res?.message || "SMS yuborishda xatolik");
        }
      } catch (error) {
        console.error('Resend error:', error);
        toast.error("Tarmoq xatosi");
      }
    } else {
      return onNext();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const isCodeComplete = otp.every((digit) => digit !== "");

  if (!user || !user.phoneNumber) {
    return (
      <div className={style.sign_up}>
        <div className={style.form_wrapper}>
          <h3 className={style.title}>Noto'g'ri kirish</h3>
          <p>Iltimos, ro'yxatdan o'tishga o'ting.</p>
        </div>
      </div>
    );
  }

  const handleVerify = async () => {
    // get user info from local storge
    const user = getLocalStorage("signup-user");

    if (!user) {
      toast.error("Xatolik yuz berdi");
      return onNext();
    }
    const code = otp.join("");

    setVerifyLoading(true);

    // verify phone number by otp code using direct API call
    try {
      const verifyResponse = await fetch('http://localhost:3001/api/v1/phone-auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: user?.phoneNumber,
          otp_code: code
        }),
      });

      const res = await verifyResponse.json();

      if (res?.success) {
        // after verify phone number create user using new API
        try {
          const response = await fetch('http://localhost:3001/api/v1/phone-auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone_number: user?.phoneNumber,
              otp_code: code,
              first_name: user?.firstName,
              last_name: user?.lastName,
            }),
          });

          const data = await response.json();

          if (response.ok && data.success) {
            dispatch(loginSuccess({
              id: data.user.id,
              phone_number: data.user.phone_number,
              full_name: `${data.user.first_name} ${data.user.last_name}`
            }));

            router.push("/");

            setLocalStorage("accessToken", data.tokens.access_token);
            removeLocalStorage("signup-user");
            toast.success("Muvaffaqiyatli ro'yxatdan o'tdingiz", {});
          } else {
            toast.error(data.message || "Ro'yxatdan o'tishda xatolik");
          }
        } catch (error) {
          console.error('Register error:', error);
          toast.error("Tarmoq xatosi");
        }
      } else {
        toast.error(res?.message || "OTP kod noto'g'ri");
      }
    } catch (error) {
      console.error('Verify error:', error);
      toast.error("Tarmoq xatosi");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className={style.sign_up}>
      <div
        className={`${style.form_wrapper} ${
          verifyLoading ? style.loading_overlay : ""
        }`}
      >
        <h3 className={style.title}>{phone} raqamiga yuborilgan kodni kiriting</h3>

        <div className={style.otp_container}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el: any) => (inputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={style.otp_input}
              autoComplete="off"
            />
          ))}
        </div>

        <button
          disabled={!isCodeComplete}
          onClick={handleVerify}
          className={style.button}
        >
          Tasdiqlash
        </button>

        {resendEnabled ? (
          <button onClick={handleResend} className={style.resend_button}>
            Kodni qayta yuborish
          </button>
        ) : (
          <p className={style.timer}>
            Kod tugash vaqti {Math.floor(timer / 60)}:
            {String(timer % 60).padStart(2, "0")}
          </p>
        )}
      </div>

      {verifyLoading && (
        <div className={style.loading_spinner_overlay}>
          <div className={style.loading_spinner}></div>
        </div>
      )}
    </div>
  );
};

export default VerifyOtpForm;
