export enum PaymentMethod {
  CLICK = 'click',
  PAYME = 'payme',
  UZUM = 'uzum',
  UZCARD = 'uzcard',
  HUMO = 'humo'
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  description: string;
  returnUrl: string;
  customerPhone?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
}

class PaymentService {
  private readonly API_BASE = 'http://localhost:4000/api/v1';

  async initiatePayment(method: PaymentMethod, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/payment/${method}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();
      return data.success ? {
        success: true,
        paymentId: data.payment_id,
        redirectUrl: data.redirect_url
      } : {
        success: false,
        error: data.error || 'To\'lov xatoligi'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'To\'lov amalga oshmadi'
      };
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  }

  calculateTax(amount: number): number {
    return Math.round(amount * 0.15); // 15% QQS
  }
}

export const paymentService = new PaymentService();
export default paymentService;
