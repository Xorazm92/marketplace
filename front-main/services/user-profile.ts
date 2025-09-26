import { apiClient } from '@/lib/api-client';

export interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  avatar: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  street: string;
  zip: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: any[];
}

export interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export const userProfileApi = {
  // Profile
  getProfile: () => apiClient.get<ProfileData>('/profile'),
  
  updateProfile: (data: Partial<ProfileData>) => apiClient.put<ProfileData>('/profile', data),
  
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/profile/change-password', data),
  
  sendEmailVerification: () => apiClient.post('/profile/verify-email/send'),
  
  confirmEmailVerification: (code: string) =>
    apiClient.post('/profile/verify-email/confirm', { code }),
  
  sendPhoneVerification: () => apiClient.post('/profile/verify-phone/send'),
  
  confirmPhoneVerification: (code: string) =>
    apiClient.post('/profile/verify-phone/confirm', { code }),

  // Addresses
  getAddresses: () => apiClient.get<Address[]>('/profile/addresses'),
  
  createAddress: (data: Omit<Address, 'id'>) =>
    apiClient.post<Address>('/profile/addresses', data),
  
  updateAddress: (id: string, data: Partial<Address>) =>
    apiClient.put<Address>(`/profile/addresses/${id}`, data),
  
  deleteAddress: (id: string) => apiClient.delete(`/profile/addresses/${id}`),
  
  setDefaultAddress: (id: string, type: 'shipping' | 'billing') =>
    apiClient.post(`/profile/addresses/${id}/default?type=${type}`),

  // Payment Methods
  getPaymentMethods: () => apiClient.get<PaymentMethod[]>('/profile/payment-methods'),
  
  addPaymentMethod: (data: Omit<PaymentMethod, 'id'>) =>
    apiClient.post<PaymentMethod>('/profile/payment-methods', data),
  
  deletePaymentMethod: (id: string) => apiClient.delete(`/profile/payment-methods/${id}`),
  
  setDefaultPaymentMethod: (id: string) =>
    apiClient.post(`/profile/payment-methods/${id}/default`),

  // Orders
  getOrders: (params?: { status?: string; page?: number; limit?: number }) =>
    apiClient.get(`/profile/orders`, { params }),
  
  getOrder: (id: string) => apiClient.get(`/profile/orders/${id}`),
  
  downloadInvoice: (id: string) => apiClient.get(`/profile/orders/${id}/invoice`, {
    responseType: 'blob',
  }),
  
  reorder: (id: string) => apiClient.post(`/profile/orders/${id}/reorder`),
  
  requestReturn: (id: string, data: { reason: string; items: string[] }) =>
    apiClient.post(`/profile/orders/${id}/return`, data),

  // Wishlist
  getWishlist: () => apiClient.get<{ items: WishlistItem[] }>('/profile/wishlist'),
  
  addToWishlist: (productId: string) =>
    apiClient.post(`/profile/wishlist/${productId}`),
  
  removeFromWishlist: (productId: string) =>
    apiClient.delete(`/profile/wishlist/${productId}`),
  
  getWishlistShareLink: () => apiClient.get('/profile/wishlist/share'),

  // Expenses
  getExpenseSummary: (params?: { range?: string; from?: string; to?: string }) =>
    apiClient.get('/profile/expenses/summary', { params }),
  
  getExpenseByCategories: (params?: { from?: string; to?: string }) =>
    apiClient.get('/profile/expenses/categories', { params }),
  
  exportExpenses: (format: 'xlsx' | 'pdf', params?: { from?: string; to?: string }) =>
    apiClient.get('/profile/expenses/export', {
      params: { format, ...params },
      responseType: 'blob',
    }),

  // Security
  getSessions: () => apiClient.get('/profile/security/sessions'),
  
  revokeSession: (id: string) => apiClient.delete(`/profile/security/sessions/${id}`),
  
  getLoginHistory: () => apiClient.get('/profile/security/login-history'),
  
  getDevices: () => apiClient.get('/profile/security/devices'),
  
  removeDevice: (id: string) => apiClient.delete(`/profile/security/devices/${id}`),
  
  setup2FA: () => apiClient.post('/profile/security/2fa/setup'),
  
  verify2FA: (code: string) => apiClient.post('/profile/security/2fa/verify', { code }),
  
  disable2FA: (password: string) =>
    apiClient.post('/profile/security/2fa/disable', { password }),

  // Notifications
  getNotificationSettings: () => apiClient.get('/profile/notifications/settings'),
  
  updateNotificationSettings: (settings: any) =>
    apiClient.put('/profile/notifications/settings', settings),
};
