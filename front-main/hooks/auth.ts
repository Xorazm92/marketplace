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
      code,
    }: {
      phone_number: string;
      code: string;
    }) => verifyOtp({ phone_number, code }),
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
