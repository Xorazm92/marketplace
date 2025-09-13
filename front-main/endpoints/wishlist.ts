
import { apiClient } from './instance';

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  product: {
    id: number;
    title: string;
    price: string;
    images: Array<{ url: string }>;
    brand?: { name: string };
    category?: { name: string };
  };
  createdAt: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  totalCount: number;
}

export const getUserWishlist = async (): Promise<WishlistResponse> => {
  try {
    const response = await apiClient.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const addToWishlist = async (productId: number): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post(`/wishlist/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId: number): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete(`/wishlist/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const isInWishlist = async (productId: number): Promise<{ isInWishlist: boolean }> => {
  try {
    const response = await apiClient.get(`/wishlist/check/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    return { isInWishlist: false };
  }
};

export const getWishlistCount = async (): Promise<{ count: number }> => {
  try {
    const response = await apiClient.get('/wishlist/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist count:', error);
    return { count: 0 };
  }
};

export const clearWishlist = async (): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete('/wishlist/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    throw error;
  }
};
