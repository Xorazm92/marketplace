import instance from './instance';
import { toast } from 'react-toastify';

// Admin authentication with email/password
export const adminLogin = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const res = await instance.post('/auth/admin/sign-in', credentials);
    
    if (res.data.success && res.data.data) {
      // Save admin tokens
      localStorage.setItem('admin_access_token', res.data.data.accessToken);
      localStorage.setItem('admin_refresh_token', res.data.data.refreshToken);
      localStorage.setItem('admin_user_data', JSON.stringify(res.data.data.user));
      
      toast.success('Admin login successful!');
      return res.data;
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error: any) {
    console.error('Admin login error:', error);
    const errorMessage = error?.response?.data?.message || 'Admin login failed';
    toast.error(errorMessage);
    throw error;
  }
};

// Admin phone authentication - Send OTP
export const sendAdminOtp = async (phoneNumber: string, purpose: 'registration' | 'login' = 'login') => {
  try {
    const res = await instance.post('/admin/auth/send-otp', {
      phone_number: phoneNumber,
      purpose
    });
    toast.success('OTP sent successfully');
    return res.data;
  } catch (error: any) {
    console.error('Failed to send OTP:', error);
    toast.error(error?.response?.data?.message || 'Failed to send OTP');
    throw error;
  }
};

// Admin phone signup
export const adminPhoneSignUp = async (data: {
  phone_number: string;
  first_name: string;
  last_name: string;
  password: string;
  otp_code: string;
  role?: 'ADMIN' | 'MODERATOR';
}) => {
  try {
    const res = await instance.post('/admin/auth/phone-signup', data);
    
    if (res.data.access_token) {
      localStorage.setItem('admin_access_token', res.data.access_token);
      localStorage.setItem('admin_user_data', JSON.stringify(res.data.admin));
      toast.success('Admin registration successful!');
    }
    
    return res.data;
  } catch (error: any) {
    console.error('Admin signup error:', error);
    toast.error(error?.response?.data?.message || 'Admin signup failed');
    throw error;
  }
};

// Admin phone signin
export const adminPhoneSignIn = async (data: {
  phone_number: string;
  password: string;
}) => {
  try {
    const res = await instance.post('/admin/auth/phone-signin', data);
    
    if (res.data.access_token) {
      localStorage.setItem('admin_access_token', res.data.access_token);
      localStorage.setItem('admin_user_data', JSON.stringify(res.data.admin));
      toast.success('Admin login successful!');
    }
    
    return res.data;
  } catch (error: any) {
    console.error('Admin signin error:', error);
    toast.error(error?.response?.data?.message || 'Admin signin failed');
    throw error;
  }
};

// Admin OTP login
export const adminOtpLogin = async (data: {
  phone_number: string;
  otp_code: string;
}) => {
  try {
    const res = await instance.post('/admin/auth/otp-login', data);
    
    if (res.data.access_token) {
      localStorage.setItem('admin_access_token', res.data.access_token);
      localStorage.setItem('admin_user_data', JSON.stringify(res.data.admin));
      toast.success('Admin login successful!');
    }
    
    return res.data;
  } catch (error: any) {
    console.error('Admin OTP login error:', error);
    toast.error(error?.response?.data?.message || 'Admin OTP login failed');
    throw error;
  }
};

// Admin logout
export const adminLogout = async () => {
  try {
    await instance.post('/admin/auth/logout');
    
    // Clear admin tokens
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user_data');
    
    toast.success('Admin logged out successfully');
    
    // Redirect to admin login
    window.location.href = '/admin/login';
  } catch (error: any) {
    console.error('Admin logout error:', error);
    // Clear tokens anyway
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user_data');
    
    window.location.href = '/admin/login';
  }
};

// Get admin dashboard stats
export const getAdminDashboardStats = async () => {
  try {
    const res = await instance.get('/admin/dashboard');
    return res.data;
  } catch (error: any) {
    console.error('Failed to get dashboard stats:', error);
    toast.error('Failed to load dashboard statistics');
    throw error;
  }
};

// Get users for admin management
export const getAdminUsers = async (page = 1, limit = 10) => {
  try {
    const res = await instance.get('/admin/users', {
      params: { page, limit }
    });
    return res.data;
  } catch (error: any) {
    console.error('Failed to get users:', error);
    toast.error('Failed to load users');
    throw error;
  }
};

// Get products for admin management
export const getAdminProducts = async (page = 1, limit = 10, status?: string) => {
  try {
    const res = await instance.get('/admin/products', {
      params: { page, limit, status }
    });
    return res.data;
  } catch (error: any) {
    console.error('Failed to get products:', error);
    toast.error('Failed to load products');
    throw error;
  }
};

// Approve product
export const approveProduct = async (productId: number) => {
  try {
    const res = await instance.put(`/admin/products/${productId}/approve`);
    toast.success('Product approved successfully');
    return res.data;
  } catch (error: any) {
    console.error('Failed to approve product:', error);
    toast.error('Failed to approve product');
    throw error;
  }
};

// Reject product
export const rejectProduct = async (productId: number, reason?: string) => {
  try {
    const res = await instance.put(`/admin/products/${productId}/reject`, { reason });
    toast.success('Product rejected successfully');
    return res.data;
  } catch (error: any) {
    console.error('Failed to reject product:', error);
    toast.error('Failed to reject product');
    throw error;
  }
};

// Get admin profile
export const getAdminProfile = async () => {
  try {
    const res = await instance.get('/admin/profile');
    return res.data;
  } catch (error: any) {
    console.error('Failed to get admin profile:', error);
    toast.error('Failed to load admin profile');
    throw error;
  }
};

export const getDashboardStats = async () => {
  const token = localStorage.getItem('admin_access_token');
  const response = await instance.get('/admin/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getUsersAdmin = async (page: number = 1, limit: number = 10) => {
  const token = localStorage.getItem('admin_access_token');
  const response = await instance.get(`/admin/users?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getProductsAdmin = async (page: number = 1, limit: number = 10, status?: string) => {
  const token = localStorage.getItem('admin_access_token');
  const url = `/admin/products?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`;
  const response = await instance.get(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const approveProductOld = async (productId: number) => {
  const token = localStorage.getItem('admin_access_token') || localStorage.getItem('accessToken');
  try {
    const response = await instance.put(`/admin/products/${productId}/approve`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err: any) {
    // If lacking APPROVE_PRODUCT permission (403), try fallback endpoint guarded by AdminGuard
    if (err?.response?.status === 403) {
      try {
        const fallback = await instance.get(`/product/approved/${productId}`, {
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

export const rejectProductOld = async (productId: number, reason?: string) => {
  const token = localStorage.getItem('admin_access_token');
  const response = await instance.put(`/admin/products/${productId}/reject`, { reason }, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
};

export const sendBulkEmail = async (subject: string, content: string, userIds?: number[]) => {
  const response = await instance.post('/notifications/bulk-email', {
    subject,
    content,
    userIds
  });
  return response.data;
};

export const getOrdersAdmin = async (page: number = 1, limit: number = 10, status?: string) => {
  const url = `/admin/orders?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`;
  const response = await instance.get(url);
  return response.data;
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const response = await instance.put(`/admin/orders/${orderId}/status`, { status });
  return response.data;
};
