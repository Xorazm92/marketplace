import instance from './instance';

<<<<<<< HEAD
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
=======
export const getDashboardStats = async () => {
  const token = localStorage.getItem('admin_access_token');
  const response = await instance.get('/api/v1/admin/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getUsersAdmin = async (page: number = 1, limit: number = 10) => {
  const token = localStorage.getItem('admin_access_token');
  const response = await instance.get(`/api/v1/admin/users?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getProductsAdmin = async (page: number = 1, limit: number = 10, status?: string) => {
  const token = localStorage.getItem('admin_access_token');
  const url = `/api/v1/admin/products?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`;
  const response = await instance.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const approveProduct = async (productId: number) => {
  const token = localStorage.getItem('admin_access_token') || localStorage.getItem('accessToken');
  try {
    const response = await instance.put(`/api/v1/admin/products/${productId}/approve`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    // If lacking APPROVE_PRODUCT permission (403), try fallback endpoint guarded by AdminGuard
    if (err?.response?.status === 403) {
      try {
        const fallback = await instance.get(`/api/v1/product/approved/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        return fallback.data;
      } catch (fallbackErr) {
        throw err; // surface original 403
      }
    }
    throw err;
  }
};

export const rejectProduct = async (productId: number, reason?: string) => {
  const token = localStorage.getItem('admin_access_token');
  const response = await instance.put(`/api/v1/admin/products/${productId}/reject`, { reason }, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const sendBulkEmail = async (subject: string, content: string, userIds?: number[]) => {
  const response = await instance.post('/api/v1/notifications/bulk-email', {
    subject,
    content,
    userIds
  });
  return response.data;
};

export const getOrdersAdmin = async (page: number = 1, limit: number = 10, status?: string) => {
  const url = `/api/v1/admin/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`;
  const response = await instance.get(url);
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const response = await instance.put(`/api/v1/admin/orders/${orderId}/status`, { status });
  return response.data;
};
>>>>>>> 7a50308 (auth)
