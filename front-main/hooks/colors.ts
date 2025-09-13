import { useQuery } from "@tanstack/react-query";
import { getColors } from "../endpoints/colors";

export const useColors = () => {
  return useQuery({
    queryKey: ["colors"],
    queryFn: getColors,
  });
};
