import instance from "./instance";
import { toast } from "react-toastify";
import type { CreateReviewData, UpdateReviewData, Review, ReviewsResponse } from "../types/review.types";

export const createReview = async (reviewData: CreateReviewData): Promise<Review> => {
  try {
    const response = await instance.post('/reviews', reviewData);
    toast.success("Sharh muvaffaqiyatli yaratildi!");
    return response.data;
  } catch (error: any) {
    console.error("Error creating review:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Sharh yaratishda xatolik");
    }
    throw error;
  }
};

// Local interfaces removed - using imported types

export const getReviews = async (productId: number, page = 1, limit = 10): Promise<ReviewsResponse> => {
  try {
    const response = await instance.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    console.error("Error loading reviews:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Sharhlarni yuklashda xatolik");
    }
    throw error;
  }
};

export const getProductRatingStats = async (productId: number) => {
  const response = await instance.get(`/reviews/product/${productId}/stats`);
  return response.data;
};

export const markReviewHelpful = async (reviewId: number): Promise<Review> => {
  try {
    const res = await instance.post(`/reviews/${reviewId}/helpful`);
    toast.success("Sharh foydali deb belgilandi!");
    return res.data;
  } catch (error: any) {
    console.error("Error marking review helpful:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Sharhni foydali deb belgilashda xatolik");
    }
    throw error;
  }
};

export const updateReview = async (reviewId: number, reviewData: UpdateReviewData): Promise<Review> => {
  const response = await instance.patch(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const deleteReview = async (reviewId: number): Promise<void> => {
  try {
    await instance.delete(`/reviews/${reviewId}`);
    toast.success("Sharh muvaffaqiyatli o'chirildi!");
  } catch (error: any) {
    console.error("Error deleting review:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Sharhni o'chirishda xatolik");
    }
    throw error;
  }
};

// Admin review moderation functions
export const approveReview = async (reviewId: number): Promise<Review> => {
  try {
    const res = await instance.patch(`/reviews/${reviewId}/approve`);
    toast.success("Sharh tasdiqlandi!");
    return res.data;
  } catch (error: any) {
    console.error("Error approving review:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Sharhni tasdiqlashda xatolik");
    }
    throw error;
  }
};

export const rejectReview = async (reviewId: number, reason?: string): Promise<Review> => {
  try {
    const res = await instance.patch(`/reviews/${reviewId}/reject`, { reason });
    toast.success("Sharh rad etildi!");
    return res.data;
  } catch (error: any) {
    console.error("Error rejecting review:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Sharhni rad etishda xatolik");
    }
    throw error;
  }
};

export const getAllReviews = async (page = 1, limit = 10, status?: string): Promise<ReviewsResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }
    
    const res = await instance.get(`/reviews/admin/all?${params}`);
    return res.data;
  } catch (error: any) {
    console.error("Error loading all reviews:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("Sharhlarni yuklashda xatolik");
    }
    throw error;
  }
};
