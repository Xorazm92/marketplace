import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getMe,
  loginUser,
  sendOtp,
  signUpUser,
  verifyOtp,
} from "../endpoints/user-auth";

export const useSendOtp = () =>
  useMutation({
    mutationFn: (phone_number: string) => sendOtp(phone_number),
  });

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: ({
      phone_number,
      otp_code,
      purpose,
    }: {
      phone_number: string;
      otp_code: string;
      purpose?: 'registration' | 'login' | 'password_reset';
    }) => verifyOtp({ phone_number, otp_code, purpose }),
  });

export const useSignUp = () =>
  useMutation({
    mutationFn: (user: any) => signUpUser(user),
  });

export const useLogin = () =>
  useMutation({
    mutationFn: ({
      phone_number,
      password,
    }: {
      phone_number: string;
      password: string;
    }) => loginUser({ phone_number, password }),
  });

export const useGetMe = (id: number) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getMe(id),
    enabled: !!id,
  });
};
