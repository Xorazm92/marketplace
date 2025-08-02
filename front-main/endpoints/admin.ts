
import instance from './instance';

export const getDashboardStats = async () => {
  const response = await instance.get('/admin/dashboard');
  return response.data;
};

export const getUsersAdmin = async (page: number = 1, limit: number = 10) => {
  const response = await instance.get(`/admin/users?page=${page}&limit=${limit}`);
  return response.data;
};

export const getProductsAdmin = async (page: number = 1, limit: number = 10, status?: string) => {
  const url = `/admin/products?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`;
  const response = await instance.get(url);
  return response.data;
};

export const approveProduct = async (productId: number) => {
  const response = await instance.put(`/admin/products/${productId}/approve`);
  return response.data;
};

export const rejectProduct = async (productId: number, reason?: string) => {
  const response = await instance.put(`/admin/products/${productId}/reject`, { reason });
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
