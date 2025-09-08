export interface CreateProductProps {
  // Basic information
  title: string;
  user_id: number;
  brand_id: number;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  currency_id: number;
  description: string;
  short_description?: string;
  negotiable: boolean;
  condition: 'new' | 'used' | 'refurbished';
  phone_number: string;
  address_id: number;
  
  // Categorization
  category_id?: number;
  subcategory_id?: number;
  
  // Product details
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  material?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  brand_name?: string;
  
  // Child-specific fields
  age_group_id?: number;
  educational_category_id?: number;
  event_type_id?: number;
  recommended_age_min?: number; // in months
  recommended_age_max?: number; // in months
  gender_specific?: 'Erkak' | 'Ayol' | 'Umumiy';
  difficulty_level?: 'Oson' | 'O\'rta' | 'Qiyin';
  play_time?: string;
  player_count?: string;
  learning_objectives?: string[];
  developmental_skills?: string[];
  parental_guidance: boolean;
  multilingual_support?: string[];
  educational_value?: string;
  skill_development?: string[];
  play_pattern?: string;
  
  // Safety information
  safety_info?: string;
  safety_warnings?: string;
  certifications?: string[];
  assembly_required: boolean;
  battery_required: boolean;
  choking_hazard: boolean;
  
  // Product features
  features?: string[];
  specifications?: Record<string, any>;
  
  // Business information
  availability_status: 'in_stock' | 'out_of_stock' | 'pre_order';
  min_order_quantity: number;
  max_order_quantity?: number;
  shipping_weight?: number;
  shipping_dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  origin_country?: string;
  warranty_period?: string;
  return_policy?: string;
  care_instructions?: string;
  
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  tags?: string;
  search_keywords?: string;
}
export interface UpdateProductProps {
  // Basic information
  title?: string;
  user_id?: number;
  brand_id?: number;
  price?: number;
  original_price?: number;
  discount_percentage?: number;
  currency_id?: number;
  description?: string;
  short_description?: string;
  negotiable?: boolean;
  condition?: 'new' | 'used' | 'refurbished';
  phone_number?: string;
  address_id?: number;
  
  // Categorization
  category_id?: number;
  subcategory_id?: number;
  
  // Product details
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  material?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  brand_name?: string;
  
  // Child-specific fields
  age_group_id?: number;
  educational_category_id?: number;
  event_type_id?: number;
  recommended_age_min?: number;
  recommended_age_max?: number;
  gender_specific?: 'Erkak' | 'Ayol' | 'Umumiy';
  difficulty_level?: 'Oson' | 'O\'rta' | 'Qiyin';
  play_time?: string;
  player_count?: string;
  learning_objectives?: string[];
  developmental_skills?: string[];
  parental_guidance?: boolean;
  multilingual_support?: string[];
  educational_value?: string;
  skill_development?: string[];
  play_pattern?: string;
  
  // Safety information
  safety_info?: string;
  safety_warnings?: string;
  certifications?: string[];
  assembly_required?: boolean;
  battery_required?: boolean;
  choking_hazard?: boolean;
  
  // Product features
  features?: string[];
  specifications?: Record<string, any>;
  
  // Business information
  availability_status?: 'in_stock' | 'out_of_stock' | 'pre_order';
  min_order_quantity?: number;
  max_order_quantity?: number;
  shipping_weight?: number;
  shipping_dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  origin_country?: string;
  warranty_period?: string;
  return_policy?: string;
  care_instructions?: string;
  
  // SEO fields
  meta_title?: string;
  meta_description?: string;
  tags?: string;
  search_keywords?: string;
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

// Additional interfaces for related data
export interface AgeGroup {
  id: number;
  name: string;
  min_age_months: number;
  max_age_months: number;
  description?: string;
  icon?: string;
  color?: string;
}

export interface EducationalCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface EventType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface Product {
  id: number;
  title: string;
  user_id?: number;
  brand_id: number;
  price: number;
  original_price?: number;
  discount_percentage?: number;
  currency_id: number;
  description: string;
  short_description?: string;
  negotiable: boolean;
  condition: 'new' | 'used' | 'refurbished';
  phone_number: string;
  address_id?: number;
  slug?: string;
  is_top: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  is_checked: isChecked;
  is_active: boolean;
  is_deleted: boolean;
  view_count: number;
  like_count: number;
  share_count: number;
  
  // Categorization
  category_id?: number;
  subcategory_id?: number;
  
  // Product details
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: Record<string, any>;
  material?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  brand_name?: string;
  
  // Child-specific fields
  age_group_id?: number;
  educational_category_id?: number;
  event_type_id?: number;
  recommended_age_min?: number;
  recommended_age_max?: number;
  gender_specific?: 'boys' | 'girls' | 'unisex';
  difficulty_level?: 'easy' | 'medium' | 'hard' | 'expert';
  play_time?: string;
  player_count?: string;
  learning_objectives?: Record<string, any>;
  developmental_skills?: Record<string, any>;
  parental_guidance: boolean;
  multilingual_support?: Record<string, any>;
  educational_value?: string;
  skill_development?: Record<string, any>;
  play_pattern?: string;
  
  // Safety information
  safety_info?: string;
  safety_warnings?: string;
  certifications?: Record<string, any>;
  assembly_required: boolean;
  battery_required: boolean;
  choking_hazard: boolean;
  
  // Product features
  features?: Record<string, any>;
  specifications?: Record<string, any>;
  meta_title?: string;
  meta_description?: string;
  tags?: string;
  search_keywords?: string;
  
  // Business information
  availability_status: string;
  min_order_quantity: number;
  max_order_quantity?: number;
  shipping_weight?: number;
  shipping_dimensions?: Record<string, any>;
  origin_country?: string;
  warranty_period?: string;
  return_policy?: string;
  care_instructions?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
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
  age_group?: AgeGroup;
  educational_category?: EducationalCategory;
  event_type?: EventType;
  product_image: ProductImage[];
}
