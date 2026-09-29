export type ProductImage = { id: number; url: string; is_primary: boolean };

export type Product = {
  id: number;
  slug: string;
  title: string;
  short_description: string | null;
  description: string;
  price: number;
  original_price: number | null;
  discount_percentage: number;
  images: ProductImage[];
  category: { id: number; name: string; slug: string } | null;
  brand: { id: number; name: string } | null;
  age_range: string | null;
  recommended_age_min: number | null;
  recommended_age_max: number | null;
  material: string | null;
  safety_warnings: string | null;
  choking_hazard: boolean;
  min_order_quantity: number;
  max_order_quantity: number | null;
  in_stock: boolean;
  is_featured: boolean;
};

export type AdminProduct = Product & {
  sku: string | null;
  is_active: boolean;
  stock_quantity: number | null;
  view_count: number;
  category_id: number | null;
  brand_id: number | null;
};

export type Page<T> = { items: T[]; total: number; page: number; limit: number; pages: number };

export type Category = { id: number; name: string; slug: string; description: string | null; is_active: boolean; sort_order: number };

export type User = { id: number; phone_number: string; first_name: string; last_name: string; email: string | null };

export type Address = {
  id: number;
  name: string;
  address: string;
  phone_number: string | null;
  is_main: boolean;
  region: { id: number; name: string } | null;
  district: { id: number; name: string } | null;
};

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
export type PaymentMethod = "PAYME" | "CLICK" | "CASH";

export type Order = {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  total_amount: number;
  shipping_amount: number;
  final_amount: number;
  shipping: { name: string; region: string | null; district: string | null; address: string; phone: string } | null;
  notes: string | null;
  createdAt: string;
  cancel_reason: string | null;
  items: Array<{ product_id: number; title: string; slug: string | null; image: string | null; quantity: number; unit_price: number; total_price: number }>;
};

export type AdminOrder = Order & {
  user: { id: number; phone_number: string; first_name: string; last_name: string };
  payments?: Array<{ id: number; payment_method: string; amount: number; status: string; transaction_id: string | null; createdAt: string }>;
  tracking?: Array<{ id: number; status: string; description: string | null; createdAt: string }>;
};

export type CartResponse = {
  id: number;
  total_items: number;
  total_amount: number;
  items: Array<{
    id: number;
    quantity: number;
    product: { id: number; title: string; slug: string; price: string; is_active: boolean; product_image: ProductImage[] };
  }>;
};
