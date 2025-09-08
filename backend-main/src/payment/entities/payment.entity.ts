// Deprecated legacy TypeORM entity. Replaced by Prisma models.
// Keeping a minimal class definition to satisfy any imports without requiring 'typeorm'.
export class Payment {
  id: number;
  transaction_id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  payment_method: 'PAYPAL' | 'STRIPE' | 'CLICK' | 'PAYME' | 'UZCARD';
  gateway_response?: any;
  gateway_transaction_id?: string;
  failure_reason?: string;
  created_at: Date;
  updated_at: Date;
  order?: any;
  user?: any;
}
