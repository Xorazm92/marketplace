
import instance from './instance';

export interface CreateReviewData {
  product_id: number;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  comment?: string;
  is_verified: boolean;
  helpful_count: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    profile_img?: string;
  };
  images: Array<{ url: string }>;
}

export const createReview = async (reviewData: CreateReviewData) => {
  const response = await instance.post('/api/v1/reviews', reviewData);
  return response.data;
};

export const getProductReviews = async (productId: number, page: number = 1, limit: number = 10) => {
  const response = await instance.get(`/api/v1/reviews/product/${productId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const getProductRatingStats = async (productId: number) => {
  const response = await instance.get(`/api/v1/reviews/product/${productId}/stats`);
  return response.data;
};

export const markReviewHelpful = async (reviewId: number) => {
  const response = await instance.post(`/api/v1/reviews/${reviewId}/helpful`);
  return response.data;
};

export const updateReview = async (reviewId: number, reviewData: Partial<CreateReviewData>) => {
  const response = await instance.patch(`/api/v1/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const deleteReview = async (reviewId: number) => {
  const response = await instance.delete(`/api/v1/reviews/${reviewId}`);
  return response.data;
};
