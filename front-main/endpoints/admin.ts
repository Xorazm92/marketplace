
import instance from './instance';

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

export const approveProduct = async (productId: number) => {
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

export const rejectProduct = async (productId: number, reason?: string) => {
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
