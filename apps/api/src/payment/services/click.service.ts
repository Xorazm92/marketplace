import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

export interface ClickPaymentRequest {
  order_id: number;
  amount: number;
  return_url?: string;
  description?: string;
}

export interface ClickPaymentResponse {
  payment_url: string;
  payment_id: string;
  status: string;
}

@Injectable()
export class ClickService {
  private readonly logger = new Logger(ClickService.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly serviceId: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.merchantId = this.configService.get<string>('CLICK_MERCHANT_ID') || 'test_merchant';
    this.secretKey = this.configService.get<string>('CLICK_SECRET_KEY') || 'test_secret';
    this.serviceId = this.configService.get<string>('CLICK_SERVICE_ID') || 'test_service';
    this.baseUrl = this.configService.get<string>('CLICK_BASE_URL') || 'https://api.click.uz/v2';
  }

  async createPayment(request: ClickPaymentRequest): Promise<ClickPaymentResponse> {
    try {
      const { order_id, amount, return_url, description } = request;

      // Order'ni tekshirish
      const order = await this.prisma.order.findUnique({
        where: { id: order_id },
        include: { user: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Click payment yaratish
      const paymentData = {
        service_id: this.serviceId,
        merchant_id: this.merchantId,
        amount: amount,
        transaction_param: order_id.toString(),
        return_url: return_url || `${this.configService.get('FRONTEND_URL')}/payment/success`,
        description: description || `Buyurtma #${order.order_number} uchun to'lov`,
      };

      // Signature yaratish
      const signature = this.generateSignature(paymentData);
      paymentData['sign'] = signature;

      // Click API'ga so'rov yuborish (demo uchun mock response)
      const paymentId = `click_${Date.now()}_${order_id}`;
      const paymentUrl = `${this.baseUrl}/payment?payment_id=${paymentId}`;

      // Payment record yaratish
      await this.prisma.orderPayment.create({
        data: {
          order_id: order_id,
          amount: amount,
          payment_method: 'CLICK',
          transaction_id: paymentId,
          status: 'PENDING',
          gateway_response: paymentData,
        },
      });

      this.logger.log(`Click payment created: ${paymentId} for order ${order_id}`);

      return {
        payment_url: paymentUrl,
        payment_id: paymentId,
        status: 'PENDING',
      };
    } catch (error) {
      this.logger.error('Error creating Click payment:', error);
      throw error;
    }
  }

  async verifyPayment(paymentId: string, status: string): Promise<boolean> {
    try {
      // Payment'ni topish
      const payment = await this.prisma.orderPayment.findFirst({
        where: { transaction_id: paymentId },
        include: { order: true }
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Payment status'ni yangilash
      const newStatus = status === 'success' ? 'PAID' : 'FAILED';

      await this.prisma.orderPayment.update({
        where: { id: payment.id },
        data: { status: newStatus },
      });

      // Order status'ni yangilash
      if (newStatus === 'PAID') {
        await this.prisma.order.update({
          where: { id: payment.order_id },
          data: {
            payment_status: 'PAID',
            status: 'CONFIRMED'
          },
        });
      }

      this.logger.log(`Click payment verified: ${paymentId} - ${newStatus}`);
      return newStatus === 'PAID';
    } catch (error) {
      this.logger.error('Error verifying Click payment:', error);
      throw error;
    }
  }

  private generateSignature(data: any): string {
    // Click signature generation logic
    const signString = `${data.service_id}${data.merchant_id}${data.amount}${data.transaction_param}${this.secretKey}`;
    return crypto.createHash('md5').update(signString).digest('hex');
  }

  async handleCallback(callbackData: any): Promise<any> {
    try {
      const { payment_id, status, error_code } = callbackData;
      
      // Signature tekshirish
      const isValidSignature = this.verifySignature(callbackData);
      if (!isValidSignature) {
        throw new Error('Invalid signature');
      }

      // Payment'ni yangilash
      const success = await this.verifyPayment(payment_id, status);
      
      return {
        success,
        message: success ? 'Payment completed successfully' : 'Payment failed',
      };
    } catch (error) {
      this.logger.error('Error handling Click callback:', error);
      throw error;
    }
  }

  private verifySignature(data: any): boolean {
    // Click signature verification logic
    const expectedSignature = this.generateSignature(data);
    return data.sign === expectedSignature;
  }
}
