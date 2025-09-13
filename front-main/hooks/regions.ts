import { useQuery } from "@tanstack/react-query";
import { getColors } from "../endpoints/colors";
import { getRegions } from "../endpoints/region";

export const useRegions = () => {
  return useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });
};
