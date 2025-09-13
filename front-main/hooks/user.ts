import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAddress,
  getRegions,
  getDistricts,
  getRegionById,
  updateUser,
} from "../endpoints/user";
import { AddressData } from "../types/userData";
import { toast } from "react-toastify";
import { getPhones } from "../endpoints/phones";

export const useUserPhoneNumbers = (id: number | undefined) =>
  useQuery({
    queryKey: ["user_phone_numbers", id],
    queryFn: () => getPhones(id),
  });

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddressData) => createAddress(data),
    onSuccess: () => {
      toast.success("Адрес успешно создан!");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Ошибка при создании адреса");
    },
  });
};

export const useGetRegions = () =>
  useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

export const useGetRegionById = (id: number) =>
  useQuery({
    queryKey: ["region", id],
    queryFn: () => getRegionById(id),
    enabled: !!id,
  });

export const useGetDistricts = () =>
  useQuery({
    queryKey: ["districts"],
    queryFn: getDistricts,
  });

export const useUpdateUser = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData) => updateUser(id, data),

    onSuccess: () => {
      toast.success("Профиль успешно обновлен!");
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Ошибка при обновлении пользователя";
      toast.error(message);
    },
  });
};
