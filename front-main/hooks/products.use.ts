import { useMutation, useQuery } from "@tanstack/react-query";
import { addProductImage, deleteProductImage, getAllProducts, getProductById, getProducts, updateProduct } from "../endpoints";
import type { CreateProductProps, UpdateProductProps } from "../types";
import { AddressData } from "../types/userData";

export const useProducts = (
  page: number,
  filters: Record<string, string> = {},
) => {
  return useQuery({
    queryKey: ["products", page, filters],
    queryFn: () => getProducts(page, filters),
    enabled: true, // Har doim chaqiriladi
  });
};

export const useProductById = (id?: number) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => {
      if (!id) return Promise.reject("Invalid product id");
      return getProductById(id);
    },
    enabled: !!id,
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ["all-products"],
    queryFn: () => getAllProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useAddProductImage = () => {
  return useMutation({
    mutationFn: ({ productId, image }: { productId: number; image: File }) => 
      addProductImage(productId, image),
  });
};

export const useDeleteProductImage = ( productId: number,imageId: number,) => {
  return useMutation({
    mutationFn: () => deleteProductImage(productId,imageId),
  });
};

export const useEditProduct = () => {
  return useMutation({
    mutationFn: ([id, data, addressData]: [number, UpdateProductProps, AddressData]) => 
      updateProduct(id, data, addressData),
  });
};