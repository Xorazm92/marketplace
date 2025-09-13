
import instance from './instance';

export interface Seller {
  id: number;
  user_id: number;
  company_name: string;
  business_registration: string;
  tax_id: string;
  email: string;
  phone: string;
  business_address: string;
  description?: string;
  website?: string;
  business_categories: string[];
  bank_account: string;
  bank_name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellerAnalytics {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export const registerSeller = async (sellerData: Partial<Seller>): Promise<Seller> => {
  try {
    const response = await instance.post('/sellers/register', sellerData);
    return response.data;
  } catch (error) {
    console.error('Error registering seller:', error);
    throw error;
  }
};

export const getSellerProfile = async (): Promise<Seller> => {
  try {
    const response = await instance.get('/sellers/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    throw error;
  }
};

export const updateSellerProfile = async (sellerData: Partial<Seller>): Promise<Seller> => {
  try {
    const response = await instance.put('/sellers/profile', sellerData);
    return response.data;
  } catch (error) {
    console.error('Error updating seller profile:', error);
    throw error;
  }
};

export const getSellerAnalytics = async (): Promise<SellerAnalytics> => {
  try {
    const response = await instance.get('/sellers/analytics');
    return response.data;
  } catch (error) {
    console.error('Error fetching seller analytics:', error);
    throw error;
  }
};

export const getAllSellers = async (page: number = 1, limit: number = 20, status?: string) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await instance.get(`/sellers/admin/all?${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sellers:', error);
    throw error;
  }
};

export const verifySeller = async (sellerId: number, verificationData: { is_verified: boolean; verification_notes?: string }) => {
  try {
    const response = await instance.put(`/sellers/admin/${sellerId}/verify`, verificationData);
    return response.data;
  } catch (error) {
    console.error('Error verifying seller:', error);
    throw error;
  }
};
