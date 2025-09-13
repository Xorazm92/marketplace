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
  address_id?: string;
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

export interface Product {
  id: number;
  title: string;
  user_id?: number;
  brand_id: number;
  price: number;
  currency_id: number;
  description: string;
  negotiable: boolean;
  condition: boolean;
  phone_number: string;
  address_id?: number;
  slug: string;
  is_top: boolean;
  is_checked: isChecked;
  is_active: boolean;
  is_deleted: boolean;
  view_count: number;
  like_count: number;
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
  brand: {
    id: number;
    name: string;
  };
  currency: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  product_image: ProductImage[];
}
