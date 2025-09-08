export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  helpful_count: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    profile_image?: string;
  };
  product?: {
    id: number;
    name: string;
    images?: string[];
  };
}

export interface CreateReviewData {
  product_id: number;
  rating: number;
  title?: string;
  comment?: string;
  images?: File[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: File[];
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
