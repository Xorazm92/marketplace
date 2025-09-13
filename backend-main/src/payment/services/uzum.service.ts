import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import axios from 'axios';

export interface UzumPaymentRequest {
  order_id: number;
  amount: number;
  return_url?: string;
  cancel_url?: string;
  description?: string;
}

export interface UzumPaymentResponse {
  payment_url: string;
  payment_id: string;
  status: string;
}

export interface UzumCallbackData {
  transaction_id: string;
  order_id: string;
  amount: number;
  status: string;
  timestamp: string;
  signature: string;
  error_code?: number;
  error_message?: string;
}

@Injectable()
export class UzumService {
  private readonly logger = new Logger(UzumService.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly webhookUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.merchantId = this.configService.get<string>('UZUM_MERCHANT_ID') || 'test_uzum_merchant';
    this.secretKey = this.configService.get<string>('UZUM_SECRET_KEY') || 'test_uzum_secret';
    this.apiKey = this.configService.get<string>('UZUM_API_KEY') || 'test_uzum_api_key';
    this.baseUrl = this.configService.get<string>('UZUM_BASE_URL') || 'https://api.uzum.uz/v1';
    this.webhookUrl = this.configService.get<string>('UZUM_WEBHOOK_URL') || 'https://api.yourapp.com/api/payment/uzum/callback';
  }

