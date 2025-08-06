// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status?: string;
  timestamp?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error: string;
  timestamp: string;
  path?: string;
  stack?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter Types
export interface FilterParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: 'new' | 'used';
  location?: string;
}

// Common Entity Types
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User extends BaseEntity {
  first_name: string;
  last_name: string;
  profile_img?: string;
  is_active: boolean;
  is_premium: boolean;
  birth_date?: string;
  balance: number;
  slug?: string;
  phone_number: PhoneNumber[];
  email: Email[];
}

export interface PhoneNumber extends BaseEntity {
  phone_number: string;
  is_main: boolean;
  is_verified: boolean;
  user_id: number;
}

export interface Email extends BaseEntity {
  email: string;
  is_main: boolean;
  is_verified: boolean;
  user_id: number;
}

// Admin Types
export interface AdminUser extends BaseEntity {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  is_creator: boolean;
  name?: string;
  role?: string;
  avatar?: string;
}

// Category Types
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  is_active: boolean;
  sort_order: number;
  products?: Product[];
  children?: Category[];
}

// Product Types
export interface Product extends BaseEntity {
  title: string;
  user_id: number;
  brand_id: number;
  price: string;
  currency_id: number;
  description: string;
  negotiable: boolean;
  condition: boolean;
  phone_number: string;
  address_id?: number;
  slug: string;
  is_top: boolean;
  is_checked: 'PENDING' | 'APPROVED' | 'REJECTED';
  is_active: boolean;
  is_deleted: boolean;
  view_count: number;
  like_count: number;
  category_id: number;
  sku?: string;
  weight?: string;
  dimensions?: string;
  age_range?: string;
  material?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  safety_info?: string;
  features?: string;
  specifications?: any;
  meta_title?: string;
  meta_description?: string;
  tags?: string;
  product_image: ProductImage[];
  category?: Category;
  brand?: Brand;
  user?: User;
}

export interface ProductImage extends BaseEntity {
  url: string;
  product_id: number;
}

// Brand Types
export interface Brand extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
}

// Currency Types
export interface Currency extends BaseEntity {
  name: string;
  code: string;
  symbol: string;
  is_active: boolean;
}

// Order Types
export interface Order extends BaseEntity {
  user_id: number;
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shipping_address: string;
  notes?: string;
  order_items: OrderItem[];
}

export interface OrderItem extends BaseEntity {
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

// Cart Types
export interface Cart extends BaseEntity {
  user_id: number;
  cart_items: CartItem[];
}

export interface CartItem extends BaseEntity {
  cart_id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

// Review Types
export interface Review extends BaseEntity {
  user_id: number;
  product_id: number;
  rating: number;
  comment?: string;
  is_verified: boolean;
  user?: User;
  product?: Product;
}

// Address Types
export interface Address extends BaseEntity {
  user_id: number;
  title: string;
  address_line: string;
  city: string;
  region: string;
  postal_code?: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
}

// Notification Types
export interface Notification extends BaseEntity {
  user_id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  is_read: boolean;
  action_url?: string;
}

// Chat Types
export interface ChatRoom extends BaseEntity {
  name: string;
  description?: string;
  is_active: boolean;
  participants: ChatRoomUser[];
  messages: Message[];
}

export interface ChatRoomUser extends BaseEntity {
  user_id: number;
  chatroom_id: number;
  role: 'ADMIN' | 'MEMBER';
  joined_at: string;
  user?: User;
}

export interface Message extends BaseEntity {
  user_id: number;
  chatroom_id: number;
  content: string;
  message_type: 'TEXT' | 'IMAGE' | 'FILE';
  is_edited: boolean;
  user?: User;
}
