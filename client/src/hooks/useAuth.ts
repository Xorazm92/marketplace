import { useQuery } from "@tanstack/react-query";

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: 'admin' | 'seller' | 'buyer';
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
} | null;

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
