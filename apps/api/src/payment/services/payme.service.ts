import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

export interface PaymePaymentRequest {
  order_id: number;
  amount: number;
  return_url?: string;
  description?: string;
}

export interface PaymePaymentResponse {
  payment_url: string;
  payment_id: string;
  status: string;
}

@Injectable()
export class PaymeService {
  private readonly logger = new Logger(PaymeService.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.merchantId = this.configService.get<string>('PAYME_MERCHANT_ID') || 'test_merchant';
    this.secretKey = this.configService.get<string>('PAYME_SECRET_KEY') || 'test_secret';
    this.baseUrl = this.configService.get<string>('PAYME_BASE_URL') || 'https://checkout.paycom.uz';
  }

  async createPayment(request: PaymePaymentRequest): Promise<PaymePaymentResponse> {
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

      // Payme payment yaratish
      const paymentData = {
        merchant: this.merchantId,
        amount: amount * 100, // Payme tiyin'da ishlaydi
        account: {
          order_id: order_id.toString(),
        },
        description: description || `Buyurtma #${order.order_number} uchun to'lov`,
        return_url: return_url || `${this.configService.get('FRONTEND_URL')}/payment/success`,
      };

      // Payment ID yaratish
      const paymentId = `payme_${Date.now()}_${order_id}`;
      
      // Base64 encode qilish
      const encodedData = Buffer.from(JSON.stringify(paymentData)).toString('base64');
      const paymentUrl = `${this.baseUrl}/${encodedData}`;

      // Payment record yaratish
      await this.prisma.orderPayment.create({
        data: {
          order_id: order_id,
          amount: amount,
          payment_method: 'PAYME',
          transaction_id: paymentId,
          status: 'PENDING',
          gateway_response: paymentData,
        },
      });

      this.logger.log(`Payme payment created: ${paymentId} for order ${order_id}`);

      return {
        payment_url: paymentUrl,
        payment_id: paymentId,
        status: 'PENDING',
      };
    } catch (error) {
      this.logger.error('Error creating Payme payment:', error);
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

      this.logger.log(`Payme payment verified: ${paymentId} - ${newStatus}`);
      return newStatus === 'PAID';
    } catch (error) {
      this.logger.error('Error verifying Payme payment:', error);
      throw error;
    }
  }

  async handleCallback(callbackData: any): Promise<any> {
    try {
      const { id, method, params } = callbackData;
      
      // Payme JSON-RPC format
      switch (method) {
        case 'CheckPerformTransaction':
          return this.checkPerformTransaction(params);
        case 'CreateTransaction':
          return this.createTransaction(params);
        case 'PerformTransaction':
          return this.performTransaction(params);
        case 'CancelTransaction':
          return this.cancelTransaction(params);
        case 'CheckTransaction':
          return this.checkTransaction(params);
        default:
          throw new Error('Unknown method');
      }
    } catch (error) {
      this.logger.error('Error handling Payme callback:', error);
      return {
        error: {
          code: -32400,
          message: 'Bad Request',
        },
      };
    }
  }

  private async checkPerformTransaction(params: any): Promise<any> {
    const { account } = params;
    const orderId = parseInt(account.order_id);
    
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return {
        error: {
          code: -31050,
          message: 'Order not found',
        },
      };
    }

    return { result: { allow: true } };
  }

  private async createTransaction(params: any): Promise<any> {
    const { id, time, amount, account } = params;
    const orderId = parseInt(account.order_id);
    
    // Transaction yaratish yoki topish
    let payment = await this.prisma.orderPayment.findFirst({
      where: { 
        order_id: orderId,
        payment_method: 'PAYME',
        transaction_id: id,
      },
    });

    if (!payment) {
      payment = await this.prisma.orderPayment.create({
        data: {
          order_id: orderId,
          amount: amount / 100, // Tiyin'dan so'm'ga
          payment_method: 'PAYME',
          transaction_id: id,
          status: 'PENDING',
          gateway_response: params,
        },
      });
    }

    return {
      result: {
        transaction: payment.id.toString(),
        state: 1, // Created
        create_time: time,
      },
    };
  }

  private async performTransaction(params: any): Promise<any> {
    const { id } = params;
    
    const payment = await this.prisma.orderPayment.findFirst({
      where: { transaction_id: id },
    });

    if (!payment) {
      return {
        error: {
          code: -31003,
          message: 'Transaction not found',
        },
      };
    }

    // Payment'ni complete qilish
    await this.verifyPayment(id, 'success');

    return {
      result: {
        transaction: payment.id.toString(),
        perform_time: Date.now(),
        state: 2, // Completed
      },
    };
  }

  private async cancelTransaction(params: any): Promise<any> {
    const { id } = params;
    
    await this.verifyPayment(id, 'failed');

    return {
      result: {
        transaction: id,
        cancel_time: Date.now(),
        state: -1, // Cancelled
      },
    };
  }

  private async checkTransaction(params: any): Promise<any> {
    const { id } = params;
    
    const payment = await this.prisma.orderPayment.findFirst({
      where: { transaction_id: id },
    });

    if (!payment) {
      return {
        error: {
          code: -31003,
          message: 'Transaction not found',
        },
      };
    }

    const state = payment.status === 'PAID' ? 2 : payment.status === 'FAILED' ? -1 : 1;

    return {
      result: {
        transaction: payment.id.toString(),
        state: state,
        create_time: payment.createdAt.getTime(),
        perform_time: payment.status === 'PAID' ? payment.updatedAt.getTime() : 0,
      },
    };
  }
}
