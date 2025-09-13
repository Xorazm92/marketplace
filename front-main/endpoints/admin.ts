import instance from './instance';

interface DashboardStats {
  totalProducts: number;
  pendingProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  approvedProducts: number;
  rejectedProducts: number;
}

interface AdminLoginData {
  phone_number: string;
  password: string;
}

interface AdminSignupData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  password: string;
}

// Named exports for convenient imports
export const login = (data: AdminLoginData) => instance.post('/admin/auth/phone-signin', data);
export const signup = (data: AdminSignupData) => instance.post('/admin/auth/phone-signup', data);
export const logout = () => instance.post('/admin/auth/logout');
export const getDashboardStats = () => instance.get<DashboardStats>('/admin/dashboard');
export const getUsers = (page: number = 1, limit: number = 20) => instance.get(`/admin/users?page=${page}&limit=${limit}`);
export const getProducts = (page: number = 1, limit: number = 20, status: string = '') => instance.get(`/admin/products?page=${page}&limit=${limit}&status=${status}`);
export const approveProduct = (id: number) => instance.put(`/admin/products/${id}/approve`);
export const rejectProduct = (id: number) => instance.put(`/admin/products/${id}/reject`);
export const getProfile = () => instance.get('/admin/profile');

// Aggregated API object
export const adminApi = {
  // Authentication
  login,

  signup,

  logout,

  // Dashboard
  getDashboardStats,

  // User management
  getUsers,

  // Product management
  getProducts,

  approveProduct,

  rejectProduct,

  // Profile
  getProfile,
};