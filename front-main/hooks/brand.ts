import { useQuery } from "@tanstack/react-query";
import { getBrands } from "../endpoints/brand";

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
};
