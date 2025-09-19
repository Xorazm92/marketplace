import { Address } from "cluster";

export interface CreateProductProps {
  title: string;
  user_id: number;
  brand_id: number;
  price: number;
  currency_id: number;
  description: string;
  negotiable: boolean;
  phone_number: string;
  address_id: number;
  condition: boolean;
  category_id?: number;
  age_range?: string;
  material?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  safety_info?: string;
  features?: string[];
  weight?: number;
  dimensions?: string;
}
export interface UpdateProductProps {
  title?: string;
  user_id?: number;
  brand_id?: number;
  price?: number;
  currency_id?: number;
  description?: string;
  negotiable?: boolean;
  phone_number?: string;
  address_id?: number;
  condition?: boolean;
  category_id?: number;
  age_range?: string;
  material?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  safety_info?: string;
  features?: string[];
  weight?: number;
  dimensions?: string;
}

enum isChecked {
  PENDING,
  APPROVED,
  REJECTED,
}

interface ProductImage {
  id: number;
  product_id: number;
  url: string;
}

// ✅ Yangilangan va xavfsiz Product interface
export interface Product {
  id: number;
  title: string;
  name?: string; // ✅ Fallback uchun qo'shildi
  user_id?: number;
  brand_id: number;
  price: number;
  currency_id: number;
  description: string;
  negotiable: boolean;
  condition: boolean | string; // ✅ Backend string qaytarishi mumkin
  phone_number: string;
  address_id?: number;
  slug: string;
  is_top?: boolean;
  is_checked?: isChecked | boolean;
  is_active?: boolean;
  is_deleted?: boolean;
  view_count?: number;
  like_count?: number;
  category_id?: number;
  subcategory_id?: number;
  age_range?: string;
  material?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  safety_info?: string;
  features?: string[];
  weight?: number;
  dimensions?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  
  // ✅ Brand ma'lumotlari (optional)
  brand?: {
    id?: number;
    name?: string;
  };
  
  // ✅ Currency ma'lumotlari (optional)
  currency?: {
    id?: number;
    name?: string;
  };
  
  // ✅ Category ma'lumotlari (optional)
  category?: {
    id?: number;
    name?: string;
    slug?: string;
  };
  
  // ✅ Rasmlar uchun ikki xil format qo'llab-quvvatlash
  product_image?: ProductImage[];
  images?: string[]; // ✅ Backend qaytarishi mumkin
  
  // ✅ Reviews ma'lumotlari (optional)
  reviews?: Array<{ rating: number; comment?: string }>;
  
  // ✅ Qo'shimcha maydonlar
  trending_score?: number;
  rating?: number;
  review_count?: number;
  seller_name?: string;
  original_price?: number;
  discount_percentage?: number;
  is_bestseller?: boolean;
  is_featured?: boolean;
  safety_certified?: boolean;
  educational_value?: string;
  shipping_info?: string;
}

// ✅ API validation uchun interface
export interface ProductValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ✅ API request uchun interface
export interface ProductApiRequest {
  title: string;
  description: string;
  price: number;
  category_id: number;
  brand_id: number;
  currency_id: number;
  user_id: number;
  phone_number: string;
  condition: string;
  negotiable: boolean;
  subcategory_id?: number;
  age_range?: string;
  material?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  safety_info?: string;
  features?: string[];
  weight?: number;
  dimensions?: string;
}
