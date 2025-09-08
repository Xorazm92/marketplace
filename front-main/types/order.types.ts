export interface CreateOrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface CreateOrderData {
  user_id: number;
  items: CreateOrderItem[];
  currency_id: number;
  shipping_address_id: number;
  billing_address_id?: number;
  payment_method: string;
  notes?: string;
  discount_amount?: number;
  tax_amount?: number;
  shipping_amount?: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    images?: string[];
  };
}

export interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  final_amount: number;
  currency_id: number;
  shipping_address_id: number;
  billing_address_id?: number;
  payment_method: string;
  payment_status: string;
  notes?: string;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface UpdateOrderStatusData {
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  reason?: string;
}

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}
