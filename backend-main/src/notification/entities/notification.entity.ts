// Deprecated legacy TypeORM entity. Replaced by Prisma models.
// Keeping a minimal class definition to satisfy any imports without requiring 'typeorm'.
export class Notification {
  id: number;
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'PRODUCT' | 'SYSTEM' | 'PROMOTION' | 'SECURITY';
  channel: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';
  is_read: boolean;
  action_url?: string | null;
  metadata?: any;
  scheduled_at?: Date | null;
  sent_at?: Date | null;
  created_at: Date;
  updated_at: Date;
  user?: any;
}
