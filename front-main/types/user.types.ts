export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_image?: string;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  profile_image?: File;
}

export interface UserSearchParams {
  query: string;
  page?: number;
  limit?: number;
}

export interface UserSearchResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}