  async createPayment(request: UzumPaymentRequest): Promise<UzumPaymentResponse> {
    try {
      const { order_id, amount, return_url, cancel_url, description } = request;

      // Validate order
      const order = await this.prisma.order.findUnique({
        where: { id: order_id },
        include: { user: true }
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      if (amount <= 0) {
        throw new BadRequestException('Amount must be greater than 0');
      }

      // Generate unique payment ID
      const paymentId = `uzum_${Date.now()}_${order_id}`;
      const timestamp = new Date().toISOString();

      // Prepare payment data
      const paymentData = {
        merchant_id: this.merchantId,
        transaction_id: paymentId,
        order_id: order_id.toString(),
        amount: Math.round(amount * 100), // Convert to tiyin
        currency: 'UZS',
        description: description || `Buyurtma #${order.order_number} uchun to'lov`,
        return_url: return_url || `${this.configService.get('FRONTEND_URL')}/payment/success`,
        cancel_url: cancel_url || `${this.configService.get('FRONTEND_URL')}/payment/cancel`,
        webhook_url: this.webhookUrl,
        timestamp,
        customer: {
          email: order.user.email || '',
          phone: order.user.phone_number || '',
          name: `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim()
        }
      };

      // Generate signature
      const signature = this.generateSignature(paymentData);
      paymentData['signature'] = signature;

      // Call Uzum API
      const apiResponse = await this.callUzumAPI('/payments/create', paymentData);

      if (!apiResponse.success) {
        throw new BadRequestException(`Uzum API error: ${apiResponse.message}`);
      }

      // Save payment record
      await this.prisma.orderPayment.create({
        data: {
          order: {
            connect: { id: order_id }
          },
          amount: amount,
          payment_method: 'UZUM',
          transaction_id: paymentId,
          status: 'PENDING',
          gateway_response: {
            ...paymentData,
            uzum_response: apiResponse
          } as any, // Type assertion since Prisma expects JsonValue
        },
      });

      this.logger.log(`Uzum payment created: ${paymentId} for order ${order_id}`);

      return {
        payment_url: apiResponse.payment_url || this.buildPaymentUrl(paymentData),
        payment_id: paymentId,
        status: 'PENDING',
      };
    } catch (error) {
      this.logger.error('Error creating Uzum payment:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create Uzum payment');
    }
  }

  async verifyPayment(paymentId: string, status: string): Promise<boolean> {
    try {
      const payment = await this.prisma.orderPayment.findFirst({
        where: { transaction_id: paymentId },
        include: { order: true }
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      const newStatus = this.mapUzumStatus(status);

      // Update payment status
      await this.prisma.orderPayment.update({
        where: { id: payment.id },
        data: { status: newStatus },
      });

      // Update order status if payment successful
      if (newStatus === 'PAID') {
        await this.prisma.order.update({
          where: { id: payment.order.id },
          data: {
            payment_status: 'PAID',
            status: 'CONFIRMED'
          },
        });
      } else if (newStatus === 'FAILED') {
        await this.prisma.order.update({
          where: { id: payment.order.id },
          data: {
            payment_status: 'FAILED'
          },
        });
      }

      this.logger.log(`Uzum payment verified: ${paymentId} - ${newStatus}`);
      return newStatus === 'PAID';
    } catch (error) {
      this.logger.error('Error verifying Uzum payment:', error);
      throw error;
    }
  }

  async handleCallback(callbackData: UzumCallbackData): Promise<any> {
    try {
      this.logger.log('Uzum callback received:', callbackData);

      // Verify signature
      const isValidSignature = this.verifySignature(callbackData);
      if (!isValidSignature) {
        this.logger.error('Invalid signature in Uzum callback');
        throw new BadRequestException('Invalid signature');
      }

      const { transaction_id, status, error_code, error_message } = callbackData;

      // Handle error cases
      if (error_code && error_code !== 0) {
        this.logger.error(`Uzum payment error: ${error_code} - ${error_message}`);
        await this.verifyPayment(transaction_id, 'failed');

        return {
          success: false,
          message: error_message || 'Payment failed',
          error_code
        };
      }

      // Verify payment
      const success = await this.verifyPayment(transaction_id, status);

      return {
        success,
        message: success ? 'Payment completed successfully' : 'Payment verification failed',
        transaction_id
      };
    } catch (error) {
      this.logger.error('Error handling Uzum callback:', error);
      return {
        success: false,
        message: 'Callback processing failed',
        error: error.message
      };
    }
  }

  async checkPaymentStatus(paymentId: string): Promise<any> {
    try {
      const checkData = {
        merchant_id: this.merchantId,
        transaction_id: paymentId,
        timestamp: new Date().toISOString()
      };

      checkData['signature'] = this.generateSignature(checkData);

      const response = await this.callUzumAPI('/payments/status', checkData);

      if (response.success) {
        // Update local payment status if needed
        await this.verifyPayment(paymentId, response.status);
      }

      return response;
    } catch (error) {
      this.logger.error('Error checking Uzum payment status:', error);
      throw new BadRequestException('Failed to check payment status');
    }
  }

  async processRefund(transactionId: string, amount: number): Promise<any> {
    try {
      const refundData = {
        merchant_id: this.merchantId,
        original_transaction_id: transactionId,
        refund_amount: Math.round(amount * 100), // Convert to tiyin
        refund_id: `refund_${Date.now()}`,
        timestamp: new Date().toISOString(),
        reason: 'Customer refund request'
      };

      refundData['signature'] = this.generateSignature(refundData);

      const response = await this.callUzumAPI('/payments/refund', refundData);

      if (response.success) {
        this.logger.log(`Uzum refund processed: ${transactionId}, Amount: ${amount}`);
      }

      return {
        success: response.success,
        refundId: refundData.refund_id,
        amount,
        message: response.message || 'Refund processed',
        uzum_response: response
      };
    } catch (error) {
      this.logger.error('Error processing Uzum refund:', error);
      throw new BadRequestException('Refund processing failed');
    }
  }

  private async callUzumAPI(endpoint: string, data: any): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      });

      return response.data;
    } catch (error) {
      this.logger.error('Uzum API call failed:', error.response?.data || error.message);

      // Return mock response for development/testing
      if (this.configService.get('NODE_ENV') === 'development') {
        return this.mockUzumResponse(endpoint, data);
      }

      throw new BadRequestException('Uzum API call failed');
    }
  }

  private mockUzumResponse(endpoint: string, data: any): any {
    // Mock responses for development
    switch (endpoint) {
      case '/payments/create':
        return {
          success: true,
          payment_url: `https://payment.uzum.uz/pay/${data.transaction_id}`,
          transaction_id: data.transaction_id,
          message: 'Payment created successfully'
        };
      case '/payments/status':
        return {
          success: true,
          status: 'paid',
          transaction_id: data.transaction_id,
          message: 'Payment completed'
        };
      case '/payments/refund':
        return {
          success: true,
          refund_id: data.refund_id,
          message: 'Refund processed successfully'
        };
      default:
        return { success: false, message: 'Unknown endpoint' };
    }
  }

  private generateSignature(data: any): string {
    // Create signature string from sorted keys
    const sortedKeys = Object.keys(data).filter(key => key !== 'signature').sort();
    const signString = sortedKeys.map(key => `${key}=${data[key]}`).join('&') + this.secretKey;

    return crypto.createHash('sha256').update(signString, 'utf8').digest('hex');
  }

  private verifySignature(data: UzumCallbackData): boolean {
    const expectedSignature = this.generateSignature(data);
    return data.signature === expectedSignature;
  }

  private buildPaymentUrl(paymentData: any): string {
    const params = new URLSearchParams({
      merchant_id: paymentData.merchant_id,
      transaction_id: paymentData.transaction_id,
      amount: paymentData.amount.toString(),
      signature: paymentData.signature
    });

    return `https://payment.uzum.uz/pay?${params.toString()}`;
  }

  private mapUzumStatus(uzumStatus: string): 'PENDING' | 'PAID' | 'FAILED' {
    switch (uzumStatus.toLowerCase()) {
      case 'success':
      case 'paid':
      case 'completed':
        return 'PAID';
      case 'failed':
      case 'error':
      case 'cancelled':
      case 'canceled':
        return 'FAILED';
      case 'pending':
      case 'processing':
      default:
        return 'PENDING';
    }
  }
}