export interface Payment {
  id: number;
  transaction_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  gateway_response?: any;
  gateway_transaction_id?: string;
  failure_reason?: string;
  order_id: number;
  order?: {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    user?: {
      id: number;
      first_name: string;
      last_name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'PAYPAL' | 'STRIPE' | 'CLICK' | 'PAYME' | 'UZCARD';

export type PaymentStatus = 
  | 'PENDING' 
  | 'PROCESSING' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED';

export interface CreatePaymentData {
  order_id: number;
  amount: number;
  payment_method: PaymentMethod;
  currency?: string;
  return_url?: string;
  cancel_url?: string;
}

export interface PaymentInitiationResponse {
  payment_id: number;
  transaction_id: string;
  // PayPal specific
  id?: string;
  status?: string;
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  // Stripe specific
  client_secret?: string;
  // Local payment methods
  payment_url?: string;
  method?: string;
}

export interface PaymentConfirmationData {
  // PayPal
  orderId?: string;
  // Stripe
  paymentIntentId?: string;
  // Local methods
  status?: string;
  reference?: string;
}

export interface PaymentHistory {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentStats {
  total_payments: number;
  total_revenue: number;
  successful_payments: number;
  failed_payments: number;
}

export interface RefundData {
  amount?: number;
}

export interface RefundResponse {
  id: string;
  status: string;
  amount: number;
}

// PayPal specific types
export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

// Stripe specific types
export interface StripePaymentIntentResponse {
  client_secret: string;
  id: string;
  status: string;
}

// Local payment method types
export interface LocalPaymentResponse {
  id: string;
  status: string;
  payment_url: string;
  method: string;
}
