export interface User {
  id: number;
  phone_number: string;
  full_name: string;
  email?: string;
  profile_img?: string;
  is_active?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
